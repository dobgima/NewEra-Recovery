import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { logger } from '../logger/logger';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Handle AppError instances
  if (error instanceof AppError) {
    // Log operational errors with appropriate level
    if (error.statusCode >= 500) {
      logger.error({
        errorId: error.errorId,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    } else if (error.statusCode >= 400) {
      logger.warn({
        errorId: error.errorId,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
      });
    }

    return res.status(error.statusCode).json({
      errorId: error.errorId,
      message: error.message,
      code: error.code,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errorId = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.warn({
      errorId,
      message: 'Validation failed',
      issues: error.flatten(),
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      errorId,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      issues: error.flatten(),
    });
  }

  // Handle generic errors
  if (error instanceof Error) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.error({
      errorId,
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    return res.status(500).json({
      errorId,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }

  // Handle unknown errors
  const errorId = `unk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  logger.error({
    errorId,
    message: 'Unknown error occurred',
    error,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    errorId,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};