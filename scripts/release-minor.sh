#!/usr/bin/env bash
set -euo pipefail

# Auto minor release script
# 1. Derive next minor from latest Git tag (vX.Y.Z) or package.json if no tag.
# 2. Update package.json version
# 3. Commit + tag
# 4. Install, build
# 5. Publish to npm
# 6. Push commit + tag

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js required" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm required" >&2
  exit 1
fi

current_tag="$(git describe --tags --abbrev=0 2>/dev/null || true)"
if [ -z "$current_tag" ]; then
  # Fallback to package.json version if no tag
  pkg_version="$(node -p "require('./package.json').version")"
  current_tag="v${pkg_version}"
fi
base_version="${current_tag#v}" # strip leading v
IFS='.' read -r major minor patch <<< "$base_version"
if [[ -z "$major" || -z "$minor" || -z "$patch" ]]; then
  echo "Unable to parse version from tag: $current_tag" >&2
  exit 1
fi
next_minor=$((minor + 1))
next_version="${major}.${next_minor}.0"
export NEXT_VERSION="$next_version"

echo "Current tag: $current_tag" 
echo "Next minor version: $NEXT_VERSION"

# Ensure working tree is clean except for potential package.json change later
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree not clean. Commit or stash changes before releasing." >&2
  exit 1
fi

# Update package.json version using Node (preserves formatting)
node <<'EOF'
const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const next = process.env.NEXT_VERSION;
pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
EOF

git add package.json
git commit -m "chore: release v$NEXT_VERSION"
git tag "v$NEXT_VERSION"

yarn install --frozen-lockfile || yarn install

yarn build

npm publish --access public

git push origin main --follow-tags

echo "Released v$NEXT_VERSION"