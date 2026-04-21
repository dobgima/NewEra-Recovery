import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../dto/login.dto';
import { registerSchema } from '../dto/register.dto';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { z } from 'zod';

const authService = new AuthService();

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = registerSchema.parse(req.body);
    const result = await authService.register(dto);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid registration payload',
        issues: error.flatten(),
      });
    }

    return next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = loginSchema.parse(req.body);
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await authService.login(dto, ipAddress, userAgent);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid login payload',
        issues: error.flatten(),
      });
    }

    return next(error);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = refreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshToken(dto.refreshToken);
    return res.status(200).json({ tokens });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid refresh token payload',
        issues: error.flatten(),
      });
    }

    return next(error);
  }
};

export const logoutController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.body.refreshToken;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    if (refreshToken) {
      await authService.logout(refreshToken, req.user?.sub, ipAddress, userAgent);
    }
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
};

export const logoutAllController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await authService.logoutAll(req.user.sub, ipAddress, userAgent);
    return res.status(200).json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    return next(error);
  }
};