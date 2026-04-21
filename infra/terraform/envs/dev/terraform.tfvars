location            = "eastus"
resource_group_name = "rg-rhaid-dev"

vnet_name           = "vnet-rhaid-dev"
vnet_address_space  = ["10.10.0.0/16"]
aks_subnet_name     = "snet-aks-dev"
aks_subnet_prefixes = ["10.10.1.0/24"]

acr_name          = "acrrhaidev12345"
acr_sku           = "Basic"
acr_admin_enabled = false

kv_name   = "kvrhaiddev12345"
tenant_id = "YOUR-TENANT-ID"

kv_soft_delete_retention_days    = 7
kv_purge_protection_enabled      = false
kv_public_network_access_enabled = true

aks_name                   = "aks-rhaid-dev"
aks_dns_prefix             = "aks-rhaid-dev"
aks_default_node_pool_name = "system"
node_count                 = 1
vm_size                    = "Standard_B2s"
os_disk_size_gb            = 50
aks_sku_tier               = "Free"

log_analytics_name              = "log-rhaid-dev"
log_analytics_sku               = "PerGB2018"
log_analytics_retention_in_days = 30

tags = {
  project     = "RecoveryHealthAid"
  environment = "dev"
  managed_by  = "terraform"
}




