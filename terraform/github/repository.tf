resource "github_repository" "web" {
  name         = "web"
  description  = "Just my portfolio and blogs."
  homepage_url = "https://www.ikuma.cloud"

  has_issues           = true
  has_projects         = false
  has_wiki             = false
  vulnerability_alerts = true
}
