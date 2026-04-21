# DevOps Audit Report - New Era Recovery Platform
**Date:** April 17, 2026  
**Target:** Production-grade Azure AKS deployment  
**Scope:** Dockerfile, Helm Charts, Terraform IaC, CI/CD Pipelines

---

## Executive Summary

The New Era Recovery platform has **foundational DevOps infrastructure** with significant gaps preventing production readiness. The Dockerfile is well-optimized, Helm charts have health checks configured, and Terraform module structure is clean. However, **critical issues exist in security, network isolation, CI/CD automation, and observability consistency** across environments.

**Risk Level:** 🔴 **HIGH** - Multiple production patterns missing

---

## 1. DOCKERFILE ANALYSIS

**File:** `/app/backend/Dockerfile`

### ✅ Strengths

| Aspect | Status | Details |
|--------|--------|---------|
| Multi-stage build | ✅ | Builder → Runner pattern (reduces final image size) |
| Base image | ✅ | `node:20-bookworm-slim` (recent, LTS, slim variant) |
| Build optimization | ✅ | Dependencies cached before source (npm ci) |
| Layer caching | ✅ | Proper layer ordering for cache efficiency |
| Production mode | ✅ | `NODE_ENV=production` set in runtime |
| npm ci usage | ✅ | Uses `npm ci` (lockfile-based, not `npm install`) |

### 🔴 Critical Issues

1. **No Runtime User (Running as Root)**
   ```dockerfile
   # ❌ ISSUE: Container runs as root (UID 0)
   # Missing: USER node
   ```
   **Impact:** Container can modify system, potential privilege escalation  
   **Severity:** 🔴 CRITICAL (security best practice violation)

2. **No Health Check in Dockerfile**
   ```dockerfile
   # ❌ MISSING: HEALTHCHECK instruction
   ```
   **Impact:** Docker and orchestrators can't detect unhealthy containers  
   **Severity:** 🟡 MEDIUM (mitigated by Kubernetes probes, but Docker-native deployments vulnerable)

3. **OpenSSL Installation Workaround**
   ```dockerfile
   # 🔥 Install OpenSSL (CRITICAL FIX)
   RUN apt-get update -y && apt-get install -y openssl ca-certificates
   ```
   **Issue:** Comments indicate "CRITICAL FIX" - suggests debugging leftover  
   **Question:** Is this necessary? Suggest validating if `node:20-bookworm-slim` already includes it  
   **Severity:** 🟡 MEDIUM (bloats image, may be unnecessary)

4. **apt-get Cleanup Not Explicit**
   - Good: `rm -rf /var/lib/apt/lists/*` is present
   - ✅ Prevents APK cache leakage

### 🟡 Recommendations

```dockerfile
# BEFORE
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]

# AFTER
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user (before installing packages)
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Verify OpenSSL is needed, consider removing if pre-installed in bookworm-slim
RUN apt-get update -y && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set ownership and permissions
RUN chown -R nodejs:nodejs /app

# Add health check for Docker-native use
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 4000
USER nodejs
CMD ["node", "dist/main.js"]
```

---

## 2. HELM CHARTS ANALYSIS

**Directory:** `/app/backend/helm/`

### Chart Structure

```
helm/
├── Chart.yaml                 ✅ Present
├── values.yaml                ✅ Base values
├── values-dev.yaml            ✅ Dev overrides
├── values-prod.yaml           ✅ Prod overrides
├── templates/
│   ├── deployment.yaml        ✅ Pod spec
│   ├── service.yaml           ✅ ClusterIP service
│   ├── backend-spc.yaml       ✅ Secrets provider class
│   └── _helpers.tpl           ✅ Template helpers
└── get_helm.sh                ✅ Install script
```

### ✅ Strengths

| Component | Status | Details |
|-----------|--------|---------|
| Health probes | ✅ | Both liveness & readiness configured |
| Secret management | ✅ | Uses Azure KeyVault CSI driver |
| Resource limits | ✅ | CPU & memory defined |
| Environment separation | ✅ | Dev/prod values files |
| Replica scaling | ✅ | Dev: 1, Prod: 2 |
| Service type | ✅ | ClusterIP (internal-only) |

### 🔴 Critical Issues

1. **Ingress Not Deployed for Prod**
   ```yaml
   # In values-prod.yaml: ingress section exists but no ingress template
   ingress:
     enabled: true
     className: nginx
     host: api.recoveryhealthaid.com
     path: /
   
   # ❌ ISSUE: No templates/ingress.yaml file!
   ```
   **Impact:** Ingress configuration defined but not deployed  
   **Severity:** 🔴 CRITICAL (prod API not exposed)

