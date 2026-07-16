#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/mpetalcorin/philippine-eagle-conservation-analytics.git"

if [[ ! -d .git ]]; then
  git init -b main
  git config user.name "Mark Ihrwell R. Petalcorin"
  git config user.email "mpetalcorin@users.noreply.github.com"
  git add .
  git commit -m "Initial release: Philippine Eagle conservation analytics"
fi

git branch -M main
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git push -u origin main
