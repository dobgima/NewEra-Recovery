output "resource_group_name" {
  value = module.rg.name
}

output "acr_login_server" {
  value = module.acr.login_server
}

output "aks_name" {
  value = module.aks.name
}

output "aks_fqdn" {
  value = module.aks.fqdn
}

output "aks_kubelet_identity_object_id" {
  value = module.aks.kubelet_identity_object_id
}

output "key_vault_name" {
  value = module.kv.name
}

output "key_vault_uri" {
  value = module.kv.vault_uri
}

output "log_analytics_name" {
  value = module.log_analytics.name
}

output "log_analytics_id" {
  value = module.log_analytics.id
}