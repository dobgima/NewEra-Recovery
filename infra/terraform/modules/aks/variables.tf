variable "name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "dns_prefix" {
  type = string
}

variable "default_node_pool_name" {
  type    = string
  default = "system"
}

variable "node_count" {
  type = number
}

variable "vm_size" {
  type = string
}

variable "os_disk_size_gb" {
  type    = number
  default = 50
}

variable "subnet_id" {
  type = string
}

variable "acr_id" {
  type = string
}

variable "log_analytics_workspace_id" {
  type = string
}

variable "sku_tier" {
  type    = string
  default = "Free"
}

variable "tags" {
  type    = map(string)
  default = {}
}