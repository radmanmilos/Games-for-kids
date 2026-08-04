#!/usr/bin/env bash
set -euo pipefail

# Run this from your repository root (where .git is).
if [ ! -d .git ]; then
  echo "Error: this script must be run from the repository root (where .git exists)."
  exit 1
fi

# Determine default branch from origin (fallback to main/master/current branch)
default_branch=$(git remote show origin 2>/dev/null | sed -n 's/.*HEAD branch: //p' || true)
if [ -z "$default_branch" ]; then
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    default_branch=main
  elif git rev-parse --verify origin/master >/dev/null 2>&1; then
    default_branch=master
  else
    default_branch=$(git branch --show-current || echo "main")
  fi
fi

branch="deploy-game-gh-pages"
workflow_dir=".github/workflows"
workflow_file="$workflow_dir/deploy.yml"

echo "Default branch detected: $default_branch"
echo "Creating new branch: $branch (from origin/$default_branch)"

git fetch origin
# create branch from remote default branch if possible
if git show-ref --verify --quiet "refs/remotes/origin/$default_branch"; then
  git checkout -b "$branch" "origin/$default_branch"
else
  git checkout -b "$branch"
fi

mkdir -p "$workflow_dir"

cat > "$workflow_file" <<YAML
name: Deploy game/ to GitHub Pages

on:
  push:
    branches:
      - $default_branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Deploy game/ to gh-pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: game
          token: \${{ secrets.GITHUB_TOKEN }}
YAML

git add "$workflow_file"
git commit -m "Add GitHub Actions workflow to deploy game/ to gh-pages"
git push -u origin "$branch"

# Try to determine owner/repo from remote URL, fallback to radmanmilos/Games-for-kids
remote_url=$(git config --get remote.origin.url || true)
owner_repo=""
if [[ "$remote_url" =~ ^git@github.com:(.*)(\.git)?$ ]]; then
  owner_repo="${BASH_REMATCH[1]}"
elif [[ "$remote_url" =~ ^https://github.com/(.*)(\.git)?$ ]]; then
  owner_repo="${BASH_REMATCH[1]}"
fi
if [ -z "$owner_repo" ]; then
  owner_repo="radmanmilos/Games-for-kids"
fi

owner="${owner_repo%%/*}"
repo="${owner_repo##*/}"
repo="${repo%.git}"

if command -v gh >/dev/null 2>&1; then
  echo "Creating pull request using GitHub CLI (gh)..."
  gh pr create --base "$default_branch" --head "$branch" --title "Deploy game/ to GitHub Pages" --body "Adds workflow to deploy game/ to gh-pages"
  echo "PR created (check your repo)."
else
  echo
  echo "GitHub CLI (gh) not found. Create the PR manually by opening this URL:"
  echo "https://github.com/$owner_repo/compare/$default_branch...$branch?expand=1"
fi

echo
echo "What I changed:"
echo " - Created branch: $branch"
echo " - Added file: $workflow_file"
echo
echo "After the PR is merged, the workflow will run on pushes to $default_branch and publish the contents of the game/ folder to the gh-pages branch."
echo "Open Pages settings if needed and set Source to 'gh-pages branch / root'."
echo
echo "Your site URL will be: https://$owner.github.io/$repo/"