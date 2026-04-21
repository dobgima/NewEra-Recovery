import { Request, Response } from 'express';
import { prisma } from './db/prisma';
import { cacheService } from './cache/cache.service';
import { logger } from './logger/logger';

/**
 * Liveness probe - Basic health check for Kubernetes
 * Returns 200 if the service is running
 */
export const livenessController = (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 'alive',
      service: 'recovery-health-aid-backend',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Liveness probe failed');
    return res.status(503).json({
      status: 'dead',
      error: 'Service unhealthy',
    });
  }
};

/**
 * Readiness probe - Checks if service is ready to handle traffic
 * Verifies database and cache connectivity
 */
export const readinessController = async (_req: Request, res: Response) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check cache connectivity (non-critical, app works without it)
    const cacheHealth = cacheService.isHealthy();
    
    return res.status(200).json({
      status: 'ready',
      service: 'recovery-health-aid-backend',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: 'connected',
        cache: cacheHealth ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    logger.error({ error }, 'Readiness probe failed');
    return res.status(503).json({
      status: 'not_ready',
      error: 'Service dependencies not available',
      service: 'recovery-health-aid-backend',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Legacy health endpoint - kept for backward compatibility
 */
export const healthController = livenessController;