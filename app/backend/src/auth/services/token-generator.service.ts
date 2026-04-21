import crypto from 'crypto';

export class TokenGenerator {
  /**
   * Generate a random reset token for password recovery
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a random 6-digit OTP code for 2FA
   */
  static generateOtpCode(): string {
    const code = crypto.randomInt(0, 1000000);
    return String(code).padStart(6, '0');
  }

  /**
   * Generate a temporary session token for 2FA verification
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for storage in database
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify a token against its hash
   */
  static verifyToken(token: string, hash: string): boolean {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
  }
}

export class OtpService {
  /**
   * Format OTP code as a nice string (e.g., "123 456")
   */
  static formatOtpCode(code: string): string {
    return `${code.slice(0, 3)} ${code.slice(3, 6)}`;
  }

  /**
   * Log the OTP code (placeholder for email/SMS service)
   * In production, this would send via email or SMS
   */
  static logOtpCode(email: string, code: string, method: string): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`2FA OTP CODE for ${email}`);
    console.log(`Method: ${method.toUpperCase()}`);
    console.log(`Code: ${this.formatOtpCode(code)}`);
    console.log(`This is a placeholder - in production, send via ${method}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Log password reset token (placeholder for email service)
   */
  static logResetToken(email: string, token: string): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`PASSWORD RESET TOKEN for ${email}`);
    console.log(`Token: ${token}`);
    console.log(`This is a placeholder - in production, send via email`);
    console.log(`${'='.repeat(60)}\n`);
  }
}
