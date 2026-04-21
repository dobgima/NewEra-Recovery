# New Era Recovery

**A comprehensive mental health and substance abuse recovery support platform.**

Empowering individuals in recovery with daily check-ins, personalized plans, peer support, crisis management, and evidence-based resources.

🌟 **Brand Promise**: Hope, support, and recovery—every single day.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Running the Application](#running-the-application)
- [Docker & Deployment](#docker--deployment)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security](#security)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Features

### Core Features

✅ **User Authentication**
- Secure registration and login with JWT tokens
- Refresh token flow for long-lived sessions
- Role-based access control (User, Peer, Admin, Clinician)
- Device-specific logout + logout all sessions

✅ **Daily Check-ins**
- Mood tracking (Very Low → Great scale)
- Cravings assessment (1-10 scale)
- Trigger identification
- Safety check ("Did I feel unsafe today?")

✅ **Recovery Plans**
- Personalized recovery goals
- Coping tools and strategies
- Commitment tracking
- Plan history and updates

✅ **Crisis Management**
- Crisis prevention planning
- Warning signs identification
- Emergency response steps
- Crisis hotline integration
- Emergency contact management

✅ **Peer Support**
- Connect with peer supporters in recovery
- Request matching by modality and needs
- Safe peer messaging foundation
- Community building

✅ **Milestones & Achievements**
- Track sobriety anniversaries
- Badge system for achievements
- Celebration notifications
- Progress visualization

✅ **Daily Feed**
- Personalized affirmations
- Recovery prompts
- Educational readings
- Daily rotation system

✅ **Resource Library**
- Articles on recovery topics
- Videos and tutorials
- Worksheets and tools
- Search and filtering
- Favorites and bookmarks

✅ **Treatment Provider Locator**
- Find local treatment facilities
- Filter by location, modalities, insurance
- Provider ratings and details
- Crisis support identification

✅ **Risk Assessment Engine**
- AI-based risk scoring from check-in data
- Early warning system
- Personalized recommendations
- Encouragement messaging

✅ **Audit & Compliance**
- Comprehensive audit logging
- HIPAA-ready compliance trail
- User action tracking
- Security monitoring

---

## Tech Stack

### Backend

```
Node.js 20 LTS
├── Express 5.2 (HTTP Framework)
├── TypeScript 6.0 (Type Safety)
├── PostgreSQL 15+ (Primary Database)
├── Prisma 5.22 (ORM)
├── Redis (Caching)
├── JWT (Authentication)
├── Zod (Validation)
└── Pino (Logging)
```

### Frontend

```
React 19
├── Vite 8.0 (Build Tool)
├── TypeScript 6.0 (Type Safety)
├── Tailwind CSS 4.2 (Styling)
├── Axios (HTTP Client)
├── Zod (Validation)
├── Framer Motion (Animations)
└── Lucide React (Icons)
```

### Infrastructure

```
Azure Cloud
├── AKS (Kubernetes Orchestration)
├── ACR (Container Registry)
├── Key Vault (Secrets Management)
├── Azure Database for PostgreSQL
├── Azure Cache for Redis
└── Log Analytics (Monitoring)
```

---

## Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/products/docker-desktop))
- Git
- PostgreSQL 15+ (if running without Docker)
- Redis (if running without Docker, optional)

### One Command Setup (Docker)

```bash
git clone https://github.com/your-org/recovery-health-aid.git
cd recovery-health-aid
docker-compose up
```

Access the app:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs
- **Health Check**: http://localhost:4000/health

---

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/recovery-health-aid.git
cd recovery-health-aid
```

### 2. Backend Setup

```bash
cd app/backend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Setup database (with Docker)
docker-compose up -d postgres redis

# Run migrations
npm run prisma:migrate:dev

# Generate Prisma client
npm run prisma:generate
```

**Edit `.env` file** with your local configuration:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recovery_health_aid
JWT_ACCESS_SECRET=dev-secret-change-me
JWT_REFRESH_SECRET=dev-secret-change-me
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

### 3. Frontend Setup

```bash
cd app/frontend

# Copy environment template
cp .env.example .env.development.local

# Install dependencies
npm install
```

**Edit `.env.development.local`** with:

```env
VITE_API_BASE=http://localhost:4000
VITE_ENV=development
VITE_APP_NAME=New Era Recovery
```

### 4. Start Development Servers

**Terminal 1: Backend**
```bash
cd app/backend
npm run dev
# Server running on http://localhost:4000
```

**Terminal 2: Frontend**
```bash
cd app/frontend
npm run dev
# App running on http://localhost:5173
```

**Terminal 3: Database (if not using Docker)**
```bash
# Start PostgreSQL and Redis using Docker
docker-compose up
```

---

## Running the Application

### Development

```bash
# From project root

# Start all services (Docker Compose)
docker-compose up -d

# Start backend with hot reload
cd app/backend && npm run dev

# Start frontend with hot reload (in another terminal)
cd app/frontend && npm run dev
```

### Testing

```bash
# Backend tests
cd app/backend
npm test                    # Run all tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # With coverage report

# Frontend tests (when implemented)
cd app/frontend
npm test
```

### Linting & Formatting

```bash
# Backend
cd app/backend
npm run lint              # Check code quality
npm run lint:fix          # Auto-fix issues
npm run format            # Format with Prettier
npm run type-check        # TypeScript check

# Frontend
cd app/frontend
npm run lint
npm run lint:fix
npm run format
npm run type-check
```

### Database

```bash
cd app/backend

# Create new migration
npm run prisma:migrate:dev

# Reset database (warning: deletes all data)
npm run prisma:reset

# Open Prisma Studio (GUI)
npm run prisma:studio

# Generate Prisma client after schema changes
npm run prisma:generate
```

---

## Docker & Deployment

### Local Docker Setup

**Build Docker Image** (for backend):

```bash
cd app/backend

# Build
docker build -t recovery-health-aid-backend:latest .

# Run
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://user:pass@postgres:5432/db" \
  -e JWT_ACCESS_SECRET="your-secret" \
  -e JWT_REFRESH_SECRET="your-secret" \
  recovery-health-aid-backend:latest
```

**Docker Compose** (all services):

```bash
# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down

# Reset (delete data)
docker-compose down -v
```

### Kubernetes Deployment (Azure AKS)

**Prerequisites**:
- Azure CLI logged in
- kubectl configured
- Helm installed

**Deploy Backend**:

```bash
cd app/backend/helm

# Dev environment
helm install recovery-backend . \
  -f values-dev.yaml \
  --namespace recovery-dev \
  --create-namespace

# Production environment
helm install recovery-backend . \
  -f values-prod.yaml \
  --namespace recovery-prod \
  --create-namespace
```

**Check Deployment**:

```bash
# Check pods
kubectl get pods -n recovery-dev

# View logs
kubectl logs -f deployment/recovery-backend -n recovery-dev

# Port forward for local testing
kubectl port-forward svc/recovery-backend 4000:4000 -n recovery-dev
```

**Update Deployment**:

```bash
helm upgrade recovery-backend . \
  -f values-prod.yaml \
  --namespace recovery-prod
```

### Infrastructure Setup (Terraform)

**Initialize infrastructure**:

```bash
cd infra/terraform

# Format
terraform fmt -recursive

# Validate
terraform validate

# Plan (dev)
terraform plan -var-file="envs/dev/terraform.tfvars"

# Apply (dev)
terraform apply -var-file="envs/dev/terraform.tfvars"
```

**Update infrastructure**:

```bash
# Make changes to modules
# Then:
terraform plan -var-file="envs/prod/terraform.tfvars"
terraform apply -var-file="envs/prod/terraform.tfvars"
```

---

## Configuration

### Environment Variables

#### Backend

Required variables in `.env`:

```env
# Core
NODE_ENV=development|production|test
PORT=4000

# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_DATABASE_URL=         # Optional: for migrations
SHADOW_DATABASE_URL=         # Optional: for Prisma

# Authentication (REQUIRED - strong secrets!)
JWT_ACCESS_SECRET=           # Use: openssl rand -hex 32
JWT_REFRESH_SECRET=          # Use: openssl rand -hex 32
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# CORS & Security
CORS_ORIGIN=http://localhost:5173,https://app.example.com

# Redis (Optional - app works without it)
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600
```

#### Frontend

Required variables in `.env.development.local` or `.env.production.local`:

```env
VITE_API_BASE=http://localhost:4000
VITE_ENV=development
VITE_APP_NAME=New Era Recovery
```

### Database

**Default credentials** (development):
- User: `postgres`
- Password: `postgres`
- Database: `recovery_health_aid`
- Host: `localhost:5432`

**Migrations**:
- All migrations tracked in `prisma/migrations/`
- Automatic on `npm run prisma:migrate:dev`
- Manual apply: `npx prisma migrate deploy`

---

## API Documentation

### Accessing API Documentation

**Swagger UI** (interactive):
- Development: http://localhost:4000/api-docs
- Production: https://api.newerarecovery.app/api-docs

### API Endpoints

**Base URL**: `http://localhost:4000/v1` (or `http://localhost:4000` for legacy routes)

**Authentication**: Include `Authorization: Bearer {token}` header

See [API.md](docs/QUICK_REFERENCE.md) for complete endpoint reference.

### Example Requests

**Register**:
```bash
curl -X POST http://localhost:4000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "JD",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

**Create Check-in**:
```bash
curl -X POST http://localhost:4000/v1/checkins \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "GOOD",
    "cravingsLevel": 3,
    "triggers": ["stress", "fatigue"],
    "feltUnsafe": false
  }'
```

---

## Project Structure

```
recovery-health-aid/
├── app/
│   ├── backend/                 # Express API
│   │   ├── src/
│   │   │   ├── app.ts          # Express setup
│   │   │   ├── main.ts         # Server entry point
│   │   │   ├── common/         # Shared utilities
│   │   │   │   ├── config/     # Environment validation
│   │   │   │   ├── middleware/ # Request handling
│   │   │   │   ├── cache/      # Redis service
│   │   │   │   ├── errors/     # Error handling
│   │   │   │   ├── logger/     # Pino logging
│   │   │   │   ├── db/         # Prisma client
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── utils/      # Utilities
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── users/          # User management
│   │   │   ├── checkins/       # Check-in tracking
│   │   │   ├── recovery-plan/  # Recovery goals
│   │   │   ├── crisis-plan/    # Crisis planning
│   │   │   ├── milestones/     # Achievements
│   │   │   ├── daily-feed/     # Daily content
│   │   │   ├── resources/      # Resource library
│   │   │   ├── peer-support/   # Peer matching
│   │   │   ├── treatment-locator/ # Provider search
│   │   │   ├── risk-engine/    # Risk assessment
│   │   │   └── support-contacts/ # Emergency contacts
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── migrations/     # Migration history
│   │   ├── helm/               # Kubernetes charts
│   │   ├── Dockerfile          # Container definition
│   │   ├── docker-compose.yml  # Local dev services
│   │   ├── package.json        # Dependencies
│   │   └── tsconfig.json       # TypeScript config
│   └── frontend/               # React app
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks
│       │   ├── lib/            # Utilities
│       │   └── types/          # TypeScript types
│       ├── package.json
│       └── vite.config.ts
├── infra/
│   └── terraform/              # Infrastructure as Code
│       ├── envs/
│       │   ├── dev/
│       │   └── prod/
│       └── modules/
├── ci/
│   └── azure-pipelines/        # CI/CD pipeline definitions
├── docs/                       # Documentation
│   ├── architecture.md         # System architecture
│   ├── API.md                  # API reference
│   ├── QUICK_REFERENCE.md      # Quick start guide
│   ├── security.md             # Security practices
│   ├── dev-env.md              # Development setup
│   └── ops-runbook.md          # Operations guide
└── README.md                   # This file
```

---

## Security

### Best Practices

✅ **Secrets Management**
- Never commit `.env` files to Git
- Store secrets in Azure Key Vault (production)
- Use strong random values for JWT secrets (`openssl rand -hex 32`)

✅ **Authentication**
- JWT tokens with expiration
- Refresh token revocation on logout
- Secure password hashing (bcrypt)
- HttpOnly cookies for refresh tokens

✅ **Authorization**
- Role-based access control (RBAC)
- API endpoints protected with `@authMiddleware`
- Role requirements enforced per route

✅ **Data Protection**
- HTTPS/TLS in production
- Input validation with Zod schemas
- SQL injection prevention (Prisma ORM)
- XSS prevention (Content-Type headers)

✅ **Compliance**
- HIPAA-ready audit logging
- User action tracking
- Data retention policies (implement per regulations)

### Security Checklist

- [ ] Update JWT secrets from defaults
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Review Role-Based Access Control
- [ ] Set up Azure Key Vault
- [ ] Enable database encryption
- [ ] Configure rate limiting
- [ ] Monitor security logs
- [ ] Regular dependency updates: `npm audit`

---

## Contributing

### Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Code with TypeScript + Zod validation
3. **Test locally**: `npm test`
4. **Lint & format**: `npm run lint:fix && npm run format`
5. **Commit**: `git commit -m "feat: description"`
6. **Push**: `git push origin feature/my-feature`
7. **Create PR**: Follow PR template
8. **Code review**: Get approval from team
9. **Merge to main**: Triggers CI/CD pipeline

### Code Standards

- **Language**: TypeScript with strict mode
- **Validation**: Zod schemas for all inputs
- **Naming**: camelCase for variables, PascalCase for classes/types
- **Error Handling**: Use AppError for operational errors
- **Logging**: Structured logs with context
- **Testing**: Aim for >80% coverage
- **Documentation**: JSDoc comments for public APIs

### Module Structure

Each domain module follows:

```
module/
├── controllers/         # Route handlers
│   └── {entity}.controller.ts
├── services/           # Business logic
│   └── {entity}.service.ts
├── dto/               # Validation schemas
│   └── {entity}.dto.ts
└── routes/            # Express routes
    └── {entity}.routes.ts
```

---

## Troubleshooting

### Common Issues

**Problem**: `PostgreSQL connection refused`

```bash
# Solution: Start PostgreSQL
docker-compose up postgres

# Or check if port 5432 is in use
lsof -i :5432
```

**Problem**: `Redis connection errors`

```bash
# Solution: Redis is optional, app works without it
# Or start Redis:
docker-compose up redis
```

**Problem**: `JWT secret error in production`

```bash
# Solution: Generate strong secrets
openssl rand -hex 32

# Update in Key Vault:
az keyvault secret set --vault-name your-vault \
  --name JWT-ACCESS-SECRET \
  --value $(openssl rand -hex 32)
```

**Problem**: `Prisma migration conflicts`

```bash
# Solution: Resolve manually
npm run prisma:migrate:resolve -- --rolled-back

# Or reset (dev only!)
npm run prisma:reset
```

**Problem**: `Frontend can't reach backend`

```bash
# Check backend is running
curl http://localhost:4000/health

# Check CORS_ORIGIN includes frontend URL
# In .env: CORS_ORIGIN=http://localhost:5173

# Check frontend has correct API base
# In .env.development.local: VITE_API_BASE=http://localhost:4000
```

**Problem**: `Docker image build fails`

```bash
# Solution: Ensure OpenSSL is included (Prisma dependency)
# Check Dockerfile has: RUN apt-get install -y openssl ca-certificates
```

### Health Checks

```bash
# Backend health
curl http://localhost:4000/health

# Backend readiness
curl http://localhost:4000/ready

# Database connectivity
docker exec postgres psql -U postgres -c "SELECT 1"

# Redis connectivity
docker exec redis redis-cli PING
```

### Logs

**Backend logs**:
```bash
# Docker
docker logs recovery-health-aid-backend

# Local development
# Logs appear in terminal where you ran `npm run dev`

# Structured logs (JSON)
NODE_ENV=production npm run dev 2>&1 | grep -i error
```

**Frontend logs**:
```bash
# Browser console (F12)
# React DevTools (Chrome extension)
```

**Kubernetes logs**:
```bash
# Container logs
kubectl logs -f deployment/recovery-backend -n recovery-dev

# Previous crashes
kubectl logs --previous deployment/recovery-backend -n recovery-dev

# All pod logs
kubectl logs -l app=recovery-backend -n recovery-dev --all-containers=true
```

---

## Support

### Getting Help

- **Documentation**: See `/docs/` directory
- **API Reference**: http://localhost:4000/api-docs
- **GitHub Issues**: Report bugs on GitHub
- **Security Issues**: Contact security@newerarecovery.app
- **Community**: Join our Slack/Discord (link)

### Resources

- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/QUICK_REFERENCE.md)
- [Security Guide](docs/security.md)
- [Operations Runbook](docs/ops-runbook.md)

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Code of Conduct

We are committed to providing a welcoming and inspiring community. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

---

**Made with ❤️ for recovery.**

*Last Updated*: April 17, 2026  
*Version*: 1.0.0  
*Status*: Production Ready
