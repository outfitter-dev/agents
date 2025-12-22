# Claude Plugin Distribution - Examples

## Example 1: Simple GitHub Release

### Step-by-step release process

```bash
# 1. Update version
vim plugin.json  # Change version to 1.0.0

# 2. Update CHANGELOG
vim CHANGELOG.md  # Add release notes

# 3. Commit changes
git add plugin.json CHANGELOG.md
git commit -m "chore: release v1.0.0"

# 4. Create tag
git tag v1.0.0

# 5. Push to GitHub
git push origin main --tags

# 6. Create GitHub release
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "Initial stable release with core features"
```

---

## Example 2: Release with Artifacts

### Creating packaged releases

```bash
# 1. Create package script
cat > scripts/package.sh << 'EOF'
#!/bin/bash
VERSION=$(jq -r '.version' plugin.json)
PLUGIN_NAME=$(jq -r '.name' plugin.json)

echo "Packaging $PLUGIN_NAME v$VERSION"

cd ..
zip -r "${PLUGIN_NAME}-v${VERSION}.zip" "${PLUGIN_NAME}/" \
  -x "*.git*" \
  -x "*.github*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "test/*" \
  -x "*.log"

echo "Created ${PLUGIN_NAME}-v${VERSION}.zip"
EOF

chmod +x scripts/package.sh

# 2. Run package script
./scripts/package.sh

# 3. Create release with artifact
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes-file CHANGELOG.md \
  ../my-plugin-v1.0.0.zip
```

---

## Example 3: Automated GitHub Actions Release

### .github/workflows/release.yml

```yaml
name: Release Plugin

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Get version from tag
        id: get_version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Validate plugin
        run: |
          # Validate required files
          test -f plugin.json || exit 1
          test -f README.md || exit 1
          test -f LICENSE || exit 1
          test -f CHANGELOG.md || exit 1

          # Validate JSON
          jq empty plugin.json

          # Verify version matches tag
          PLUGIN_VERSION=$(jq -r '.version' plugin.json)
          if [ "$PLUGIN_VERSION" != "${{ steps.get_version.outputs.VERSION }}" ]; then
            echo "Version mismatch: plugin.json has $PLUGIN_VERSION but tag is ${{ steps.get_version.outputs.VERSION }}"
            exit 1
          fi

      - name: Create package
        run: |
          PLUGIN_NAME=$(jq -r '.name' plugin.json)
          cd ..
          zip -r "${PLUGIN_NAME}-v${{ steps.get_version.outputs.VERSION }}.zip" "${PLUGIN_NAME}/" \
            -x "*.git*" "*.github*" "*.DS_Store" "node_modules/*" "test/*"
          mv "${PLUGIN_NAME}-v${{ steps.get_version.outputs.VERSION }}.zip" "${PLUGIN_NAME}/"

      - name: Extract release notes
        id: release_notes
        run: |
          # Extract current version's changelog
          awk '/^## \[${{ steps.get_version.outputs.VERSION }}\]/,/^## \[/' CHANGELOG.md | \
            sed '1d;$d' > release_notes.txt

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            *-v${{ steps.get_version.outputs.VERSION }}.zip
          body_path: release_notes.txt
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Notify
        run: |
          echo "✅ Released v${{ steps.get_version.outputs.VERSION }}"
```

---

## Example 4: Multi-Platform Distribution

### Supporting different environments

```bash
# Create platform-specific packages

# macOS
zip -r my-plugin-v1.0.0-macos.zip my-plugin/ \
  -x "*.git*" "test/*" "*.windows.sh"

# Windows
zip -r my-plugin-v1.0.0-windows.zip my-plugin/ \
  -x "*.git*" "test/*" "*.sh"

# Linux
zip -r my-plugin-v1.0.0-linux.zip my-plugin/ \
  -x "*.git*" "test/*" "*.windows.sh"

# Universal (all platforms)
zip -r my-plugin-v1.0.0.zip my-plugin/ \
  -x "*.git*" "test/*"

# Create release with all artifacts
gh release create v1.0.0 \
  --title "v1.0.0 - Multi-Platform Release" \
  --notes "Download the package for your platform" \
  my-plugin-v1.0.0-macos.zip \
  my-plugin-v1.0.0-windows.zip \
  my-plugin-v1.0.0-linux.zip \
  my-plugin-v1.0.0.zip
```

---

## Example 5: Marketplace Submission

### Adding plugin to community marketplace

```bash
# 1. Fork marketplace repository
gh repo fork awesome-claude/plugins

# 2. Clone your fork
git clone https://github.com/yourname/plugins.git
cd plugins

# 3. Add plugin entry
jq '.plugins += [{
  "name": "my-plugin",
  "source": {
    "source": "github",
    "repo": "yourname/my-plugin"
  },
  "description": "Amazing plugin for Claude Code",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "keywords": ["productivity", "automation"],
  "category": "development"
}]' .claude-plugin/marketplace.json > temp.json
mv temp.json .claude-plugin/marketplace.json

# 4. Commit and push
git add .claude-plugin/marketplace.json
git commit -m "feat: add my-plugin to marketplace"
git push origin main

# 5. Create pull request
gh pr create \
  --title "Add my-plugin to marketplace" \
  --body "This PR adds my-plugin, which provides [description of features]"
```

---

## Example 6: Version Bump Workflow

### Automated version management

```bash
# Create version bump script
cat > scripts/bump-version.sh << 'EOF'
#!/bin/bash

BUMP_TYPE="${1:-patch}"  # major, minor, or patch

# Get current version
CURRENT_VERSION=$(jq -r '.version' plugin.json)
echo "Current version: $CURRENT_VERSION"

# Parse version
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Bump version
case $BUMP_TYPE in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo "New version: $NEW_VERSION"

# Update plugin.json
jq --arg version "$NEW_VERSION" '.version = $version' plugin.json > temp.json
mv temp.json plugin.json

# Add CHANGELOG entry
DATE=$(date +%Y-%m-%d)
cat > temp_changelog.md << CHANGELOG_END
# Changelog

## [$NEW_VERSION] - $DATE

### Added
-

### Changed
-

### Fixed
-

CHANGELOG_END

# Append existing CHANGELOG (skip first line)
tail -n +2 CHANGELOG.md >> temp_changelog.md
mv temp_changelog.md CHANGELOG.md

echo "✅ Version bumped to $NEW_VERSION"
echo "⚠️  Please update CHANGELOG.md with release notes"
EOF

chmod +x scripts/bump-version.sh

# Usage:
./scripts/bump-version.sh patch   # 1.0.0 -> 1.0.1
./scripts/bump-version.sh minor   # 1.0.1 -> 1.1.0
./scripts/bump-version.sh major   # 1.1.0 -> 2.0.0
```

---

## Example 7: Complete Release Process

### Full workflow from development to distribution

```bash
# 1. Development phase
git checkout -b feature/new-command
# ... develop feature ...
git add .
git commit -m "feat: add new command"
git push origin feature/new-command

# 2. Create PR and merge
gh pr create --title "Add new command" --body "Implements XYZ"
# ... review and merge ...

# 3. Update main branch
git checkout main
git pull origin main

# 4. Bump version
./scripts/bump-version.sh minor

# 5. Update CHANGELOG
vim CHANGELOG.md  # Add release notes

# 6. Commit version bump
git add plugin.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"

# 7. Create and push tag
git tag v1.1.0
git push origin main --tags

# 8. Package plugin
./scripts/package.sh

# 9. Create GitHub release
gh release create v1.1.0 \
  --title "v1.1.0 - New Command Feature" \
  --notes "$(sed -n '/## \[1.1.0\]/,/## \[/p' CHANGELOG.md | sed '1d;$d')" \
  ../my-plugin-v1.1.0.zip

# 10. Update marketplace (if applicable)
# ... add to marketplace.json in marketplace repo ...

# 11. Announce release
echo "✅ Released v1.1.0"
echo "📦 Available at: https://github.com/username/my-plugin/releases/tag/v1.1.0"
```

---

## Example 8: Hotfix Release

### Quick bug fix release process

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... make changes ...
git add .
git commit -m "fix: critical bug in command X"

# 3. Bump patch version
./scripts/bump-version.sh patch

# 4. Quick CHANGELOG update
cat > temp.md << 'EOF'
## [1.0.1] - $(date +%Y-%m-%d)

### Fixed
- Critical bug in command X that caused Y

EOF
sed -i.bak '2r temp.md' CHANGELOG.md && rm temp.md CHANGELOG.md.bak

# 5. Commit version
git add plugin.json CHANGELOG.md
git commit -m "chore: release v1.0.1 hotfix"

# 6. Merge to main
git checkout main
git merge hotfix/critical-bug

# 7. Tag and release
git tag v1.0.1
git push origin main --tags

# 8. Create release
gh release create v1.0.1 \
  --title "v1.0.1 - Critical Bugfix" \
  --notes "Fixes critical bug in command X" \
  --latest

# 9. Clean up
git branch -d hotfix/critical-bug
```

---

## Example 9: Pre-release / Beta Distribution

### Testing releases before stable

```bash
# 1. Update to pre-release version
jq '.version = "2.0.0-beta.1"' plugin.json > temp.json
mv temp.json plugin.json

# 2. Commit and tag
git add plugin.json
git commit -m "chore: release v2.0.0-beta.1"
git tag v2.0.0-beta.1
git push origin develop --tags

# 3. Create pre-release
gh release create v2.0.0-beta.1 \
  --title "v2.0.0-beta.1 - Beta Release" \
  --notes "⚠️ This is a beta release. Please test and report issues." \
  --prerelease \
  --target develop

# After testing is complete:
# 4. Update to stable version
jq '.version = "2.0.0"' plugin.json > temp.json
mv temp.json plugin.json

# 5. Merge to main and create stable release
git checkout main
git merge develop
git tag v2.0.0
git push origin main --tags

gh release create v2.0.0 \
  --title "v2.0.0 - Major Release" \
  --notes "Stable release with new features"
```
