resource "github_issue_label" "bug" {
  repository = local.repository
  name       = "bug"
  color      = "8e3636"
}

resource "github_issue_label" "dependencies" {
  repository  = local.repository
  name        = "dependencies"
  color       = "3f66ce"
  description = "Pull requests that update a dependency file."
}

resource "github_issue_label" "npm" {
  repository  = local.repository
  name        = "npm"
  color       = "9e2219"
  description = "Pull requests that update package.json or its lock file."
}

resource "github_issue_label" "terraform" {
  repository  = local.repository
  name        = "terraform"
  color       = "7c53b4"
  description = "Pull requests that update terraform lock file."
}

resource "github_issue_label" "rust" {
  repository  = local.repository
  name        = "Rust"
  color       = "725cf5"
  description = "Pull requests that update Cargo.toml or its lock file."
}

resource "github_issue_label" "good_first_issue" {
  repository  = local.repository
  name        = "good first issue"
  color       = "725cf5"
  description = "Good for newcomers"
}
