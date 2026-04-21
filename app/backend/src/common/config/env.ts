import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),
  SHADOW_DATABASE_URL: z.string().min(1).optional(),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('30d'),

  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173,http://127.0.0.1:5173'),

  REDIS_ENABLED: z.enum(['true', 'false']).default('true'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  REDIS_CACHE_TTL: z.coerce.number().int().positive().default(3600), // 1 hour default
});

const parsed = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  databaseUrl: parsed.DATABASE_URL,
  directDatabaseUrl: parsed.DIRECT_DATABASE_URL,
  shadowDatabaseUrl: parsed.SHADOW_DATABASE_URL,
  jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsed.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: parsed.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: parsed.JWT_REFRESH_EXPIRES_IN,
  corsOrigin: parsed.CORS_ORIGIN,
  redisEnabled: parsed.REDIS_ENABLED === 'true',
  redisUrl: parsed.REDIS_URL,
  redisCacheTtl: parsed.REDIS_CACHE_TTL,
};