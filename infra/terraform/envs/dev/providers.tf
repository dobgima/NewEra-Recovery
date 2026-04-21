terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=4.1.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-hcih-tfstate"
    storage_account_name = "sttfstatehcih20658"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}

provider "azurerm" {
  subscription_id = "7361022b-9271-4555-adb2-cd5daf9b89ac"
  features {}
}