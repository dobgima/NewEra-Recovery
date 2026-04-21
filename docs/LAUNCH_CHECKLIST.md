# New Era Recovery - Pre-Launch Checklist

**Status**: April 17, 2026  
**Target**: Production Launch  

---

## ✅ Code Changes Complete

### Backend Improvements
- [x] Fixed type safety issue (users.service.ts)
- [x] Integrated audit logging (users.service.ts)
- [x] Fixed Redis retry logic (cache.service.ts)
- [x] Added REDIS_ENABLED env variable (config/env.ts)
- [x] Removed legacy routes (app.ts)
- [x] Updated .env.example documentation

### Infrastructure
- [x] Fixed Dockerfile (non-root user + health check)
- [x] Created Helm ingress template
- [x] Created Pod Disruption Budget template
- [x] Updated Helm values (dev)
- [x] Updated Helm values (prod)
- [x] Standardized health probe paths

### Documentation
- [x] Created SETUP.md (comprehensive)
- [x] Created AUDIT_REPORT.md (detailed findings)
- [x] Created EXECUTIVE_SUMMARY.md (overview)
- [x] Updated README.md references

---

## 🏗️ Infrastructure Setup (DevOps Team)

### Azure Resources
- [ ] Create Azure Kubernetes Service (AKS) cluster
  - [ ] Node pool: 2 nodes minimum
  - [ ] Auto-scaling: 2-4 nodes
  - [ ] Network: Private with public ingress
  
- [ ] Create Azure Container Registry (ACR)
  - [ ] Enable webhook for CI/CD
  - [ ] Set up managed identity
  
- [ ] Create Azure Database for PostgreSQL
  - [ ] Dev: Single server (burstable)
  - [ ] Prod: Flexible server with read replicas
  - [ ] Backup: Daily, 30-day retention
  - [ ] SSL/TLS: Enforced
  
- [ ] Create Azure Cache for Redis
  - [ ] SKU: Basic (dev), Standard (prod)
  - [ ] Replication: Enabled for prod
  - [ ] Firewall: Restrict to AKS subnet
  
- [ ] Create Azure Key Vault
  - [ ] Store JWT secrets
  - [ ] Store database passwords
  - [ ] Store Redis connection string
  - [ ] Enable audit logging
  
- [ ] Create Log Analytics Workspace
  - [ ] Link to AKS
  - [ ] Link to App Insights
  - [ ] Retention: 30 days

### Azure Networking
- [ ] Create Virtual Network
  - [ ] Subnet for AKS
  - [ ] Subnet for databases
  - [ ] Service endpoints for PaaS services
  
- [ ] Create Network Security Groups
  - [ ] AKS: Allow 443 (HTTPS), 80 (HTTP)
  - [ ] Database: Allow from AKS only
  - [ ] Redis: Allow from AKS only
  
- [ ] Create Application Gateway (or NGINX Ingress)
  - [ ] Public IP address
  - [ ] WAF rules enabled
  - [ ] SSL/TLS certificates

---

## 🔧 CI/CD Pipeline Setup (DevOps Team)

### Backend Pipeline
- [ ] Create build stage
  - [ ] Checkout code
  - [ ] Run npm install
  - [ ] Run npm run build
  - [ ] Run linting
  - [ ] Run tests (auth tests at minimum)
  
- [ ] Create test stage
  - [ ] Run unit tests
  - [ ] Check code coverage
  - [ ] Run security scanning
  
- [ ] Create push stage
  - [ ] Build Docker image
  - [ ] Push to ACR
  - [ ] Tag with git SHA
  - [ ] Tag as latest
  
- [ ] Create deploy stage
  - [ ] Validate Helm chart
  - [ ] Deploy to dev (auto)
  - [ ] Run smoke tests
  - [ ] Deploy to staging (manual approval)
  - [ ] Run integration tests
  - [ ] Deploy to prod (manual approval)

### Frontend Pipeline
- [ ] Create build stage
  - [ ] Checkout code
  - [ ] Run npm install
  - [ ] Run npm run build
  - [ ] Check bundle size
  
- [ ] Create test stage
  - [ ] Run linting
  - [ ] Check TypeScript
  - [ ] Build optimization check
  
- [ ] Create deploy stage
  - [ ] Deploy to dev environment
  - [ ] Deploy to staging environment
  - [ ] Deploy to production

### Pipeline Configuration
- [ ] Store secrets in Key Vault
- [ ] Configure branch protection
  - [ ] Require PR reviews
  - [ ] Require CI/CD pass
