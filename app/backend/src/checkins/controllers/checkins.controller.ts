import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { createCheckInSchema } from '../dto/create-checkin.dto';
import { CheckinsService } from '../services/checkins.service';
import { AuthenticatedRequest } from '../../common/types/auth.types';

const checkinsService = new CheckinsService();

export const createCheckInController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dto = createCheckInSchema.parse(req.body);
    const result = await checkinsService.create(req.user.sub, dto);

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid check-in payload',
        issues: error.flatten(),
      });
    }

    return next(error);
  }
};

export const getMyCheckInsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await checkinsService.getMine(req.user.sub);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};