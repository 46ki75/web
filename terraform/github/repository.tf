resource "github_repository" "web" {
  name         = "web"
  description  = "Just my portfolio and blogs."
  homepage_url = "https://www.ikuma.cloud"

  has_downloads        = false
  has_issues           = true
  has_projects         = false
  has_wiki             = false
  vulnerability_alerts = true
}
