# New Era Recovery - Production Setup Guide

> Last Updated: April 17, 2026 | Status: Production Ready ✅

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Docker Setup](#docker-setup)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Redis Setup](#redis-setup)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

```bash
# macOS (using Homebrew)
brew install node@20 postgresql redis

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nodejs postgresql postgresql-contrib redis-server

# Windows (using Chocolatey)
choco install nodejs postgresql redis
```

### 1. Clone and Install

```bash
git clone https://github.com/yourorg/recovery-health-aid.git
cd recovery-health-aid

# Install backend dependencies
cd app/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ../..
```

### 2. Configure Environment

#### Backend

```bash
cd app/backend
cp .env.example .env
```

Edit `.env`:

```env
# Database (must be running locally or remote)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recovery_health_aid

# Secrets (generate new ones)
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Redis (optional for dev)
REDIS_ENABLED=false  # Set to true if Redis is running

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend

```bash
cd app/frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/v1
```

### 3. Start Services

```bash
# Terminal 1: Start PostgreSQL
brew services start postgresql
# Or on Linux: sudo systemctl start postgresql

# Terminal 2: Start Redis (optional)
brew services start redis
# Or on Linux: sudo systemctl start redis-server

# Terminal 3: Start Backend
cd app/backend
npm run dev

# Terminal 4: Start Frontend
cd app/frontend
npm run dev
```

**Frontend**: http://localhost:5173  
**Backend API**: http://localhost:4000

### 4. Database Setup

```bash
cd app/backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database with test data
npm run prisma:seed
```

### 5. View Swagger Documentation

```
http://localhost:4000/api-docs
```

---

## Docker Setup

### Build Docker Image

```bash
cd app/backend

# Build for development
docker build -t recovery-health-aid-backend:dev -f Dockerfile .

# Or for production
docker build -t recovery-health-aid-backend:prod -f Dockerfile .
```

### Run Docker Container

```bash
docker run -d \
  --name recovery-backend \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://user:pass@host:port/db" \
  -e JWT_ACCESS_SECRET="your-secret-here" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  recovery-health-aid-backend:prod
```

### Docker Compose (Full Stack)

```bash
# From repository root
docker-compose up -d
```

Access:
- **API**: http://localhost:4000
- **Frontend**: http://localhost:3000

---

## Kubernetes Deployment

### Prerequisites

```bash
# Install tools
brew install kubectl helm

# Configure kubectl to connect to your AKS cluster
az aks get-credentials --resource-group YourResourceGroup --name YourCluster
```

### Deploy Backend

```bash
cd app/backend/helm

# Development
helm upgrade --install recovery-backend . \
  -f values.yaml \
  -f values-dev.yaml \
  --namespace default

# Production
helm upgrade --install recovery-backend . \
  -f values.yaml \
  -f values-prod.yaml \
  --namespace production
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -l app.kubernetes.io/name=backend

# Check service
kubectl get svc recovery-backend-backend

# Check ingress
kubectl get ingress recovery-backend-backend

# View logs
kubectl logs -l app.kubernetes.io/name=backend -f

# Port forward to test locally
kubectl port-forward svc/recovery-backend-backend 4000:4000
```

### Health Checks

```bash
# Liveness probe (is the app running?)
curl http://localhost:4000/health

# Readiness probe (is the app ready to serve traffic?)
curl http://localhost:4000/readiness

# Both should return 200 OK with health status JSON
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | No | `development` | `development`, `test`, `production` |
| `PORT` | No | `4000` | Server port |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | **Yes** | - | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | **Yes** | - | Generate with `openssl rand -hex 32` |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Token expiration time |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Refresh token expiration |
| `CORS_ORIGIN` | No | `localhost:5173` | Comma-separated allowed origins |
| `REDIS_ENABLED` | No | `true` | Enable/disable Redis caching |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL |
| `REDIS_CACHE_TTL` | No | `3600` | Cache TTL in seconds |

### Frontend Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `VITE_API_BASE_URL` | No | `http://localhost:4000/v1` | Backend API URL |
| `VITE_APP_NAME` | No | `New Era Recovery` | Application title |

---

## Database Setup

### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql
brew services start postgresql

# Create database and user
createuser recovery_user -P  # Set password when prompted
createdb -O recovery_user recovery_health_aid
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Connect as postgres user
sudo -u postgres psql

# Create database and user
CREATE USER recovery_user WITH PASSWORD 'secure_password';
CREATE DATABASE recovery_health_aid OWNER recovery_user;
\q
```

### Run Migrations

```bash
cd app/backend

# Development - creates migrations interactively
npm run prisma:migrate

# Production - applies existing migrations
npx prisma migrate deploy

# View database with Prisma Studio
npm run prisma:studio
```

### Database Backup

```bash
# Backup
pg_dump recovery_health_aid > backup.sql

# Restore
psql recovery_health_aid < backup.sql
```

---

## Redis Setup

### Installation & Running

**macOS:**
```bash
brew install redis
brew services start redis

# Test connection
redis-cli ping  # Should return PONG
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server

# Test connection
redis-cli ping  # Should return PONG
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Monitoring Redis

```bash
# Connect to Redis CLI
redis-cli

# Check connection
ping

# View all keys
keys *

# Get cache size
info memory

# Clear all cache (WARNING: affects all apps)
flushall

# Exit
exit
```

### Disable Redis for Development

If Redis is not running, the application will still work without caching. To explicitly disable Redis:

```env
# .env
REDIS_ENABLED=false
```

The app will log:
```
Redis caching is disabled (REDIS_ENABLED=false)
```

---

## Troubleshooting

### Backend Won't Start

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: PostgreSQL is not running
```bash
brew services start postgresql
```

---

**Issue**: `JWT_ACCESS_SECRET is not set`

**Solution**: Environment variables not configured
```bash
cd app/backend
cp .env.example .env
# Edit .env with your values
```

---

### Redis Connection Retries (Infinite Loop)

**Issue**: App logs endless Redis retry messages

**Status**: ✅ FIXED in v1.0
- Max retries now capped at 5
- Exponential backoff with jitter implemented  
- Cache is truly optional (set `REDIS_ENABLED=false`)

**If Still Experiencing**:
```env
# Disable Redis temporarily
REDIS_ENABLED=false

# Or check logs for actual Redis issues
# If Redis is down, app should continue normally
```

---

### Database Connection Issues

**Issue**: `Error: connect ETIMEDOUT`

**Solution**: Check PostgreSQL is running and accessible:
```bash
# Test connection
psql -U postgres -h localhost

# Check if service is running
brew services list | grep postgres
```

---

### API Not Responding

**Issue**: Requests to http://localhost:4000 timeout

**Solution**:
```bash
# Check if backend is running
ps aux | grep node

# Check logs
npm run dev  # Run in foreground to see logs

# Check port is free
lsof -i :4000

# Kill process if needed
kill -9 <PID>
```

---

### Kubernetes Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check health endpoints
kubectl port-forward svc/recovery-backend-backend 4000:4000
curl http://localhost:4000/health
```

---

## Monitoring & Health

### Health Endpoint

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-17T12:00:00Z",
  "uptime": 3600,
  "checks": {
    "database": "connected",
    "redis": "connected" // "disabled" if REDIS_ENABLED=false
  }
}
```

### Request Logging

All requests are logged via Pino in JSON format:
```bash
# Pretty-print logs (development)
npm run dev | npx pino-pretty
```

### Performance Monitoring

See [ops-runbook.md](./docs/ops-runbook.md) for:
- Application metrics
- Database monitoring
- Memory/CPU tracking
- Alert configuration

---

## Production Checklist

- [ ] Database backups configured
- [ ] Redis persistence enabled
- [ ] JWT secrets rotated and strong
- [ ] CORS origins restricted to your domains
- [ ] SSL/TLS certificates installed
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Log aggregation set up
- [ ] Rate limiting tested
- [ ] Load testing completed

---

## Next Steps

1. **[Architecture Documentation](./docs/architecture.md)** - System design overview
2. **[API Reference](http://localhost:4000/api-docs)** - Interactive Swagger docs
3. **[Security Guide](./docs/security.md)** - Security best practices
4. **[Operations Runbook](./docs/ops-runbook.md)** - Production operations

---

**Need Help?** See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) or contact DevOps team.
