resource "github_issue_label" "bug" {
  repository = github_repository.web.name
  name       = "bug"
  color      = "8e3636"
}

resource "github_issue_label" "dependencies" {
  repository  = github_repository.web.name
  name        = "dependencies"
  color       = "3f66ce"
  description = "Pull requests that update a dependency file."
}

resource "github_issue_label" "npm" {
  repository  = github_repository.web.name
  name        = "npm"
  color       = "9e2219"
  description = "Pull requests that update package.json or its lock file."
}

resource "github_issue_label" "terraform" {
  repository  = github_repository.web.name
  name        = "Terraform"
  color       = "7c53b4"
  description = "Pull requests that update terraform lock file."
}

resource "github_issue_label" "rust" {
  repository  = github_repository.web.name
  name        = "Rust"
  color       = "f6c5a2"
  description = "Pull requests that update Cargo.toml or its lock file."
}

resource "github_issue_label" "good_first_issue" {
  repository  = github_repository.web.name
  name        = "good first issue"
  color       = "725cf5"
  description = "Good for newcomers"
}
