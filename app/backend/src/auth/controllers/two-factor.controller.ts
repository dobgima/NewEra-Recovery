import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from '../services/auth.service';
import {
  setupTwoFactorSchema,
  verifyTwoFactorSchema,
  verifyTwoFactorLoginSchema,
  disableTwoFactorSchema,
} from '../dto/two-factor.dto';
import { AuthenticatedRequest } from '../../common/types/auth.types';

const authService = new AuthService();

export const setupTwoFactorController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dto = setupTwoFactorSchema.parse(req.body);
    const result = await authService.setupTwoFactor(req.user.sub, dto);
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

export const verifyTwoFactorSetupController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dto = verifyTwoFactorSchema.parse(req.body);
    const result = await authService.verifyTwoFactorSetup(req.user.sub, dto);
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

export const verifyTwoFactorLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = verifyTwoFactorLoginSchema.parse(req.body);
    const result = await authService.loginWithTwoFactor(dto);
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

export const disableTwoFactorController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dto = disableTwoFactorSchema.parse(req.body);
    const result = await authService.disableTwoFactor(req.user.sub, dto);
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

export const getTwoFactorStatusController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const requiresTwoFactor = await authService.checkIfTwoFactorRequired(req.user.sub);
    return res.status(200).json({ requiresTwoFactor });
  } catch (error) {
    return next(error);
  }
};
