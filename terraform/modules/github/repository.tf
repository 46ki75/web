resource "github_repository" "web" {
  name = var.repository

  has_downloads        = false
  has_issues           = true
  has_projects         = false
  has_wiki             = false
  vulnerability_alerts = true
}
