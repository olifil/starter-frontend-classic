#!/bin/bash
set -e

BRANCH="layout/classic"
TAG_LOCAL="refs/tags/classic/v1.0.0"
TAG_REMOTE="refs/tags/v1.0.0"

echo "→ Codeberg"
git push classic "$BRANCH:main" --force
git push classic "$TAG_LOCAL:$TAG_REMOTE"

echo "→ GitHub"
git push https://github.com/olifil/starter-frontend-classic "$BRANCH:main" --force
git push https://github.com/olifil/starter-frontend-classic "$TAG_LOCAL:$TAG_REMOTE"

echo "→ GitLab"
git push https://gitlab.com/Olifil_37/starter-frontend-classic "$BRANCH:main" --force
git push https://gitlab.com/Olifil_37/starter-frontend-classic "$TAG_LOCAL:$TAG_REMOTE"

echo "✓ Done"
