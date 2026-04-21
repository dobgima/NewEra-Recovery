location            = "eastus"
resource_group_name = "rg-rhaid-prod"

vnet_name           = "vnet-rhaid-prod"
vnet_address_space  = ["10.20.0.0/16"]
aks_subnet_name     = "snet-aks-prod"
aks_subnet_prefixes = ["10.20.1.0/24"]

acr_name          = "acrrhaidprod12345"
acr_sku           = "Standard"
acr_admin_enabled = false

kv_name   = "kvrhaidprod12345"
tenant_id = "YOUR-TENANT-ID"

kv_soft_delete_retention_days    = 7
kv_purge_protection_enabled      = true
kv_public_network_access_enabled = true

aks_name                   = "aks-rhaid-prod"
aks_dns_prefix             = "aks-rhaid-prod"
aks_default_node_pool_name = "system"
node_count                 = 2
vm_size                    = "Standard_D2s_v5"
os_disk_size_gb            = 50
aks_sku_tier               = "Standard"

log_analytics_name              = "log-rhaid-prod"
log_analytics_sku               = "PerGB2018"
log_analytics_retention_in_days = 30

tags = {
  project     = "RecoveryHealthAid"
  environment = "prod"
  managed_by  = "terraform"
}