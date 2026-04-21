import { NextFunction, Response } from 'express';
import { UsersService } from '../services/users.service';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { UpdateProfileDto, updateProfileSchema } from '../dto/update-profile.dto';

const usersService = new UsersService();

export const getMeController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await usersService.getMe(req.user.sub);
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateMeController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await usersService.updateMe(req.user.sub, validatedData);
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};