- [ ] Set up notifications
  - [ ] Slack for builds
  - [ ] Email for failures

---

## 📊 Monitoring & Logging Setup (DevOps Team)

### Application Monitoring
- [ ] Configure Application Insights
  - [ ] Link to backend service
  - [ ] Configure dependency tracking
  - [ ] Set up request tracing
  - [ ] Configure exception tracking
  
- [ ] Configure alerting
  - [ ] High error rate (>5%)
  - [ ] High latency (>1s)
  - [ ] Database connection errors
  - [ ] Redis connection errors
  - [ ] Pod crashes/restarts
  
- [ ] Set up dashboards
  - [ ] Request rate (req/sec)
  - [ ] Response times (p50, p95, p99)
  - [ ] Error rates by endpoint
  - [ ] Database query times
  - [ ] Cache hit rate (Redis)
  - [ ] Pod resource usage

### Logging
- [ ] Configure Log Analytics
  - [ ] Send container logs
  - [ ] Send application logs
  - [ ] Send access logs
  
- [ ] Create log queries
  - [ ] Error tracking
  - [ ] Performance analysis
  - [ ] Audit trail queries
  
- [ ] Set up log retention
  - [ ] 30 days: Hot storage
  - [ ] 90 days: Archive storage

### Security Monitoring
- [ ] Configure audit logging
  - [ ] All API access
  - [ ] User authentication events
  - [ ] Admin actions
  - [ ] Sensitive data access
  
- [ ] Set up alerts for
  - [ ] Multiple failed logins
  - [ ] Privilege escalation attempts
  - [ ] Unauthorized access attempts
  - [ ] Rate limit violations

---

## 🔐 Security Hardening (Security Team)

### Kubernetes Security
- [ ] Configure Network Policies
  - [ ] Restrict ingress/egress
  - [ ] Database access from pods only
  - [ ] Redis access from pods only
  
- [ ] Configure Pod Security Policies
  - [ ] No privileged containers
  - [ ] No root user
  - [ ] Read-only filesystems
  
- [ ] Configure RBAC
  - [ ] Service accounts with minimal permissions
  - [ ] Role binding for CI/CD
  - [ ] Separate service accounts per env

### Secrets Management
- [ ] Rotate JWT secrets
  - [ ] Generate new 256-bit secrets
  - [ ] Store in Key Vault
  - [ ] Configure auto-rotation (annual)
  
- [ ] Rotate database passwords
  - [ ] Set strong random password
  - [ ] Store in Key Vault
  - [ ] Document rotation process
  
- [ ] Set up secret scanning
  - [ ] Pre-commit hooks
  - [ ] Repository scanning
  - [ ] Container image scanning

### TLS/SSL
- [ ] Configure TLS certificates
  - [ ] Wildcard certificate for *.newera.recovery
  - [ ] Auto-renewal via Let's Encrypt
  - [ ] Minimum TLS 1.2
  
- [ ] Configure HTTPS only
  - [ ] Redirect HTTP to HTTPS
  - [ ] HSTS headers enabled
  - [ ] No mixed content

### Access Control
- [ ] Configure VPN access
  - [ ] Only admin/DevOps can access directly
  - [ ] MFA required
  - [ ] IP whitelist
  
- [ ] Configure service accounts
  - [ ] Separate account per environment
  - [ ] Minimal permissions (least privilege)
  - [ ] Regular audit

---

## 🧪 Testing (QA Team)

### Functional Testing
- [ ] User registration flow
- [ ] User login/logout flow
- [ ] Refresh token mechanism
- [ ] Daily check-ins creation
- [ ] Recovery plan management
- [ ] Crisis plan management
- [ ] Peer support requests
- [ ] Resource library search
- [ ] Treatment provider locator

### Integration Testing
- [ ] API to database
- [ ] API to Redis cache
- [ ] Frontend to backend API
- [ ] Authentication flow (frontend)
- [ ] Error handling flow

### Performance Testing
- [ ] Load test: 100 concurrent users
- [ ] Load test: 1000 requests/minute
- [ ] Database query performance
- [ ] Cache hit rate monitoring
- [ ] API response times (<200ms target)

### Security Testing
- [ ] SQL injection attempts
- [ ] XSS payload testing
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization boundary testing
- [ ] Rate limiting effectiveness

### Accessibility Testing
- [ ] WCAG AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast ratios
- [ ] Focus management

---

## 📱 Frontend Validation (Frontend Team)

### Before Launch
- [ ] Implement token refresh mechanism
  - [ ] Automatic refresh before expiry
  - [ ] Handle 401 responses
  - [ ] Retry failed requests
  