2. **Inconsistent Probe Paths**
   ```yaml
   # values-prod.yaml
   probes:
     readiness:
       path: /healthz
     liveness:
       path: /healthz
   
   # values-dev.yaml
   probes:
     readiness:
       path: /health           # ❌ Different path!
     liveness:
       path: /health
   ```
   **Impact:** Dev uses `/health`, prod uses `/healthz` - inconsistent  
   **Severity:** 🟡 MEDIUM (if backend implements only one endpoint, one environment breaks)

3. **No Startup Probe**
   ```yaml
   # Only readiness + liveness
   # Missing startup probe for slow-starting apps
   ```
   **Issue:** For apps with database migrations, startup probe recommended  
   **Severity:** 🟡 MEDIUM (might cause premature liveness failures during DB migrations)

4. **Image Pull Policy Inconsistency**
   ```yaml
   # values-prod.yaml
   pullPolicy: IfNotPresent    # ❌ May use stale image
   
   # Better for prod: Always
   ```
   **Severity:** 🟡 MEDIUM (image tag "prod" could be reused, stale image deployed)

5. **Missing Resource Requests in Dev**
   ```yaml
   # values-dev.yaml defines limits but requests look identical
   # Should be more conservative in dev to reflect prod reality
   ```

6. **No Pod Disruption Budget (PDB)**
   - Missing `templates/pdb.yaml`
   - **Issue:** During cluster maintenance, pods can be evicted without graceful migration  
   **Severity:** 🟡 MEDIUM

7. **No Network Policy**
   - Missing `templates/networkpolicy.yaml`
   - **Issue:** Backend accessible from any pod in cluster  
   **Severity:** 🔴 CRITICAL (security: should restrict ingress)

8. **env Variable Naming Inconsistency**
   ```yaml
   # values.yaml uses camelCase (nodeEnv, jwtAccessExpiresIn)
   # Deployment expects UPPERCASE_SNAKE_CASE (NODE_ENV, JWT_ACCESS_EXPIRES_IN)
   # This works due to Helm templating, but confusing
   ```

### 🟡 Recommendations

#### a) Create Missing Ingress Template

Create `/app/backend/helm/templates/ingress.yaml`:
```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-backend-ingress
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: {{ .Values.ingress.path }}
            pathType: Prefix
            backend:
              service:
                name: {{ .Release.Name }}-backend
                port:
                  number: {{ .Values.service.port }}
{{- end }}
```

#### b) Add Startup Probe to Deployment

```yaml
# In deployment.yaml, add after livenessProbe:
startupProbe:
  httpGet:
    path: {{ .Values.probes.readiness.path }}
    port: {{ .Values.service.targetPort }}
  failureThreshold: 30
  periodSeconds: 10
```

#### c) Create Network Policy Template

Create `/app/backend/helm/templates/networkpolicy.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ .Release.Name }}-backend
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: {{ .Chart.Name }}
      app.kubernetes.io/instance: {{ .Release.Name }}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: {{ .Release.Namespace }}
      ports:
        - protocol: TCP
          port: {{ .Values.service.targetPort }}
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443  # HTTPS for Key Vault
        - protocol: TCP
          port: 5432  # PostgreSQL
        - protocol: TCP
          port: 6379  # Redis
```

#### d) Update Values for Consistency

```yaml
# Standardize dev and prod probes to same path
# values-dev.yaml & values-prod.yaml
probes:
  readiness:
    path: /healthz  # Use prod standard
    initialDelaySeconds: 10
    periodSeconds: 10
    timeoutSeconds: 3
    successThreshold: 1
    failureThreshold: 3
  liveness:
    path: /healthz
    initialDelaySeconds: 30
    periodSeconds: 20
    timeoutSeconds: 3
    failureThreshold: 3
  startup:
    path: /healthz
    initialDelaySeconds: 0
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 30
```

#### e) Update Image Pull Policy

```yaml
# values-prod.yaml
image:
  repository: recoveryhealthaidacr.azurecr.io/recovery-health-aid-backend
  tag: prod
  pullPolicy: Always  # Ensure latest prod image
```

#### f) Add Pod Disruption Budget

Create `/app/backend/helm/templates/pdb.yaml`:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ .Release.Name }}-backend-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ .Chart.Name }}
      app.kubernetes.io/instance: {{ .Release.Name }}
```

---

## 3. TERRAFORM INFRASTRUCTURE ANALYSIS

**Directory:** `/infra/terraform/`

### Module Structure

```
terraform/
├── modules/
│   ├── rg/              ✅ Resource Group
│   ├── network/         ✅ VNet, Subnets
│   ├── acr/             ✅ Container Registry
│   ├── aks/             ✅ Kubernetes Cluster
│   ├── kv/              ✅ Key Vault
│   └── log_analytics/   ✅ Monitoring
└── envs/
    ├── dev/             ✅ Development environment
    └── prod/            ✅ Production environment
