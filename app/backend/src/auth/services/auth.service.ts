import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../common/db/prisma';
import { env } from '../../common/config/env';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AppError, ErrorCodes } from '../../common/errors/app-error';
import { audit } from '../../common/audit/audit.service';
import { TokenGenerator, OtpService } from './token-generator.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/password-recovery.dto';
import { SetupTwoFactorDto, VerifyTwoFactorDto, VerifyTwoFactorLoginDto, DisableTwoFactorDto } from '../dto/two-factor.dto';

export class AuthService {
  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('Registration failed', 400, ErrorCodes.ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
        },
      });

      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: dto.displayName,
        },
      });

      return { user, profile };
    });

    const tokens = await this.generateTokens({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
        profile: result.profile,
      },
      tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    // Check if 2FA is enabled or required
    const requiresTwoFactor = ['CLINICIAN', 'ADMIN'].includes(user.role);
    if (user.twoFactorEnabled || requiresTwoFactor) {
      // Generate 2FA session
      const otpCode = TokenGenerator.generateOtpCode();
      const sessionToken = TokenGenerator.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

      await prisma.twoFactorSession.create({
        data: {
          userId: user.id,
          token: sessionToken,
          code: otpCode,
          expiresAt,
        },
      });

      // Log the OTP code
      OtpService.logOtpCode(user.email, otpCode, user.twoFactorMethod || 'email');

      // Audit log
      await audit.userLogin(user.id, ipAddress, userAgent);

      return {
        requiresTwoFactor: true,
        twoFactorToken: sessionToken,
        message: 'A verification code has been sent. Please verify to continue.',
      };
    }

    // No 2FA required, proceed with normal login
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Audit log successful login
    await audit.userLogin(user.id, ipAddress, userAgent);

    return {
      requiresTwoFactor: false,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;

      if (!payload.sub) {
        throw new AppError('Invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
      }

      // Check if the refresh token exists in the database and is not revoked
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        throw new AppError('Invalid or expired refresh token', 401, ErrorCodes.TOKEN_EXPIRED);
      }

      // Generate new tokens
      const tokens = await this.generateTokens({
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

      // Audit log token refresh
      await audit.tokenRefresh(storedToken.user.id, undefined, undefined); // IP and UA not available in service layer

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401, ErrorCodes.TOKEN_EXPIRED);
      }
      throw error;
    }
  }

  async logout(refreshToken: string, userId?: string, ipAddress?: string, userAgent?: string) {
    // Revoke the specific refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    // Audit log logout
    if (userId) {
      await audit.userLogout(userId, ipAddress, userAgent);
    }
  }

  async logoutAll(userId: string, ipAddress?: string, userAgent?: string) {
    // Revoke all refresh tokens for the user
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Audit log logout from all devices
    await audit.userLogoutAll(userId, ipAddress, userAgent);
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.jwtAccessSecret,
      { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] },
    );

    const refreshToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] },
    );

    // Calculate refresh token expiry date
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setTime(refreshTokenExpiry.getTime() + this.parseTimeToMs(env.jwtRefreshExpiresIn));

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private parseTimeToMs(timeString: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = timeString.match(regex);

    if (!match) {
      throw new Error(`Invalid time format: ${timeString}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Invalid time unit: ${unit}`);
    }
  }

  // ==================== PASSWORD RECOVERY ====================

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Don't reveal if email exists or not for security
    if (!user) {
      return {
        message: 'If an account exists for this email, a reset link has been sent.',
      };
    }

    const resetToken = TokenGenerator.generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: expiresAt,
      },
    });

    // Log the token (placeholder for email service)
    OtpService.logResetToken(user.email, resetToken);

    // Audit log
    await audit.passwordResetRequested(user.id, user.email);

    return {
      message: 'If an account exists for this email, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, ErrorCodes.INVALID_CREDENTIALS);
    }

    const newPasswordHash = await bcrypt.hash(dto.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    // Audit log
    await audit.passwordResetCompleted(user.id, user.email);

    return { message: 'Password reset successfully' };
  }

  // ==================== 2FA ====================

  async setupTwoFactor(userId: string, dto: SetupTwoFactorDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
    }

    // For this implementation, we're using time-based OTP codes
    // In a real app, you'd generate a TOTP secret using speakeasy
    const tempSecret = TokenGenerator.generateOtpCode(); // Placeholder secret
    const sessionToken = TokenGenerator.generateSessionToken();
    const otpCode = TokenGenerator.generateOtpCode();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Session expires in 10 minutes

    // Store temporary 2FA session
    await prisma.twoFactorSession.create({
      data: {
        userId: user.id,
        token: sessionToken,
        code: otpCode,
        expiresAt,
      },
    });

    // Log the OTP code (placeholder for email/SMS service)
    OtpService.logOtpCode(user.email, otpCode, dto.method);

    // Audit log
    await audit.twoFactorSetupInitiated(user.id, dto.method);

    return {
      sessionToken,
      message: `A code has been sent to your ${dto.method}. Please verify to enable 2FA.`,
    };
  }

  async verifyTwoFactorSetup(userId: string, dto: VerifyTwoFactorDto) {
    const session = await prisma.twoFactorSession.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!session || session.userId !== userId) {
      throw new AppError('Invalid session token', 400, ErrorCodes.INVALID_CREDENTIALS);
    }

    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.twoFactorSession.delete({ where: { id: session.id } });
      throw new AppError('Verification code expired', 400, ErrorCodes.TOKEN_EXPIRED);
    }

    if (session.code !== dto.code) {
      throw new AppError('Invalid verification code', 400, ErrorCodes.INVALID_CREDENTIALS);
    }

    // Enable 2FA for the user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: session.token, // In real app, use speakeasy secret
        twoFactorMethod: 'email', // Default to email
      },
    });

    // Delete the session
    await prisma.twoFactorSession.delete({ where: { id: session.id } });

    // Audit log
    await audit.twoFactorEnabled(user.id, user.twoFactorMethod || 'email');

    return {
      message: 'Two-factor authentication enabled successfully',
      twoFactorEnabled: true,
    };
  }

  async loginWithTwoFactor(dto: VerifyTwoFactorLoginDto) {
    const session = await prisma.twoFactorSession.findUnique({
      where: { token: dto.twoFactorToken },
      include: { user: true },
    });

    if (!session) {
      throw new AppError('Invalid 2FA session', 400, ErrorCodes.INVALID_CREDENTIALS);
    }

    if (session.expiresAt < new Date()) {
      await prisma.twoFactorSession.delete({ where: { id: session.id } });
      throw new AppError('Verification code expired', 400, ErrorCodes.TOKEN_EXPIRED);
    }

    if (session.code !== dto.code) {
      throw new AppError('Invalid verification code', 400, ErrorCodes.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Delete the 2FA session
    await prisma.twoFactorSession.delete({ where: { id: session.id } });

    // Audit log
    await audit.twoFactorVerified(session.user.id);

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isActive: session.user.isActive,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      },
      tokens,
      twoFactorEnabled: session.user.twoFactorEnabled,
    };
  }

  async disableTwoFactor(userId: string, dto: DisableTwoFactorDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError('Invalid password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Audit log
    await audit.twoFactorDisabled(user.id);

    return {
      message: 'Two-factor authentication disabled',
      twoFactorEnabled: false,
    };
  }

  async checkIfTwoFactorRequired(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // 2FA is required for CLINICIAN and ADMIN roles
    const requiresTwoFactor = ['CLINICIAN', 'ADMIN'].includes(user.role);
    return user.twoFactorEnabled || requiresTwoFactor;
  }
}