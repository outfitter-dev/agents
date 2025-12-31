---
name: claude-plugin-distribution
description: Packages and distributes Claude Code plugins with proper structure, documentation, and release management. Creates distribution-ready packages, generates documentation, and sets up automated validation. Use when preparing Claude Code plugins for release, packaging plugins for marketplace distribution, creating plugin documentation, setting up plugin versioning, or publishing plugins to GitHub.
version: 1.0.0
---

# Claude Plugin Distribution

Packages and publishes Claude Code plugins with proper structure, documentation, versioning, and release automation.

## Quick Start

### Distribution Checklist

Before distributing your plugin:

- [ ] Plugin structure is correct
- [ ] plugin.json is complete and valid
- [ ] All components tested (commands, agents, hooks, MCP servers)
- [ ] Documentation complete (README, CHANGELOG)
- [ ] License file included
- [ ] Version number updated
- [ ] Git tags created
- [ ] GitHub release published (if applicable)

### Basic Distribution Workflow

1. **Prepare plugin**
   - Validate structure
   - Update version
   - Write documentation

2. **Package plugin**
   - Create ZIP with correct structure
   - Verify package contents

3. **Publish plugin**
   - Push to Git repository
   - Create release tag
   - Add to marketplace

4. **Share with users**
   - Provide installation instructions
   - Document requirements

## Plugin Structure for Distribution

### Required Files

```
my-plugin/
├── plugin.json          # Required: Plugin metadata
├── README.md            # Required: Documentation
├── LICENSE              # Required: License file
└── CHANGELOG.md         # Recommended: Version history
```

### Complete Structure

```
my-plugin/
├── plugin.json
├── README.md
├── LICENSE
├── CHANGELOG.md
├── .gitignore
├── commands/            # If applicable
│   └── my-command.md
├── agents/              # If applicable
│   └── my-agent.md
├── hooks/               # If applicable
│   └── pre-tool.sh
└── servers/             # If applicable
    └── my-server/
```

## plugin.json for Distribution

### Minimal Configuration

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description of plugin",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT"
}
```

### Complete Configuration

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Comprehensive plugin description",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/username/my-plugin",
  "repository": "https://github.com/username/my-plugin",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "development"
}
```

## Documentation

### README.md Template

```markdown
# Plugin Name

Brief description of what this plugin does.

## Installation

\`\`\`bash
/plugin marketplace add username/plugin-repo
/plugin install my-plugin@username
\`\`\`

Or from local:
\`\`\`bash
/plugin marketplace add ./path/to/plugin
/plugin install my-plugin@my-plugin
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

### Commands

- \`/command-name\` - Description

### Agents

Describe how to use custom agents.

### MCP Servers

If your plugin includes MCP servers, describe the tools and resources they provide.

## Configuration

List any required environment variables:

\`\`\`bash
export VAR_NAME=value
\`\`\`

## Requirements

- Claude Code
- Node.js 18+ (if applicable)
- Python 3.10+ (if applicable)

## License

[License Name]
\`\`\`

### CHANGELOG.md Template

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-20

### Added
- Initial release
- Command X for feature Y
- Agent Z for task W

### Changed
- Updated behavior of command A

### Fixed
- Fixed bug in agent B

## [0.2.0] - 2025-01-15

### Added
- Beta release
- Preview features

## [0.1.0] - 2025-01-10

### Added
- Initial development version
```

## Versioning

### Semantic Versioning

Follow semver (MAJOR.MINOR.PATCH):

**Version format:** `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Examples:**
- `1.0.0` → `1.0.1` (bug fix)
- `1.0.1` → `1.1.0` (new feature)
- `1.1.0` → `2.0.0` (breaking change)

### Updating Version

1. **Update plugin.json**

   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Update CHANGELOG.md**
   Add entry for new version

3. **Commit changes**

   ```bash
   git add plugin.json CHANGELOG.md
   git commit -m "chore: bump version to 1.1.0"
   ```

4. **Create git tag**

   ```bash
   git tag v1.1.0
   git push origin main --tags
   ```

## Packaging

### ZIP Distribution

Create a ZIP file with proper structure:

**Correct structure:**

```
my-plugin.zip
└── my-plugin/           # Plugin folder is root
    ├── plugin.json
    ├── README.md
    └── ...
```

**Incorrect structure:**

```
my-plugin.zip            # Files directly in root
├── plugin.json
├── README.md
└── ...
```

### Creating ZIP Package

```bash
# From parent directory
zip -r my-plugin.zip my-plugin/