```

### ✅ Strengths

| Component | Status | Details |
|-----------|--------|---------|
| Modular design | ✅ | Clean separation of concerns |
| Environment isolation | ✅ | Separate dev & prod configs |
| Workload Identity | ✅ | OIDC enabled for pod auth |
| Key Vault CSI | ✅ | Secret rotation enabled |
| Log Analytics | ✅ | Monitoring integrated |
| Azure SKU tier separation | ✅ | Free for dev, Standard for prod |
| RBAC for ACR | ✅ | AcrPull role assigned |

### 🔴 Critical Issues

1. **No Network Security Group (NSG) Rules**
   ```
   Network module creates VNet & subnet only
   ❌ Missing: NSG with explicit ingress/egress rules
   ```
   **Impact:** No layer 4 (network) security enforcement  
   **Severity:** 🔴 CRITICAL

2. **No Network Policy Enforcement (Azure CNI)**
   ```hcl
   network_profile {
     network_plugin = "azure"  # ✅ Good choice
     load_balancer_sku = "standard"
   }
   # But no NetworkPolicy controller or Calico
   ```
   **Issue:** Azure CNI doesn't enforce NetworkPolicies by default  
   **Severity:** 🟡 MEDIUM (Kubernetes NetworkPolicy won't work without CNI support)

3. **Key Vault Public Network Access Enabled in Dev (and Prod unclear)**
   ```hcl
   # values-dev.yaml
   kv_public_network_access_enabled = true
   
   # values-prod.yaml
   kv_public_network_access_enabled = true  # ❌ Should be false
   ```
   **Impact:** Key Vault accessible from internet  
   **Severity:** 🔴 CRITICAL for prod, 🟡 MEDIUM for dev

4. **ACR Admin User Disabled (Good) but No Private Endpoint**
   ```hcl
   # acr/main.tf
   admin_enabled = false  # ✅ Good
   
   # ❌ Missing: Private endpoint for ACR
   # AKS pulling images over public internet
   ```
   **Severity:** 🟡 MEDIUM (network exposure for image pulls)

5. **No Database Configuration in Terraform**
   ```
   ❌ MISSING: Azure Database for PostgreSQL module
   ❌ MISSING: Database firewall rules
   ```
   **Issue:** Database connection string hardcoded in secrets but DB not in IaC  
   **Severity:** 🔴 CRITICAL (infrastructure incomplete, drift risk)

6. **Free Tier AKS in Prod Not Suitable**
   ```hcl
   # envs/prod/terraform.tfvars shows aks_sku_tier = "Standard"
   ✅ Correct: Standard tier for production
   
   # BUT: Free tier doesn't support:
   # - API Server uptime SLA
   # - Multiple node pools
   # - Custom VNet (uses managed)
   ```

7. **No Backup/Disaster Recovery Configuration**
   ```
   ❌ Missing: ACR geo-replication
   ❌ Missing: AKS etcd backup
   ❌ Missing: Database backup policy
   ```
   **Severity:** 🔴 CRITICAL for production

8. **Tenant ID Placeholder Not Enforced**
   ```hcl
   # Both dev/prod use:
   tenant_id = "YOUR-TENANT-ID"  # ❌ Placeholder!
   ```
   **Issue:** Must be replaced before deployment  
   **Severity:** 🔴 CRITICAL (Terraform will fail)

9. **No RBACs for Pod Identity or System-Assigned Identity**
   ```hcl
   # AKS has SystemAssigned identity but no role assignments for:
   # - Pulling secrets from Key Vault
   # - Pulling images from ACR (only AcrPull added)
   ```
   **Severity:** 🟡 MEDIUM (incomplete RBAC setup for workload identity)

10. **Virtual Network Address Space Small for Prod**
    ```hcl
    # dev: 10.10.0.0/16 (65,536 IPs)
    # prod: 10.20.0.0/16 (65,536 IPs)
    
    # AKS subnet:
    # dev: 10.10.1.0/24 (256 IPs)
    # prod: 10.20.1.0/24 (256 IPs)
    
    # ⚠️ For HA cluster with auto-scaling, only 256 IPs very limited
    # Recommended: /22 (1,024 IPs) for prod
    ```
    **Severity:** 🟡 MEDIUM (scaling limitation)

### 🟡 Recommendations

#### a) Create NSG Module

Create `/infra/terraform/modules/nsg/main.tf`:
```hcl
resource "azurerm_network_security_group" "aks" {
  name                = var.nsg_name
  location            = var.location
  resource_group_name = var.resource_group_name

  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "DenyAllInbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = var.tags
}

resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = var.subnet_id
  network_security_group_id = azurerm_network_security_group.aks.id
}
```

#### b) Add Database Module

Create `/infra/terraform/modules/postgres/main.tf`:
```hcl
resource "azurerm_postgresql_flexible_server" "this" {
  name                   = var.server_name
  location               = var.location
  resource_group_name    = var.resource_group_name
  administrator_login    = var.admin_login
  administrator_password = var.admin_password
  version                = "15"
  sku_name               = var.sku_name
  storage_mb             = var.storage_mb
  backup_retention_days  = var.backup_retention_days

  geo_redundant_backup_enabled = var.geo_redundant_backup

  zone = var.zone

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "aks" {
  name             = "AllowAKS"
  server_id        = azurerm_postgresql_flexible_server.this.id
  start_ip_address = var.aks_subnet_start_ip
  end_ip_address   = var.aks_subnet_end_ip
}

resource "azurerm_postgresql_flexible_server_configuration" "require_ssl" {
  name       = "require_secure_transport"
  server_id  = azurerm_postgresql_flexible_server.this.id
  value      = "on"
}
```

#### c) Update Key Vault Security

```hcl
# modules/kv/main.tf
resource "azurerm_key_vault" "this" {
  # ... existing config ...
  
  public_network_access_enabled = false  # For prod
  
  # Add private endpoint for secure access
}

# Add in envs/prod/terraform.tfvars
kv_public_network_access_enabled = false

# Add in envs/dev/terraform.tfvars (keep true for easier debugging)
kv_public_network_access_enabled = true
```

#### d) Add ACR Private Endpoint

```hcl
# modules/acr/main.tf - add to prod only
resource "azurerm_private_endpoint" "acr" {
  count = var.enable_private_endpoint ? 1 : 0

  name                = "${var.name}-pe"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id

  private_service_connection {
    name                           = "${var.name}-psc"
    is_manual_connection           = false
    private_connection_resource_id = azurerm_container_registry.this.id
    subresource_names              = ["registry"]
  }
}

resource "azurerm_private_dns_zone" "acr" {
  count = var.enable_private_endpoint ? 1 : 0

  name                = "privatelink.azurecr.io"
  resource_group_name = var.resource_group_name
}
```

#### e) Expand Subnet CIDR for Prod

```hcl
# envs/prod/terraform.tfvars
aks_subnet_prefixes = ["10.20.1.0/22"]  # 1,024 IPs instead of 256
```

#### f) Update Tenant ID

Replace placeholder in `envs/prod/terraform.tfvars` and `envs/dev/terraform.tfvars`:
```hcl
# Use environment variable or variable override
tenant_id = var.tenant_id  # Pass via -var or environment
```

---

## 4. CI/CD PIPELINE ANALYSIS

**Directory:** `/ci/azure-pipelines/`

### Current State

```
ci/azure-pipelines/
├── backend-ci.yml        ❌ EMPTY
├── backend-cd.yml        ❌ EMPTY
├── frontend-ci.yml       ❌ EMPTY
├── frontend-cd.yml       (not present)
└── infra-ci.yml          ❌ EMPTY
```

### 🔴 Critical Issues

**ALL pipeline files are empty/missing - CI/CD is not implemented**

### What's Missing

#### 1. **Backend CI Pipeline** (`backend-ci.yml`)

Should include:
- ✅ Trigger on PR/push to main
- ✅ Build Docker image
- ✅ Security scanning (Snyk/Trivy)
- ✅ Push to ACR (tagged with commit SHA)
- ✅ Unit tests
- ✅ Linting (ESLint/Prettier)
- ✅ SAST (SonarQube/GitHub CodeQL)

#### 2. **Backend CD Pipeline** (`backend-cd.yml`)

Should include:
- ✅ Trigger on successful CI
- ✅ Deploy to dev environment (Helm)
- ✅ Smoke tests
- ✅ Manual approval gate
- ✅ Deploy to prod environment
- ✅ Post-deployment validation
- ✅ Rollback strategy

#### 3. **Frontend CI Pipeline** (`frontend-ci.yml`)

Should include:
- ✅ Build React/Vite bundle
- ✅ Unit tests
- ✅ E2E tests
- ✅ Lighthouse audit
- ✅ Push to CDN

#### 4. **Infrastructure CI Pipeline** (`infra-ci.yml`)

Should include:
- ✅ Terraform plan
- ✅ Policy checks (Checkov/Snyk IaC)
- ✅ Cost estimation
- ✅ Manual approval
- ✅ Terraform apply

### 🟡 Recommendations

#### Create Backend CI Pipeline

Create `/ci/azure-pipelines/backend-ci.yml`:
```yaml
trigger:
  - main
  - develop

pr:
  - main
  - develop

variables:
  dockerImageName: 'recovery-health-aid-backend'
  ACR_NAME: 'recoveryhealthaidacr'
  ACR_REGISTRY: '$(ACR_NAME).azurecr.io'

stages:
  - stage: Build
    displayName: 'Build and Test'
    jobs:
      - job: BuildAndTest
        displayName: 'Build, Test, and Push Image'
        pool:
          vmImage: 'ubuntu-latest'

        steps:
          - checkout: self
            fetchDepth: 0

          - task: Docker@2
            displayName: 'Build Docker Image'
            inputs:
              command: 'build'
              Dockerfile: 'app/backend/Dockerfile'
              tags: |
                $(ACR_REGISTRY)/$(dockerImageName):$(Build.BuildId)
                $(ACR_REGISTRY)/$(dockerImageName):latest
              arguments: '--build-arg BUILD_ID=$(Build.BuildId) --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')'

          - task: CmdLine@2
            displayName: 'Run Unit Tests'
            inputs:
              script: |
                cd app/backend
                npm ci
                npm run test

          - task: CmdLine@2
            displayName: 'Run Linting'
            inputs:
              script: |
                cd app/backend
                npm run lint || true

          - task: Aqua@1
            displayName: 'Security Scan - Trivy'
            inputs:
              scan: 'image'
              image: '$(ACR_REGISTRY)/$(dockerImageName):$(Build.BuildId)'
              scanType: 'config'
            continueOnError: true

          - task: Docker@2
            displayName: 'Push to ACR'
            inputs:
              command: 'push'
              containerRegistry: 'RecoveryHealthAidACR'
              repository: '$(dockerImageName)'
              tags: |
                $(Build.BuildId)
                latest

  - stage: ScanAndApprove
    displayName: 'Security and Approval'
    dependsOn: Build
    jobs:
      - job: WaitForValidation
        displayName: 'Manual Approval'
        pool: server
        timeoutInMinutes: 1440
        steps:
          - task: ManualValidation@0
            inputs:
              notifyUsers: 'devops-team@recoveryhealthaid.com'
              instructions: 'Review security scans and approve for CD'