- [ ] Add form validation
  - [ ] Check-ins form
  - [ ] Recovery plan form
  - [ ] Crisis plan form
  - [ ] Profile form
  
- [ ] Complete stub pages
  - [ ] Resources page (connect to API)
  - [ ] Peer support page (connect to API)
  - [ ] Treatment locator page (connect to API)
  
- [ ] Polish UX
  - [ ] Loading states
  - [ ] Empty states
  - [ ] Error states
  - [ ] Success states
  
- [ ] Test across browsers
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
  
- [ ] Test on mobile
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Responsive breakpoints
  - [ ] Touch interactions

---

## 📚 Documentation (Tech Writing)

- [ ] API documentation
  - [ ] [ ] Swagger docs updated
  - [ ] [ ] Error codes documented
  - [ ] [ ] Example requests/responses
  
- [ ] User documentation
  - [ ] [ ] Getting started guide
  - [ ] [ ] Feature tutorials
  - [ ] [ ] FAQ section
  - [ ] [ ] Video walkthroughs
  
- [ ] Operational documentation
  - [ ] [ ] Runbook completed
  - [ ] [ ] Troubleshooting guide
  - [ ] [ ] Incident response plan
  - [ ] [ ] Backup/restore procedure
  
- [ ] Developer documentation
  - [ ] [ ] Setup guide (✅ DONE)
  - [ ] [ ] API reference (✅ Swagger)
  - [ ] [ ] Architecture guide (✅ docs/architecture.md)
  - [ ] [ ] Contributing guidelines

---

## ✨ Quality Assurance (Final Check)

### Code Quality
- [ ] No console.log in production code
- [ ] All TypeScript strict mode
- [ ] No type `any` (except necessary Record types)
- [ ] All routes have error handling
- [ ] All services have logging

### Performance
- [ ] Frontend bundle < 200KB gzipped
- [ ] API response time < 200ms p95
- [ ] Database query time < 100ms
- [ ] Cold start < 3 seconds
- [ ] Cache hit rate > 80%

### Reliability
- [ ] All health checks passing
- [ ] Database backups working
- [ ] Redis replication working
- [ ] Pod restart recovery working
- [ ] Graceful shutdown working

### Security
- [ ] All secrets in Key Vault
- [ ] No secrets in git
- [ ] HTTPS everywhere
- [ ] Rate limiting active
- [ ] Audit logging working

---

## 🚀 Production Deployment (DevOps + Platform)

### Pre-Deployment
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] All security scans clean
- [ ] Stakeholder approval obtained
- [ ] Runbooks reviewed and tested

### Deployment Day
- [ ] Maintenance window scheduled
- [ ] Team on call
- [ ] Rollback plan ready
- [ ] Communications plan ready
- [ ] Monitoring alerts active

### Deployment Steps
1. [ ] Deploy database migrations
2. [ ] Deploy Redis configuration
3. [ ] Deploy backend services
4. [ ] Deploy frontend
5. [ ] Update DNS records
6. [ ] Run smoke tests
7. [ ] Monitor metrics
8. [ ] Notify stakeholders

### Post-Deployment
- [ ] Monitor error rates (< 0.1%)
- [ ] Monitor response times (< 200ms)
- [ ] Monitor resource usage
- [ ] Verify all features working
- [ ] Collect user feedback
- [ ] Update status page
- [ ] Document deployment

---

## 📋 Sign-Off

**Code Review**: [ ] Approved by tech lead  
**Security Review**: [ ] Approved by security team  
**DevOps Review**: [ ] Approved by DevOps lead  
**Product Review**: [ ] Approved by product manager  
**Final Approval**: [ ] Go for production

---

## 📞 Contacts

- **Platform Lead**: [Name]
- **DevOps Lead**: [Name]
- **Security Lead**: [Name]
- **Frontend Lead**: [Name]
- **Backend Lead**: [Name]

---

## 🎯 Timeline

- **Week 1**: Infrastructure setup + CI/CD
- **Week 2**: Integration testing + Frontend refinement
- **Week 3**: Security hardening + Final testing
- **Week 4**: Staging deployment + UAT
- **Week 5**: Production deployment

---

## ✅ Last Updated

- **Date**: April 17, 2026
- **Status**: Ready for infrastructure setup
- **Next**: DevOps team to provision Azure resources

---

**Questions?** Review [AUDIT_REPORT.md](./AUDIT_REPORT.md), [SETUP.md](./SETUP.md), or [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)
