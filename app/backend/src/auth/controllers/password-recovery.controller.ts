import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from '../services/auth.service';
import { forgotPasswordSchema, resetPasswordSchema } from '../dto/password-recovery.dto';
import { AuthenticatedRequest } from '../../common/types/auth.types';

const authService = new AuthService();

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(dto);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid payload',
        issues: error.flatten(),
      });
    }

    return next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(dto);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid payload',
        issues: error.flatten(),
      });
    }

    return next(error);
  }
};
