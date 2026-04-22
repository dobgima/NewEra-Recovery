import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ZodSchema, ZodError } from 'zod';
import { ParsedQs } from 'qs';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as ParsedQs;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Query validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request params against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as ParamsDictionary;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Parameter validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  };
};