```

#### Create Backend CD Pipeline

Create `/ci/azure-pipelines/backend-cd.yml`:
```yaml
trigger:
  none  # Manual trigger only

variables:
  dockerImageName: 'recovery-health-aid-backend'
  ACR_REGISTRY: 'recoveryhealthaidacr.azurecr.io'
  HELM_CHART_PATH: 'app/backend/helm'

stages:
  - stage: DeployToDev
    displayName: 'Deploy to Dev'
    jobs:
      - deployment: DeployDev
        displayName: 'Deploy Backend to Dev'
        environment: 'dev'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self

                - task: HelmDeploy@0
                  displayName: 'Helm Deploy to Dev'
                  inputs:
                    kubernetesServiceConnection: 'aks-rhaid-dev'
                    namespace: 'recovery-dev'
                    command: 'upgrade'
                    chartType: 'FilePath'
                    chartPath: '$(HELM_CHART_PATH)'
                    releaseName: 'recovery-backend'
                    valueFile: '$(HELM_CHART_PATH)/values-dev.yaml'
                    arguments: '--set image.tag=$(Build.BuildId) --create-namespace'

                - task: KubernetesDeploy@1
                  displayName: 'Verify Dev Deployment'
                  inputs:
                    kubernetesServiceConnection: 'aks-rhaid-dev'
                    namespace: 'recovery-dev'
                    command: 'get'
                    arguments: 'deployments'

                - task: CmdLine@2
                  displayName: 'Smoke Tests'
                  inputs:
                    script: |
                      POD=$(kubectl get pods -n recovery-dev -l app.kubernetes.io/name=recovery-health-aid-backend -o jsonpath='{.items[0].metadata.name}')
                      kubectl port-forward -n recovery-dev $POD 4000:4000 &
                      sleep 5
                      curl -f http://localhost:4000/healthz || exit 1

  - stage: ApprovalForProd
    displayName: 'Approval for Prod'
    dependsOn: DeployToDev
    jobs:
      - job: WaitForProdApproval
        displayName: 'Manual Approval for Prod'
        pool: server
        steps:
          - task: ManualValidation@0
            inputs:
              notifyUsers: 'release-team@recoveryhealthaid.com'
              instructions: 'Approve for production deployment'

  - stage: DeployToProd
    displayName: 'Deploy to Prod'
    dependsOn: ApprovalForProd
    condition: succeeded()
    jobs:
      - deployment: DeployProd
        displayName: 'Deploy Backend to Prod'
        environment: 'prod'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self

                - task: HelmDeploy@0
                  displayName: 'Helm Deploy to Prod'
                  inputs:
                    kubernetesServiceConnection: 'aks-rhaid-prod'
                    namespace: 'recovery-prod'
                    command: 'upgrade'
                    chartType: 'FilePath'
                    chartPath: '$(HELM_CHART_PATH)'
                    releaseName: 'recovery-backend'
                    valueFile: '$(HELM_CHART_PATH)/values-prod.yaml'
                    arguments: '--set image.tag=$(Build.BuildId) --create-namespace'

                - task: CmdLine@2
                  displayName: 'Canary Health Checks'
                  inputs:
                    script: |
                      POD=$(kubectl get pods -n recovery-prod -l app.kubernetes.io/name=recovery-health-aid-backend -o jsonpath='{.items[0].metadata.name}')
                      kubectl port-forward -n recovery-prod $POD 4000:4000 &
                      sleep 5
                      for i in {1..30}; do
                        curl -f http://localhost:4000/healthz && exit 0
                        sleep 2
                      done
                      exit 1

                - task: CmdLine@2
                  displayName: 'Rollback on Failure'
                  condition: failed()
                  inputs:
                    script: |
                      helm rollback recovery-backend -n recovery-prod
