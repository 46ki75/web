# @see <https://docs.github.com/en/rest/repos/rules?apiVersion=2022-11-28#create-a-repository-ruleset>

resource "github_repository_ruleset" "branch_restrict_deletion" {
  name        = "branch-restrict-deletion"
  repository  = github_repository.web.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH", "refs/heads/develop"]
      exclude = []
    }
  }

  rules {
    deletion = true
  }
}

resource "github_repository_ruleset" "branch_restrict_creation_release" {
  name        = "branch-restrict-creation-release"
  repository  = github_repository.web.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["refs/heads/release/**/*"]
      exclude = []
    }
  }

  rules {
    creation = true
  }

  bypass_actors {
    actor_id    = 5 # Admin
    actor_type  = "RepositoryRole"
    bypass_mode = "pull_request"
  }
}

resource "github_repository_ruleset" "tag_release_restrict_mutation" {
  name        = "tag-release-restrict-mutation"
  repository  = github_repository.web.name
  target      = "tag"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["refs/tags/v*"]
      exclude = []
    }
  }

  rules {
    creation         = true
    update           = true
    deletion         = true
    non_fast_forward = true
  }

  bypass_actors {
    actor_id    = 5 # Admin
    actor_type  = "RepositoryRole"
    bypass_mode = "always"
  }
}

