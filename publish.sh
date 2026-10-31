#!/usr/bin/env zsh
set -e
cd "$(dirname "$0")"

echo "1/3 Rebuilding single-file standalone HTML bundle (dist/Middle-Ear-3D-Standalone.html)..."
python3 ./bundle_standalone.py

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b main
fi

echo "2/3 Staging & committing latest local changes..."
git add -A
if git diff --cached --quiet; then
  echo "    No new file changes to commit."
else
  MSG="${1:-Update Middle Ear 3D}"
  git commit -m "${MSG}"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo ""
  echo "========================================================================"
  echo "  Local commit & standalone bundle are ready!"
  echo "  One-time setup to connect your free GitHub Pages online URL:"
  echo ""
  echo "  1. Create a free public repo at: https://github.com/new"
  echo "     (Name it e.g. 'middle-ear-3d', leave 'Add README' unchecked)"
  echo "  2. Connect it once by running:"
  echo "     git remote add origin https://github.com/<YOUR-USERNAME>/middle-ear-3d.git"
  echo "     ./publish.sh"
  echo "  3. In GitHub -> Settings -> Pages -> Source: 'Deploy from a branch' -> 'main' / '/ (root)'."
  echo ""
  echo "  From then on, ANY local edit goes live at"
  echo "  https://<YOUR-USERNAME>.github.io/middle-ear-3d/ just by running: ./publish.sh"
  echo "========================================================================"
  exit 0
fi

echo "3/3 Pushing update to live hosted repository..."
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
git push -u origin "${BRANCH}"
echo "Done! Your hosted GitHub Pages site will refresh within ~20-30 seconds."