```

#### Create Infrastructure CI Pipeline

Create `/ci/azure-pipelines/infra-ci.yml`:
```yaml
trigger:
  - main
  - develop
  paths:
    - infra/**

pr:
  - main
  - develop

variables:
  tfVersion: '1.5.0'

stages:
  - stage: ValidateAndPlan
    displayName: 'Terraform Validate & Plan'
    jobs:
      - job: TerraformPlan
        displayName: 'Terraform Plan'
        strategy:
          matrix:
            dev:
              tfEnv: 'dev'
            prod:
              tfEnv: 'prod'
        pool:
          vmImage: 'ubuntu-latest'

        steps:
          - checkout: self

          - task: TerraformInstaller@0
            displayName: 'Install Terraform $(tfVersion)'
            inputs:
              terraformVersion: '$(tfVersion)'

          - task: TerraformTaskV3@3
            displayName: 'Terraform Format Check'
            inputs:
              provider: 'azurerm'
              command: 'fmt'
              workingDirectory: 'infra/terraform'
              args: '-check'

          - task: TerraformTaskV3@3
            displayName: 'Terraform Validate'
            inputs:
              provider: 'azurerm'
              command: 'validate'
              workingDirectory: 'infra/terraform'

          - task: TerraformTaskV3@3
            displayName: 'Terraform Init'
            inputs:
              provider: 'azurerm'
              command: 'init'
              workingDirectory: 'infra/terraform/envs/$(tfEnv)'
              backendServiceArm: 'AzureResourceManager'
              backendAzureRmResourceGroupName: 'rg-rhaid-tfstate'
              backendAzureRmStorageAccountName: 'storhaidtfstate'
              backendAzureRmContainerName: 'tfstate'
              backendAzureRmKey: '$(tfEnv).tfstate'

          - task: TerraformTaskV3@3
            displayName: 'Terraform Plan'
            inputs:
              provider: 'azurerm'
              command: 'plan'
              workingDirectory: 'infra/terraform/envs/$(tfEnv)'
              environmentServiceNameAzureRM: 'AzureResourceManager'
              args: '-out=tfplan'

          - task: checkov@1
            displayName: 'Policy Check - Checkov'
            inputs:
              directory: 'infra/terraform'
              quiet: false
              skipCheck: 'CKV_AZURE_1,CKV_AZURE_2'
            continueOnError: true

          - task: PublishBuildArtifacts@1
            displayName: 'Publish Terraform Plan'
            inputs:
              pathToPublish: 'infra/terraform/envs/$(tfEnv)/tfplan'
              artifactName: 'tfplan-$(tfEnv)'
```

---

## 5. SECURITY OBSERVATIONS

### 🔴 Critical Security Issues

| Issue | Location | Impact | Severity |
|-------|----------|--------|----------|
| Container runs as root | Dockerfile | Privilege escalation | 🔴 CRITICAL |
| No network policies | Helm | Pod-to-pod lateral movement | 🔴 CRITICAL |
| No NSG rules | Terraform | Network exposure | 🔴 CRITICAL |
| Key Vault public access (prod) | Terraform | Secret exposure | 🔴 CRITICAL |
| No database in IaC | Terraform | Drift/manual process | 🔴 CRITICAL |
| No CI/CD pipeline | Azure Pipelines | Manual deployments, no gating | 🔴 CRITICAL |

### 🟡 Medium Security Issues

| Issue | Location | Impact | Severity |
|-------|----------|--------|----------|
| Image pull policy IfNotPresent | Helm | Stale images deployed | 🟡 MEDIUM |
| OpenSSL installation | Dockerfile | Image bloat/unnecessary | 🟡 MEDIUM |
| No Pod Disruption Budget | Helm | Unexpected downtime | 🟡 MEDIUM |
| Probe path inconsistency | Helm | Environment-specific failures | 🟡 MEDIUM |
| ACR no private endpoint | Terraform | Image pull exposure | 🟡 MEDIUM |
| Subnet too small | Terraform | Scaling limitations | 🟡 MEDIUM |

---

## 6. SCALABILITY ASSESSMENT

### ✅ Currently Scalable

- **Horizontal Pod Autoscaling (HPA):** Can be added easily via Helm values
- **Cluster Autoscaling:** AKS supports node autoscaling
- **Multi-replica deployment:** Prod already has 2 replicas
- **Load balancing:** Standard LB configured

### 🟡 Scalability Gaps

| Issue | Impact | Recommendation |
|-------|--------|-----------------|
| Subnet too small (256 IPs) | Max ~200 pods per node | Expand to /22 (1,024 IPs) |
| Single Log Analytics workspace | Query limits | Consider Application Insights |
| No Redis clustering | Cache bottleneck | Implement Redis Cluster mode |
| Database not in IaC | Manual scaling | Add to Terraform with read replicas |
| No CDN for frontend | Slow global delivery | Add Azure CDN |

---

## 7. MISSING PRODUCTION PATTERNS

### Health Checks

| Pattern | Status | Details |
|---------|--------|---------|
| Liveness probe | ✅ | Configured (20s initial delay, 20s period) |
| Readiness probe | ✅ | Configured (10s initial delay, 10s period) |
| Startup probe | ❌ | **MISSING** |
| Dockerfile HEALTHCHECK | ❌ | **MISSING** |
| /healthz endpoint | ✅ | Defined in app.ts |

### Resource Management

| Pattern | Status | Details |
|---------|--------|---------|
| CPU requests | ✅ | 100m (dev), 200m (prod) |
| Memory requests | ✅ | 128Mi (dev), 256Mi (prod) |
| CPU limits | ✅ | 500m (dev), 1Gi (prod) |
| Memory limits | ✅ | 512Mi (dev), 1Gi (prod) |
| HPA | ❌ | **MISSING** |
| VPA (Vertical Pod Autoscaler) | ❌ | **MISSING** |

### Observability

| Pattern | Status | Details |
|---------|--------|---------|
| Structured logging | ✅ | Pino configured |
| Log shipping | ✅ | OMS agent configured |
| Metrics | ✅ | Log Analytics integration |
| Distributed tracing | ❌ | **MISSING** (consider Jaeger/DataDog) |
| APM (Application Performance Monitoring) | ❌ | **MISSING** |

### Networking

| Pattern | Status | Details |
|---------|--------|---------|
| Network policies | ❌ | **MISSING** |
| NSG rules | ❌ | **MISSING** |
| Pod security policies | ❌ | **MISSING** (deprecated in K8s 1.25+) |
| Pod security standards | ❌ | **MISSING** |

### Deployment

| Pattern | Status | Details |
|---------|--------|---------|
| Canary deployments | ❌ | **MISSING** |
| Blue/green deployments | ❌ | **MISSING** |
| Rolling updates | ✅ | Default K8s behavior |
| Pod disruption budgets | ❌ | **MISSING** |

---

## 8. ACTION ITEMS BY PRIORITY

### 🔴 CRITICAL (Do Immediately)

| Item | Effort | Owner |
|------|--------|-------|
| Create Ingress template for Helm (prod API exposure) | 30 min | DevOps |
| Add runtime user to Dockerfile (security) | 15 min | Backend |
| Disable Key Vault public access in prod | 10 min | DevOps |
| Create NSG module in Terraform | 1 hour | Infra |
| Add database module to Terraform | 2 hours | Infra |
| Implement Backend CI pipeline | 3 hours | DevOps |
| Replace Key Vault placeholder (YOUR-TENANT-ID) | 5 min | DevOps |
| Create network policy templates | 1 hour | DevOps |

**Subtotal: ~8 hours**

### 🟡 MEDIUM (Next Sprint)

| Item | Effort | Owner |
|------|--------|-------|
| Standardize health probe paths (dev/prod) | 20 min | DevOps |
| Add startup probe to deployment | 20 min | DevOps |
| Add Pod Disruption Budget | 20 min | DevOps |
| Update image pull policy to Always (prod) | 10 min | DevOps |
| Add HPA configuration | 1 hour | DevOps |
| Create Backend CD pipeline | 3 hours | DevOps |
| Create Infrastructure CI pipeline | 2 hours | DevOps |
| Add ACR private endpoint | 1 hour | Infra |
| Expand subnet CIDR for prod | 20 min | Infra |
| Remove unnecessary OpenSSL from Dockerfile | 15 min | Backend |

**Subtotal: ~8.5 hours**

### 🟢 NICE-TO-HAVE (Future Enhancements)

| Item | Effort | Owner |
|------|--------|-------|
| Add Dockerfile HEALTHCHECK | 15 min | Backend |
| Implement canary deployments | 2 hours | DevOps |
| Set up distributed tracing (Jaeger) | 4 hours | DevOps |
| Configure APM (Application Insights) | 2 hours | DevOps |
| Implement Pod Security Standards | 1 hour | DevOps |
| Add cost optimization policies | 2 hours | Infra |
| Set up automated backup/DR | 3 hours | Infra |

**Subtotal: ~14 hours**

---

## 9. PRODUCTION READINESS SCORECARD

| Category | Score | Status | Notes |
|----------|-------|--------|-------|
| **Dockerfile** | 7/10 | ⚠️ WARN | Good multi-stage build, missing runtime user & health check |
| **Helm Charts** | 6/10 | ⚠️ WARN | Health probes OK, missing ingress, network policies, PDB |
| **Terraform** | 5/10 | ❌ FAIL | Missing NSG, database, private endpoints, ACR PE |
| **CI/CD Pipelines** | 0/10 | ❌ FAIL | All pipelines empty - NO automation |
| **Security** | 3/10 | ❌ FAIL | Multiple critical issues: root user, public KV, no NSG |
| **Observability** | 7/10 | ⚠️ WARN | Logging OK, missing APM & distributed tracing |
| **Scalability** | 5/10 | ⚠️ WARN | HPA-ready but subnet too small, no read replicas |
| **Networking** | 2/10 | ❌ FAIL | No network policies, NSG, or pod security |
| **Overall** | **4.4/10** | 🔴 **NOT READY** | **Must fix critical items before production** |

---

## 10. IMPLEMENTATION ROADMAP

### Week 1: Security & Blocking Issues

```
Monday:
  - Fix Dockerfile (root user → node user) ✅
  - Disable Key Vault public access (prod) ✅
  - Create NSG module ✅

Tuesday-Wednesday:
  - Add database to Terraform ✅
  - Create network policy templates ✅
  - Update Helm ingress template ✅

Thursday-Friday:
  - Start CI pipeline (backend-ci.yml) ✅
  - Replace tenant ID placeholders ✅
  - Test infrastructure code ✅
```

### Week 2: CI/CD & Kubernetes Hardening

```
Monday-Tuesday:
  - Complete backend CI/CD pipelines ✅
  - Create infrastructure CI pipeline ✅

Wednesday-Thursday:
  - Standardize health probes ✅
  - Add startup probe & PDB ✅
  - Add HPA configuration ✅

Friday:
  - Full environment test (dev) ✅
  - Documentation & runbooks ✅
```

### Week 3: Observability & Optimization

```
Monday-Tuesday:
  - Add APM/distributed tracing ✅
  - Set up canary deployments ✅

Wednesday:
  - Cost optimization review ✅

Thursday-Friday:
  - Backup/DR strategy ✅
  - Final production audit ✅
```

---

## 11. SIGN-OFF & NEXT STEPS

### Current Status
🔴 **NOT PRODUCTION READY** - Multiple critical gaps

### Critical Path to Production
1. ✅ Fix Dockerfile security (root user)
2. ✅ Create missing Helm templates (ingress, network policy, PDB)
3. ✅ Complete Terraform (NSG, database, Key Vault)
4. ✅ Implement CI/CD pipelines
5. ✅ Security hardening (network, RBAC, secrets)
6. ✅ Full integration testing
7. ✅ Load testing & capacity planning
8. ✅ Runbooks & incident response

### Estimated Time to Production
- **With full team:** 3-4 weeks
- **With current pace:** 6-8 weeks

### Contact & Escalations
- **DevOps Lead:** [Assign]
- **Infrastructure Lead:** [Assign]
- **Security Review:** Required before prod deploy
- **Stakeholder Sign-off:** CEO/CTO

---

**Report Generated:** April 17, 2026  
**Auditor:** GitHub Copilot  
**Next Review:** After critical fixes (2 weeks)
