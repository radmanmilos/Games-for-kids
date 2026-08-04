#!/bin/bash
# Replace the ENTIRE docs/ content with the game/ content.
# GitHub Pages serves the site from main -> /docs (https://radmanmilos.github.io/Games-for-kids/).
# Run this whenever game/ changes, then commit and push to main to publish.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d game ]; then
  echo "ERROR: expected a 'game/' folder in the repo root" >&2
  exit 1
fi

rm -rf docs
mkdir docs
cp -a game/. docs/

echo "docs/ now mirrors game/ ($(find docs -type f | wc -l) files)."
echo "Review 'git status', commit, and push to main to publish the site."
