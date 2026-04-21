# New Era Recovery - System Architecture

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Technology Stack](#technology-stack)
4. [Data Model](#data-model)
5. [API Design](#api-design)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Scalability & Performance](#scalability--performance)

---

## System Overview

**New Era Recovery** is a comprehensive mental health and substance abuse recovery support platform designed to provide users with:

- **Daily check-ins** with mood and craving tracking
- **Personalized recovery plans** with coping strategies
- **Crisis management** with emergency planning
- **Peer support** connections and community features
- **Milestone tracking** for sobriety anniversaries
- **Resource library** with articles, videos, and worksheets
- **Treatment provider locator** for finding local services
- **Notifications & reminders** for accountability

The platform follows a modular, event-driven architecture with a focus on privacy, security, and scalability.

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**React 19 + Vite + TypeScript**

- **Location**: `/app/frontend`
- **Components**: Feature-based organization (auth, checkins, recovery-plan, etc.)
- **State Management**: React hooks + context API
- **HTTP Client**: Axios with centralized error handling
- **Styling**: Tailwind CSS with responsive design
- **Build**: Vite for fast development and production builds

**Key Responsibilities**:
- User authentication flow
- Protected route management
- API communication
- Real-time form validation
- Toast notifications
- Responsive mobile-first UI

### 2. API Layer (Backend)

**Express 5 + TypeScript + Node.js 20**

- **Location**: `/app/backend/src`
- **Port**: 4000 (default)
- **Versioning**: `/v1/*` (new standard), legacy `/*` routes (deprecated)

**Middleware Stack** (in order):
1. Helmet - Security headers
2. CORS - Origin validation
3. JSON parsing
4. Rate limiting
5. Request logging
6. Route handlers
7. Error handler

**Request Flow**:
```
Request → CORS → JSON Parse → Rate Limit → Auth (if protected) 
  → Validation → Service Layer → Database/Cache → Response
  → Error Handler (if error)
```

### 3. Business Logic Layer (Services)

**Domain-Driven Organization**

Each module follows this structure:

```
module/
  ├── controllers/     # HTTP request handlers
  ├── services/       # Business logic & orchestration
  ├── dto/            # Input/output validation (Zod schemas)
  └── routes/         # Express routes
```

**12 Domain Modules**:

| Module | Purpose | Key Services |
|--------|---------|--------------|
| **auth** | Authentication | register, login, logout, refresh tokens |
| **users** | User management | profile, preferences, settings |
| **checkins** | Daily tracking | create check-in, get history, risk scoring |
| **recovery-plan** | Goals management | create plan, update goals, coping tools |
| **crisis-plan** | Crisis response | warning signs, emergency contacts, hotline |
| **milestones** | Achievements | track sobriety dates, badges, celebrations |
| **daily-feed** | Daily content | affirmations, prompts, readings, rotation |
| **resources** | Content library | articles, videos, worksheets, search |
| **peer-support** | Community | peer matching, requests, chat foundation |
| **treatment-locator** | Provider search | search providers, filters, locations |
| **risk-engine** | AI scoring | risk assessment, rules engine, triggers |
| **support-contacts** | Emergency | emergency contacts, priorities, notifications |

### 4. Data Access Layer (Database)

**PostgreSQL + Prisma ORM**

- **Primary DB**: PostgreSQL 15+
- **Connection**: Prisma client (type-safe, migration-managed)
- **Patterns**: 
  - One-to-one relationships for user-related entities
  - One-to-many for user's collections
  - Many-to-many for peer relationships
- **Indexing**: Strategic indexes on frequently queried columns
- **Migrations**: Version-controlled, audit trail maintained

**16 Core Models**:
```
User → UserProfile, RecoveryPreference, RecoveryPlan, CrisisPlan
     → CheckIn → RiskScore
     → Milestone, SupportContact, RefreshToken, AuditLog
     
PeerSupportRequest (User ↔ User)
Resource, TreatmentProvider, DailyFeedItem (public/content)
```

### 5. Cache Layer (Optional)

**Redis + ioredis**

- **Connection**: Graceful degradation if unavailable
- **TTLs**: 
  - Daily feed: 24h
  - User profile: 30min
  - Risk assessment: 24h
- **Strategy**: Read-through cache pattern
- **Configuration**: Env-driven, non-critical for operation

---

## Technology Stack

### Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x LTS | JavaScript runtime |
| **Framework** | Express | 5.2.1 | HTTP server |
| **Language** | TypeScript | 6.0 | Type safety |
| **Database** | PostgreSQL | 15+ | Primary data store |
| **ORM** | Prisma | 5.22 | Type-safe data access |
| **Cache** | Redis/ioredis | 5.10 | Session & content caching |
| **Auth** | jsonwebtoken | 9.0 | JWT token management |
| **Security** | bcrypt | 6.0 | Password hashing |
| | helmet | 8.1 | Security headers |
| **Logging** | Pino | 10.3 | Structured logging |
| **Validation** | Zod | 4.3 | Schema validation |
| **Testing** | Jest | 30.3 | Unit testing |
| **API Docs** | Swagger/OpenAPI | 3.x | API documentation |

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2 | UI library |
| **Language** | TypeScript | 6.0 | Type safety |
| **Build** | Vite | 8.0 | Build tool & dev server |
| **Styling** | Tailwind CSS | 4.2 | Utility CSS framework |
| **HTTP** | Axios | 1.5 | HTTP client |
| **Validation** | Zod | 4.3 | Schema validation |
| **Icons** | Lucide React | 1.8 | Icon library |
| **Animation** | Framer Motion | 12.9 | Animation library |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container** | Docker | Containerization |
| **Orchestration** | Kubernetes (AKS) | Container orchestration |
| **Package Mgmt** | Helm | K8s package manager |
| **IaC** | Terraform | Infrastructure as Code |
| **Cloud** | Azure | Cloud platform |
| **Registry** | ACR (Azure) | Container registry |
| **Secrets** | Key Vault (Azure) | Secret management |
| **CI/CD** | Azure Pipelines | Continuous integration |
| **Monitoring** | Log Analytics | Logging & monitoring |

---

## Data Model

### User Entity Relationships

```
User (1)
  ├── (1:1) UserProfile
  ├── (1:1) RecoveryPreference
  ├── (1:1) RecoveryPlan
  ├── (1:1) CrisisPlan
  ├── (1:Many) CheckIn
  ├── (1:Many) Milestone
  ├── (1:Many) SupportContact
  ├── (1:Many) RefreshToken
  ├── (1:Many) AuditLog
  ├── (1:Many) PeerSupportRequest (sender)
  └── (1:Many) PeerSupportRequest (receiver)
```

### Key Models

**User**
- id (UUID)
- email (unique)
- passwordHash
- role (USER, PEER, ADMIN, CLINICIAN)
- createdAt, updatedAt

**CheckIn**
- id (UUID)
- userId (FK)
- mood (VERY_LOW, LOW, NEUTRAL, GOOD, GREAT)
- cravingsLevel (1-10)
- triggers (text array)
- feltUnsafe (boolean)
- createdAt

**RiskScore**
- id (UUID)
- checkInId (FK, unique)
- userId (FK)
- score (0-100)
- level (LOW, MEDIUM, HIGH, CRITICAL)
- explanation (text)
- factors (JSON array)
- crisisEscalation (boolean)

**RecoveryPlan**
- goals (JSON array)
- copingTools (JSON array)
- commitments (JSON array)
- lastUpdated (timestamp)

**PeerSupportRequest**
- id (UUID)
- requesterId (FK)
- recipientId (FK)
- status (PENDING, ACCEPTED, DECLINED, BLOCKED)
- createdAt

---

## API Design

### Versioning Strategy

**Current**: `/v1/*` (standard) + `/*` (legacy, deprecated)

**Future**: Plan migration to remove legacy routes after frontend transition

### Endpoint Naming Conventions

**Pattern**: `/v1/{resource}/{action}`

**Examples**:
```
POST   /v1/auth/register          # Create user
POST   /v1/auth/login             # Authenticate
POST   /v1/auth/refresh           # Refresh tokens
POST   /v1/auth/logout            # Logout (current session)
POST   /v1/auth/logout-all        # Logout all sessions

GET    /v1/users/me               # Get current user
PUT    /v1/users/me               # Update profile
GET    /v1/users/:id              # Get user profile (if authorized)

POST   /v1/checkins              # Create check-in
GET    /v1/checkins              # Get my check-ins (paginated)
GET    /v1/checkins/:id          # Get specific check-in

GET    /v1/recovery-plan/me      # Get my recovery plan
PUT    /v1/recovery-plan/me      # Update recovery plan

POST   /v1/crisis-plan/validate  # Validate crisis plan exists
PUT    /v1/crisis-plan/me        # Update crisis plan

GET    /v1/milestones            # Get my milestones
POST   /v1/milestones            # Create milestone

GET    /v1/daily-feed            # Get today's feed
GET    /v1/daily-feed/:date      # Get specific date's feed

GET    /v1/resources             # List resources (filtered/paginated)
GET    /v1/resources/:id         # Get resource details

GET    /v1/peer-support/matches  # Get peer matches
POST   /v1/peer-support/request  # Send peer request
PATCH  /v1/peer-support/request/:id  # Accept/decline request

GET    /v1/treatment-locator/search  # Search providers
GET    /v1/treatment-locator/:id     # Get provider details

POST   /v1/risk-engine/assess    # Get risk assessment
GET    /v1/risk-engine/history   # Get past assessments

POST   /v1/support-contacts      # Add emergency contact
GET    /v1/support-contacts      # Get my contacts
PUT    /v1/support-contacts/:id  # Update contact
DELETE /v1/support-contacts/:id  # Delete contact
```

### Response Format

**Success (2xx)**:
```json
{
  "data": { /* entity or array */ },
  "meta": { "timestamp": "2026-04-17T..." }  // Optional pagination/meta
}
```

**Error (4xx/5xx)**:
```json
{
  "errorId": "val_1234_abc",
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "issues": { /* Zod validation details */ }  // For validation errors only
}
```

### Pagination

**Query params**:
```
?limit=10&offset=0
?limit=10&page=1

Response includes:
{
  "data": [...],
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 150
  }
}
```

---

## Security Architecture

### Authentication

**Strategy**: JWT-based stateless authentication

**Tokens**:
- **Access Token**: Short-lived (15 min default), used in all requests
- **Refresh Token**: Long-lived (30 days), used only to request new access token

**Token Storage** (Frontend):
- Access token: Memory (cleared on logout/refresh)
- Refresh token: HttpOnly cookie (secure, not accessible to JS)

**Token Flow**:
```
1. User registers/logs in
2. Server issues access + refresh tokens
3. Frontend stores tokens, includes access token in Authorization header
4. When access token expires, frontend calls /refresh with refresh token
5. Server validates refresh token, issues new access + refresh tokens
6. Logout revokes refresh token by marking revokedAt timestamp
```

### Authorization

**Role-Based Access Control (RBAC)**:
```
USER       → Basic user features (checkins, plans, resources)
PEER       → USER + Peer support matching
ADMIN      → Full system access, user management
CLINICIAN  → User data access, treatment management
```

**Middleware**: `rolesMiddleware` enforces role requirements on protected routes

### Data Security

**At Rest**:
- Passwords: bcrypt (salt rounds: 10)
- Sensitive fields: Can be encrypted at DB level (future)
- Secrets: Stored in Azure Key Vault, never in code

**In Transit**:
- HTTPS only in production
- CORS headers restrict origins
- Helmet enforces security headers

**Input Validation**:
- All inputs validated with Zod schemas before processing
- SQL injection safe via Prisma ORM
- XSS safe via Content-Type headers + sanitization (frontend)

### Rate Limiting

**Global**: 5 requests per 15 minutes on auth endpoints
**Strategy**: Could extend to per-endpoint limits

### Audit Trail

**Audit Log Model**: Tracks user actions
- Event type: LOGIN, LOGOUT, RISK_ASSESSMENT, PEER_REQUEST, etc.
- User ID, Resource ID, Action, IP, User-Agent
- Queryable for compliance/debugging

---

## Deployment Architecture

### Local Development

```
Docker Compose:
  - PostgreSQL (port 5432)
  - Redis (port 6379)
  - Backend (port 4000)
  - Frontend dev server (port 5173)
```

### Production (Azure Kubernetes Service)

```
Azure Resources:
  └── AKS Cluster
      ├── Backend Pods (deployment with 3+ replicas)
      │   ├── Service (ClusterIP on port 4000)
      │   ├── Ingress (HTTPS, domain: api.newerarecovery.app)
      │   └── ConfigMap (non-secret config)
      │   └── Secrets (DB_URL, JWT secrets from Key Vault)
      │
      ├── Frontend Pods (deployment, static files)
      │   ├── Service (ClusterIP on port 80/443)
      │   ├── Ingress (HTTPS, domain: app.newerarecovery.app)
      │   └── CDN (optional, for caching)
      │
      ├── PostgreSQL (Managed Azure Database for PostgreSQL)
      │   └── Automated backups, high availability
      │
      ├── Redis (Azure Cache for Redis)
      │   └── Premium tier with SSL
      │
      └── Key Vault (Azure Key Vault)
          └── Secrets: DB password, JWT secrets, API keys

Monitoring:
  └── Azure Log Analytics
      ├── Container logs
      ├── Pod performance
      └── Application metrics
```

### Helm Deployment

**Helm Chart** (`/helm/`):
- Templates for Deployment, Service, ConfigMap, Secrets
- Values overlays: dev, staging, prod
- Probes: Liveness (/healthz), Readiness (/ready)
- Resource limits: CPU 500m, Memory 512Mi

**Deployment Commands**:
```bash
# Dev environment
helm install recovery-backend ./helm -f helm/values-dev.yaml

# Production environment
helm install recovery-backend ./helm -f helm/values-prod.yaml -n production
```

### Infrastructure as Code (Terraform)

**Modules**:
- `rg/` - Resource Group
- `network/` - VNet, subnets, NSGs
- `aks/` - AKS cluster with node pools
- `acr/` - Container registry
- `kv/` - Key Vault for secrets
- `log_analytics/` - Logging & monitoring

**Environments**: `/envs/dev/`, `/envs/prod/`

**Deployment Flow**:
```
1. Develop feature locally
2. Push to GitHub (triggers CI)
3. CI runs tests, builds Docker image, pushes to ACR
4. CD deployment pipeline:
   a. Deploy to dev (automated)
   b. Run smoke tests
   c. Manual approval for prod
   d. Deploy to prod with canary/rolling strategy
```

---

## Scalability & Performance

### Horizontal Scaling

**Backend**:
- Stateless API servers (scale to 10+ pods)
- Database connection pooling (Prisma)
- Load balancer distributes traffic

**Frontend**:
- Static assets served from CDN
- No server-side session state
- Scales to many concurrent users

### Caching Strategy

**HTTP Caching**:
- Frontend static assets: 1 year cache headers
- API responses: Cache-Control headers per endpoint

**Redis Caching**:
- Daily feed: 24h TTL (high hit rate)
- User profile/preferences: 30min TTL
- Risk assessments: 24h TTL

**Cache Invalidation**:
- Manual on data changes (e.g., update profile → delete user_profile:{userId})
- TTL-based expiration

### Database Performance

**Indexes**:
- User.email (unique)
- CheckIn (userId, createdAt) composite
- PeerSupportRequest (requesterId, recipientId, status)
- TreatmentProvider (zipCode, location)

**Query Optimization**:
- Eager loading with Prisma `include`
- Pagination for large result sets
- Denormalization where necessary (JSON columns)

### Observability

**Logging**:
- Structured JSON logs (Pino)
- Correlation IDs for request tracing
- Log levels: DEBUG, INFO, WARN, ERROR

**Metrics** (Future):
- Request latency percentiles
- Error rates by endpoint
- Cache hit rates
- Database query times

**Health Checks**:
- Liveness probe: `/healthz` (basic "is alive")
- Readiness probe: `/ready` (can handle requests)

---

## Development Workflow

### Local Setup

```bash
# 1. Clone repo
git clone https://github.com/your-org/recovery-health-aid.git
cd recovery-health-aid

# 2. Copy env files
cp app/backend/.env.example app/backend/.env
cp app/frontend/.env.example app/frontend/.env.development.local

# 3. Start services
docker-compose up -d

# 4. Run migrations
npm run prisma:migrate:dev

# 5. Start development servers
npm run dev
```

### Code Structure

- **Consistency**: Each module follows the same structure (controller/service/dto/routes)
- **Type Safety**: 100% TypeScript with strict mode
- **Validation**: Zod schemas for all inputs/outputs
- **Error Handling**: Custom AppError class with correlation IDs
- **Logging**: Structured Pino logs with context

### Testing

**Test Files**:
- Unit tests: `*.test.ts` or `*.test.js`
- Test setup: `test/setup.ts`

**Run Tests**:
```bash
npm test                    # All tests
npm test -- --coverage      # With coverage
npm test -- --watch        # Watch mode
```

---

## Future Improvements

1. **API Documentation**: Auto-generate from code (OpenAPI 3.0)
2. **GraphQL Layer**: Consider GraphQL for complex queries
3. **Event System**: Kafka for async events (notifications, analytics)
4. **AI Integration**: Llama/Claude integration for better risk assessment
5. **Real-time Features**: WebSocket support for peer chat
6. **Mobile Apps**: React Native apps for iOS/Android
7. **Analytics**: Dashboards for clinicians tracking patient progress
8. **Internationalization**: Multi-language support

---

**Last Updated**: April 17, 2026  
**Status**: Production Ready
