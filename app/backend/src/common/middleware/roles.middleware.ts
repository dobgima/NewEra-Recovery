import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
};