# Verify structure
unzip -l my-plugin.zip
```

### Excluding Files

Create `.zipignore` or use `.gitignore`:

```
.git/
.DS_Store
*.log
node_modules/
__pycache__/
.env
.vscode/
test/
*.test.js
```

Create package script:

```bash
#!/bin/bash
zip -r my-plugin.zip my-plugin/ -x "*.git*" "*.DS_Store" "node_modules/*" "__pycache__/*"
```

## Publishing to GitHub

### Repository Setup

1. **Create repository**

   ```bash
   gh repo create my-plugin --public
   ```

2. **Add remote**

   ```bash
   git remote add origin https://github.com/username/my-plugin.git
   ```

3. **Push code**

   ```bash
   git push -u origin main
   ```

### Creating Releases

**Manual release:**

```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0

# Create GitHub release
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "Initial release"
```

**With ZIP artifact:**

```bash
# Create package
zip -r my-plugin-v1.0.0.zip my-plugin/

# Create release with artifact
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "$(cat CHANGELOG.md | sed -n '/## \[1.0.0\]/,/## \[/p' | sed '1d;$d')" \
  my-plugin-v1.0.0.zip
```

## Distribution Methods

### Method 1: GitHub Repository

**Advantages:**
- Version control
- Issue tracking
- Easy updates
- Free hosting

**Setup:**

```bash
# Users install with:
/plugin marketplace add username/my-plugin
/plugin install my-plugin@username
```

### Method 2: Git Repository

For GitLab, Bitbucket, or self-hosted Git:

```bash
# Users install with:
/plugin marketplace add https://gitlab.com/username/my-plugin.git
```

### Method 3: Marketplace Distribution

Add to an existing marketplace:

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

### Method 4: Direct ZIP Download

Host ZIP file and users can install:

```bash
# Download and extract
wget https://example.com/my-plugin.zip
unzip my-plugin.zip

# Install locally
/plugin marketplace add ./my-plugin
/plugin install my-plugin@my-plugin
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/release.yml`:

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
      - uses: actions/checkout@v4

      - name: Validate plugin structure
        run: |
          # Check required files
          test -f plugin.json
          test -f README.md
          test -f LICENSE

      - name: Validate plugin.json
        run: |
          jq empty plugin.json

      - name: Create ZIP package
        run: |
          cd ..
          zip -r my-plugin-${{ github.ref_name }}.zip my-plugin/ \
            -x "*.git*" "*.github*" "*.DS_Store"

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: ../my-plugin-${{ github.ref_name }}.zip
          generate_release_notes: true
```

### Validation Workflow

Create `.github/workflows/validate.yml`:

```yaml
name: Validate Plugin

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Validate JSON files
        run: |
          jq empty plugin.json

      - name: Check required files
        run: |
          test -f README.md || { echo "Missing README.md"; exit 1; }
          test -f LICENSE || { echo "Missing LICENSE"; exit 1; }

      - name: Validate commands
        run: |
          if [ -d commands ]; then
            for f in commands/**/*.md; do
              grep -q "^---$" "$f" || { echo "Missing frontmatter: $f"; exit 1; }
            done
          fi

      - name: Validate agents
        run: |
          if [ -d agents ]; then
            for f in agents/**/*.md; do
              grep -q "^---$" "$f" || { echo "Missing frontmatter: $f"; exit 1; }
            done
          fi
```

## Installation Instructions

### For End Users

**GitHub installation:**

```bash
# Add marketplace
/plugin marketplace add username/plugin-repo

# Install plugin
/plugin install plugin-name@username
```

**Local installation:**

```bash
# Add local directory
/plugin marketplace add ./path/to/plugin

# Install
/plugin install plugin-name@plugin-name
```

### For Marketplace Maintainers

Add entry to marketplace.json:

```json
{
  "name": "my-plugin",
  "source": {
    "source": "github",
    "repo": "username/my-plugin"
  },
  "description": "Plugin description",
  "version": "1.0.0",
  "author": {
    "name": "Author Name"
  },
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"]
}
```

## Best Practices

### Documentation

- Keep README concise and clear
- Provide installation examples
- Document all configuration options
- Include troubleshooting section
- Add screenshots/demos if helpful

### Versioning

- Follow semantic versioning
- Update CHANGELOG for each release
- Tag releases in Git
- Never delete or modify existing tags

### Package Quality

- Validate all files before release
- Test installation process
- Check cross-platform compatibility
- Minimize package size
- Exclude development files

### Maintenance

- Respond to issues promptly
- Keep dependencies updated
- Test with latest Claude Code
- Announce breaking changes clearly
- Maintain backward compatibility when possible

## Troubleshooting Distribution

**Issue: Plugin structure invalid**

```bash
# Verify structure
unzip -l plugin.zip
```

**Issue: Missing files in package**

```bash
# Check .gitignore doesn't exclude required files
# Verify all files committed to Git
```

**Issue: Version conflicts**

```bash
# Ensure version in plugin.json matches Git tag
# Check marketplace entry has correct version
```

## Next Steps

- See [EXAMPLES.md](EXAMPLES.md) for real-world distribution examples
