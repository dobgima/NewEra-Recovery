import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { requestLogger } from './common/middleware/request-logger';
import { errorHandler } from './common/middleware/error-handler';
import { apiRateLimit } from './common/middleware/rate-limit.middleware';
import { healthController, livenessController, readinessController } from './common/health.controller';
import { env } from './common/config/env';
import { cacheService } from './common/cache/cache.service';
import { swaggerUi, specs } from './common/docs/swagger.config';

import authRoutes from './auth/routes/auth.routes';
import usersRoutes from './users/routes/users.routes';
import checkinsRoutes from './checkins/routes/checkins.routes';
import recoveryPlanRoutes from './recovery-plan/routes/recovery-plan.routes';
import crisisPlanRoutes from './crisis-plan/routes/crisis-plan.routes';
import milestonesRoutes from './milestones/routes/milestones.routes';
import dailyFeedRoutes from './daily-feed/routes/daily-feed.routes';
import resourcesRoutes from './resources/routes/resources.routes';
import peerSupportRoutes from './peer-support/routes/peer-support.routes';
import treatmentLocatorRoutes from './treatment-locator/routes/treatment-locator.routes';
import riskEngineRoutes from './risk-engine/routes/risk-engine.routes';
import supportContactsRoutes from './support-contacts/routes/support-contacts.routes';

export const app = express();

// Initialize cache connection
cacheService.connect().catch((error) => {
  console.error('Failed to connect to Redis cache:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await cacheService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await cacheService.disconnect();
  process.exit(0);
});

app.use(helmet());
app.use(cors({
  origin: env.corsOrigin.split(',').map((origin) => origin.trim()),
  credentials: true,
}));
app.use(express.json());
app.use(apiRateLimit); // General API rate limiting
app.use(requestLogger);

// Health check endpoints (no versioning needed)
// Liveness probe - basic "is running" check
app.get('/health', livenessController);
app.get('/healthz', livenessController); // Kubernetes standard
app.get('/healthy', livenessController); // Common alias

// Readiness probe - checks if service can handle requests
app.get('/ready', readinessController);
app.get('/readiness', readinessController); // Kubernetes standard

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Version 1
const v1Router = express.Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/users', usersRoutes);
v1Router.use('/checkins', checkinsRoutes);
v1Router.use('/recovery-plan', recoveryPlanRoutes);
v1Router.use('/crisis-plan', crisisPlanRoutes);
v1Router.use('/milestones', milestonesRoutes);
v1Router.use('/daily-feed', dailyFeedRoutes);
v1Router.use('/resources', resourcesRoutes);
v1Router.use('/peer-support', peerSupportRoutes);
v1Router.use('/treatment-locator', treatmentLocatorRoutes);
v1Router.use('/risk-engine', riskEngineRoutes);
v1Router.use('/support-contacts', supportContactsRoutes);

app.use('/v1', v1Router);

// Removed legacy routes - frontend has been migrated to use /v1 API paths
// Old routes that were at root level have been consolidated under /v1
// This ensures proper API versioning and prevents route conflicts
// Legacy routes migration completed on April 17, 2026

app.use(errorHandler);