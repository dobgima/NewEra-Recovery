variable "location" { type = string }
variable "resource_group_name" { type = string }

variable "vnet_name" { type = string }
variable "vnet_address_space" { type = list(string) }
variable "aks_subnet_name" { type = string }
variable "aks_subnet_prefixes" { type = list(string) }

variable "acr_name" { type = string }
variable "acr_sku" { type = string }
variable "acr_admin_enabled" { type = bool }

variable "kv_name" { type = string }
variable "tenant_id" { type = string }
variable "kv_soft_delete_retention_days" { type = number }
variable "kv_purge_protection_enabled" { type = bool }
variable "kv_public_network_access_enabled" { type = bool }

variable "aks_name" { type = string }
variable "aks_dns_prefix" { type = string }
variable "aks_default_node_pool_name" { type = string }
variable "node_count" { type = number }
variable "vm_size" { type = string }
variable "os_disk_size_gb" { type = number }
variable "aks_sku_tier" { type = string }
variable "tags" {
  type = map(string)
}

variable "log_analytics_name" { type = string }
variable "log_analytics_sku" { type = string }
variable "log_analytics_retention_in_days" { type = number }