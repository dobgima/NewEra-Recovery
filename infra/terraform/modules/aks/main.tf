resource "azurerm_kubernetes_cluster" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.dns_prefix
  sku_tier            = var.sku_tier

  # Let Azure pick the (preview) Kubernetes version for Free tier
  # Do NOT set kubernetes_version or orchestrator_version

  oidc_issuer_enabled       = true
  workload_identity_enabled = true

   # Enable the CSI driver add-on
key_vault_secrets_provider {
  secret_rotation_enabled = true
}


  identity {
    type = "SystemAssigned"
  }

  default_node_pool {
    name                = var.default_node_pool_name
    node_count          = var.node_count
    vm_size             = var.vm_size
    vnet_subnet_id      = var.subnet_id
    os_disk_size_gb     = var.os_disk_size_gb
    os_disk_type        = "Managed"
    type                = "VirtualMachineScaleSets"
    orchestrator_version = null
  }

  network_profile {
  network_plugin    = "azure"
  load_balancer_sku = "standard"
  }
  oms_agent {
    log_analytics_workspace_id = var.log_analytics_workspace_id
  }

  tags = var.tags
}


resource "azurerm_role_assignment" "acr_pull" {
  scope                = var.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.this.kubelet_identity[0].object_id
}



