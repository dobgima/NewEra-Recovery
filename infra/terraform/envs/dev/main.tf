module "rg" {
  source   = "../../modules/rg"
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

module "network" {
  source              = "../../modules/network"
  resource_group_name = module.rg.name
  location            = module.rg.location
  vnet_name           = var.vnet_name
  vnet_address_space  = var.vnet_address_space
  aks_subnet_name     = var.aks_subnet_name
  aks_subnet_prefixes = var.aks_subnet_prefixes
  tags                = var.tags
}

module "acr" {
  source              = "../../modules/acr"
  name                = var.acr_name
  resource_group_name = module.rg.name
  location            = module.rg.location
  sku                 = var.acr_sku
  admin_enabled       = var.acr_admin_enabled
  tags                = var.tags
}

module "kv" {
  source                        = "../../modules/kv"
  name                          = var.kv_name
  resource_group_name           = module.rg.name
  location                      = module.rg.location
  tenant_id                     = var.tenant_id
  soft_delete_retention_days    = var.kv_soft_delete_retention_days
  purge_protection_enabled      = var.kv_purge_protection_enabled
  public_network_access_enabled = var.kv_public_network_access_enabled
  tags                          = var.tags
}

module "aks" {
  source              = "../../modules/aks"
  name                = var.aks_name
  location            = module.rg.location
  resource_group_name = module.rg.name
  dns_prefix          = var.aks_dns_prefix

  default_node_pool_name     = var.aks_default_node_pool_name
  node_count                 = var.node_count
  vm_size                    = var.vm_size
  subnet_id                  = module.network.aks_subnet_id
  os_disk_size_gb            = var.os_disk_size_gb
  acr_id                     = module.acr.id
  log_analytics_workspace_id = module.log_analytics.id
  sku_tier                   = var.aks_sku_tier

  tags = var.tags
}


module "log_analytics" {
  source              = "../../modules/log_analytics"
  name                = var.log_analytics_name
  resource_group_name = module.rg.name
  location            = module.rg.location
  sku                 = var.log_analytics_sku
  retention_in_days   = var.log_analytics_retention_in_days
  tags                = var.tags
}