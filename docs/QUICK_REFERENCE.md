# Quick Reference: Backend Improvements

## 🚀 New Endpoints

### Authentication & Session Management
```bash
# Register user
POST /v1/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John",
  "email": "john@example.com",
  "password": "SecurePass123"
}
Response: { user, tokens: { accessToken, refreshToken } }

# Login user
POST /v1/auth/login
{ "email": "john@example.com", "password": "SecurePass123" }
Response: { user, tokens: { accessToken, refreshToken } }

# Refresh access token (token revocation validated)
POST /v1/auth/refresh
{ "refreshToken": "<refresh_token>" }
Response: { accessToken, refreshToken }

# Logout from one device
POST /v1/auth/logout
Authorization: Bearer <access_token>
{ "refreshToken": "<refresh_token>" }

# Logout from all devices
POST /v1/auth/logout-all
Authorization: Bearer <access_token>
Response: { message: "Logged out from all devices successfully" }
```

## 📚 API Documentation
```
http://localhost:4000/api-docs
```

## 🔄 API Versioning
```
All endpoints available at: /v1/*
Legacy routes maintained: /* (backward compatible)

Example:
/v1/auth/login          (new)
/auth/login             (legacy, still works)
```

## 💾 Redis Caching
```env
# Configuration
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600  # 1 hour default

# Cached resources
daily_feed:{date}              # Daily inspiration (24h)
user_profile:{userId}          # User profile (30min)
user_preferences:{userId}      # User preferences (30min)
available_peers                # Peer list
risk_assessment:{userId}:{date} # Risk assessments
```

## 📊 Audit Logging
```
Database: AuditLog table
Events: Login, Logout, Risk Assessment, Peer Requests, etc.
Tracked: User ID, IP address, User Agent, Timestamp
Query: SELECT * FROM AuditLog WHERE userId = 'xxx'
```

## 🧪 Testing
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode

# Test coverage
npm test -- --coverage
# Output: coverage/index.html
```

## 🔒 Security Features
```
✓ Rate limiting: 5 req/15min on auth endpoints
✓ CORS whitelist: CORS_ORIGIN env var
✓ Token revocation: Immediate logout
✓ Error generalization: No email enumeration
✓ Correlation IDs: Debugging & monitoring
✓ Audit logging: Compliance trail
```

## 📁 Key Files
```
src/
  auth/
    services/auth.service.ts         # Session management
    controllers/auth.controller.ts    # New logout/refresh endpoints
    routes/auth.routes.ts             # Swagger documented routes
  common/
    cache/cache.service.ts            # Redis caching
    audit/audit.service.ts            # Event logging
    config/env.ts                     # Configuration
    docs/swagger.config.ts            # API documentation
    errors/app-error.ts               # Standardized errors
test/
  setup.ts                            # Jest mocks
  auth.service.test.ts                # Example tests
```

## 🐛 Troubleshooting

### Redis Connection Failures
```
The app gracefully degrades without Redis
Check logs: Redis cache connection closed
Caching disabled but API continues working
```

### Token Revocation Not Working
```
Clear refresh_token from UI first
Ensure token is in database (check RefreshToken table)
Verify userId matches
```

### Swagger UI Not Loading
```
URL: http://localhost:4000/api-docs/
(Note trailing slash)
Check swagger.config.ts for syntax errors
```

## 📈 Monitoring

### Key Metrics
```
- Active sessions (RefreshToken table)
- Failed logins (AuditLog.eventType = 'USER_LOGIN' failures)
- Cache hit rate (measure response times)
- Audit events (compliance tracking)
```

### Health Check
```bash
curl http://localhost:4000/health
Response: { status: "ok", service: "recovery-health-aid-backend", timestamp: "..." }
```

## 🔄 Deployment Checklist
```
☐ Redis instance deployed & running
  redis-cli -c PING  # Verify
  
☐ Database migrations applied
  npm run prisma:migrate
  
☐ Environment variables set
  REDIS_URL, CORS_ORIGIN, JWT_* secrets
  
☐ SSL certificates installed
  
☐ Rate limiting tuned for production
  
☐ Monitoring configured
  - Error rate alerts
  - Response time alerts
  - Cache monitoring

☐ Audit log backups configured
  cron job for daily AuditLog exports

☐ Documentation reviewed
  Team trained on new endpoints
```

## 🆘 Support

### Error Codes
```
UNAUTHORIZED          - Missing/invalid auth
FORBIDDEN             - Insufficient permissions
INVALID_CREDENTIALS   - Wrong email/password
TOKEN_EXPIRED         - Refresh token expired
TOKEN_INVALID         - Malformed token
NOT_FOUND             - Resource not found
ALREADY_EXISTS        - Duplicate record
VALIDATION_ERROR      - Invalid input
INTERNAL_ERROR        - Server error
```

### Common Issues
```
Q: How do I test logout?
A: POST /v1/auth/logout with refreshToken in body

Q: Can I still use legacy routes?
A: Yes, /auth/login still works alongside /v1/auth/login

Q: How do I view audit logs?
A: Query AuditLog table in database
   SELECT * FROM "AuditLog" WHERE "createdAt" > NOW() - INTERVAL 1 DAY

Q: How to run tests?
A: npm test (requires database for integration tests)

Q: Impact on existing clients?
A: None - both /v1 and legacy routes work
   New features (tokens) available but optional
```

## Links & Resources
```
API Documentation:  http://localhost:4000/api-docs
Backend Code:       src/
Improvements Doc:   BACKEND_IMPROVEMENTS.md
Validation Script:  validation-simple.sh
Database Schema:    prisma/schema.prisma
Migrations:         prisma/migrations/
```

---

**Last Updated**: April 15, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready