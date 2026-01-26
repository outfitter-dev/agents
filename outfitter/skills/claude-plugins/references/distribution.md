# Plugin Distribution Reference

Packaging, versioning, and release automation for Claude Code plugins.

## Distribution Checklist

Before distributing:

- [ ] Plugin structure is correct
- [ ] plugin.json is complete and valid
- [ ] All components tested
- [ ] Documentation complete (README, CHANGELOG)
- [ ] License file included
- [ ] Version number updated
- [ ] Git tags created
- [ ] GitHub release published

## Required Files for Distribution

```
my-plugin/
├── plugin.json          # Required: metadata
├── README.md            # Required: documentation
├── LICENSE              # Required: license
├── CHANGELOG.md         # Recommended: history
└── [components]         # Commands, agents, etc.
```

## README Template

```markdown
# Plugin Name

Brief description of what this plugin does.

## Installation

\`\`\`bash
/plugin marketplace add owner/plugin-repo
/plugin install plugin-name@owner
\`\`\`

Or locally:
\`\`\`bash
/plugin marketplace add ./path/to/plugin
/plugin install plugin-name@plugin-name
\`\`\`

## Features

- Feature 1
- Feature 2

## Usage

### Commands

- `/command-name` - Description

### Agents

Describe custom agents.

## Configuration

Required environment variables:
\`\`\`bash
export VAR_NAME=value
\`\`\`

## Requirements

- Claude Code
- Node.js 18+ (if applicable)

## License

MIT License
```

## CHANGELOG Template

```markdown
# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2025-01-20

### Added
- Initial release
- Command X for feature Y

### Changed
- Updated behavior of command A

### Fixed
- Fixed bug in agent B

## [0.1.0] - 2025-01-10

### Added
- Initial development version
```

## Semantic Versioning

**Format:** `MAJOR.MINOR.PATCH`

| Type | When | Example |
|------|------|---------|
| MAJOR | Breaking changes | 1.0.0 -> 2.0.0 |
| MINOR | New features (compatible) | 1.0.0 -> 1.1.0 |
| PATCH | Bug fixes | 1.0.0 -> 1.0.1 |

### Version Bump Workflow

```bash
# 1. Update plugin.json version
# 2. Update CHANGELOG.md
# 3. Commit
git add plugin.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"

# 4. Tag
git tag v1.1.0

# 5. Push
git push origin main --tags
```

## Packaging

### ZIP Distribution

**Correct structure:**

```
my-plugin.zip
└── my-plugin/           # Plugin folder at root
    ├── plugin.json
    ├── README.md
    └── ...
```

### Creating Package

```bash
# From parent directory
zip -r my-plugin.zip my-plugin/ \
  -x "*.git*" "*.DS_Store" "node_modules/*" "test/*"

# Verify
unzip -l my-plugin.zip
```

### Package Script

```bash
#!/bin/bash
VERSION=$(jq -r '.version' plugin.json)
PLUGIN_NAME=$(jq -r '.name' plugin.json)

cd ..
zip -r "${PLUGIN_NAME}-v${VERSION}.zip" "${PLUGIN_NAME}/" \
  -x "*.git*" "*.github*" "*.DS_Store" "node_modules/*" "test/*"

echo "Created ${PLUGIN_NAME}-v${VERSION}.zip"
```

## GitHub Releases

### Manual Release

```bash
# Tag and push
git tag v1.0.0
git push origin v1.0.0

# Create release
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "Release notes here"
```

### Release with Artifact

```bash
# Create package
zip -r my-plugin-v1.0.0.zip my-plugin/

# Create release with artifact
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes-file CHANGELOG.md \
  my-plugin-v1.0.0.zip
```

## CI/CD Integration

### GitHub Actions - Validation

**.github/workflows/validate.yml:**

```yaml
name: Validate Plugin

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate JSON
        run: jq empty plugin.json

      - name: Check required files
        run: |
          test -f README.md || exit 1
          test -f LICENSE || exit 1

      - name: Validate commands
        run: |
          if [ -d commands ]; then
            for f in commands/**/*.md; do
              grep -q "^---$" "$f" || exit 1
            done
          fi
```

### GitHub Actions - Release

**.github/workflows/release.yml:**

```yaml
name: Release Plugin

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate
        run: |
          test -f plugin.json
          test -f README.md
          test -f LICENSE
          jq empty plugin.json

      - name: Get version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Verify version match
        run: |
          PLUGIN_VERSION=$(jq -r '.version' plugin.json)
          if [ "$PLUGIN_VERSION" != "${{ steps.version.outputs.VERSION }}" ]; then
            echo "Version mismatch"
            exit 1
          fi

      - name: Create package
        run: |
          PLUGIN_NAME=$(jq -r '.name' plugin.json)
          cd ..
          zip -r "${PLUGIN_NAME}-v${{ steps.version.outputs.VERSION }}.zip" \
            "${PLUGIN_NAME}/" -x "*.git*" "*.github*"
          mv *.zip "${PLUGIN_NAME}/"

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: '*-v${{ steps.version.outputs.VERSION }}.zip'
          generate_release_notes: true
```

## Distribution Methods

### Method 1: GitHub Repository

```bash
# Users install:
/plugin marketplace add username/my-plugin
/plugin install my-plugin@username
```

**Advantages:** Version control, issues, free hosting

### Method 2: Git URL

```bash
# For GitLab, Bitbucket, self-hosted
/plugin marketplace add https://gitlab.com/user/my-plugin.git
```

### Method 3: Marketplace Entry

Add to existing marketplace:

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "github",
        "repo": "username/my-plugin"
      },
      "description": "Plugin description",
      "version": "1.0.0"
    }
  ]
}
```

### Method 4: Direct Download

Host ZIP and provide instructions:

```bash
wget https://example.com/my-plugin.zip
unzip my-plugin.zip
/plugin marketplace add ./my-plugin
/plugin install my-plugin@my-plugin
```

## Pre-Release Testing

### Beta Release

```bash
# Update to pre-release version
jq '.version = "2.0.0-beta.1"' plugin.json > temp.json
mv temp.json plugin.json

# Tag and release as prerelease
git tag v2.0.0-beta.1
git push origin --tags

gh release create v2.0.0-beta.1 \
  --title "v2.0.0-beta.1" \
  --prerelease \
  --notes "Beta release for testing"
```

## Hotfix Process

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Fix and test
# 3. Bump patch version
# 4. Merge to main
git checkout main
git merge hotfix/critical-fix

# 5. Tag and release
git tag v1.0.1
git push origin main --tags

gh release create v1.0.1 \
  --title "v1.0.1 - Critical Fix" \
  --latest
```

## Version Bump Script

```bash
#!/bin/bash
BUMP_TYPE="${1:-patch}"
CURRENT=$(jq -r '.version' plugin.json)

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case $BUMP_TYPE in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW="${MAJOR}.${MINOR}.${PATCH}"
jq --arg v "$NEW" '.version = $v' plugin.json > temp.json
mv temp.json plugin.json

echo "Bumped to $NEW"
```

Usage:

```bash
./bump-version.sh patch  # 1.0.0 -> 1.0.1
./bump-version.sh minor  # 1.0.1 -> 1.1.0
./bump-version.sh major  # 1.1.0 -> 2.0.0
```
