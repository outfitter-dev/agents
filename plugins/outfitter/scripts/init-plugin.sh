#!/usr/bin/env bash

# init-plugin.sh - Interactive plugin initialization wizard

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
print_prompt() { echo -e "${CYAN}[?]${NC} $1"; }

# Usage information
usage() {
  cat << EOF
Usage: $0 [options]

Interactive wizard to initialize a new Claude Code plugin.

Options:
  -d, --directory DIR   Create plugin in specified directory (default: current)
  -n, --non-interactive Use defaults without prompting
  -h, --help            Show this help message

Example:
  $0                     # Interactive mode
  $0 -d ./plugins        # Create in specific directory
  $0 -n                  # Non-interactive with defaults

EOF
  exit 1
}

# Parse arguments
PLUGIN_DIR="."
INTERACTIVE=true

while [[ $# -gt 0 ]]; do
  case $1 in
    -d|--directory)
      PLUGIN_DIR="$2"
      shift 2
      ;;
    -n|--non-interactive)
      INTERACTIVE=false
      shift
      ;;
    -h|--help)
      usage
      ;;
    -*)
      print_error "Unknown option: $1"
      usage
      ;;
    *)
      print_error "Unexpected argument: $1"
      usage
      ;;
  esac
done

# Prompt for input with default
prompt_with_default() {
  local prompt="$1"
  local default="$2"
  local result

  if [[ "$INTERACTIVE" == "false" ]]; then
    echo "$default"
    return
  fi

  read -p "$(echo -e "${CYAN}[?]${NC} ${prompt} [${default}]: ")" result
  echo "${result:-$default}"
}

# Prompt yes/no with default
prompt_yes_no() {
  local prompt="$1"
  local default="$2"
  local result

  if [[ "$INTERACTIVE" == "false" ]]; then
    echo "$default"
    return
  fi

  while true; do
    read -p "$(echo -e "${CYAN}[?]${NC} ${prompt} (y/n) [${default}]: ")" result
    result="${result:-$default}"
    case "$result" in
      y|Y|yes|Yes|YES)
        echo "y"
        return
        ;;
      n|N|no|No|NO)
        echo "n"
        return
        ;;
      *)
        print_warn "Please answer y or n"
        ;;
    esac
  done
}

# Validate plugin name
validate_plugin_name() {
  local name="$1"

  if [[ -z "$name" ]]; then
    print_error "Plugin name cannot be empty"
    return 1
  fi

  if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
    print_error "Plugin name must be kebab-case (lowercase letters, numbers, hyphens only)"
    print_error "Examples: my-plugin, dev-tools, claude-helper"
    return 1
  fi

  return 0
}

# Banner
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Claude Code Plugin Initialization       ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo

# Step 1: Plugin name
print_step "Plugin Information"
echo

while true; do
  PLUGIN_NAME=$(prompt_with_default "Plugin name (kebab-case)" "my-plugin")
  if validate_plugin_name "$PLUGIN_NAME"; then
    break
  fi
done

PLUGIN_PATH="$PLUGIN_DIR/$PLUGIN_NAME"

# Check if directory exists
if [[ -d "$PLUGIN_PATH" ]]; then
  print_error "Directory already exists: $PLUGIN_PATH"
  exit 1
fi

# Step 2: Plugin metadata
DESCRIPTION=$(prompt_with_default "Plugin description" "A Claude Code plugin")
VERSION=$(prompt_with_default "Initial version" "0.1.0")
LICENSE=$(prompt_with_default "License" "MIT")

# Get author info from git config or prompt
GIT_USER=$(git config user.name 2>/dev/null || echo "")
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")

AUTHOR_NAME=$(prompt_with_default "Author name" "${GIT_USER:-Author Name}")
AUTHOR_EMAIL=$(prompt_with_default "Author email" "${GIT_EMAIL:-author@example.com}")

# Step 3: Plugin components
echo
print_step "Plugin Components"
echo
print_info "Select which components to include:"
echo

WITH_SKILLS=$(prompt_yes_no "Include skills?" "n")
WITH_COMMANDS=$(prompt_yes_no "Include slash commands?" "n")
WITH_AGENTS=$(prompt_yes_no "Include custom agents?" "n")
WITH_HOOKS=$(prompt_yes_no "Include event hooks?" "n")
WITH_MCP=$(prompt_yes_no "Include MCP server?" "n")

# Step 4: Repository setup
echo
print_step "Repository Configuration"
echo

INIT_GIT=$(prompt_yes_no "Initialize git repository?" "y")
CREATE_GITHUB_ACTIONS=$(prompt_yes_no "Add GitHub Actions workflow?" "n")

# Step 5: Confirmation
echo
print_step "Summary"
echo
echo "Plugin Name:    $PLUGIN_NAME"
echo "Location:       $PLUGIN_PATH"
echo "Description:    $DESCRIPTION"
echo "Version:        $VERSION"
echo "License:        $LICENSE"
echo "Author:         $AUTHOR_NAME <$AUTHOR_EMAIL>"
echo
echo "Components:"
[[ "$WITH_SKILLS" == "y" ]] && echo "  ✓ Skills"
[[ "$WITH_COMMANDS" == "y" ]] && echo "  ✓ Slash Commands"
[[ "$WITH_AGENTS" == "y" ]] && echo "  ✓ Custom Agents"
[[ "$WITH_HOOKS" == "y" ]] && echo "  ✓ Event Hooks"
[[ "$WITH_MCP" == "y" ]] && echo "  ✓ MCP Server"
echo

if [[ "$INTERACTIVE" == "true" ]]; then
  CONFIRM=$(prompt_yes_no "Create plugin?" "y")
  if [[ "$CONFIRM" != "y" ]]; then
    print_warn "Cancelled"
    exit 0
  fi
fi

# Create plugin structure
echo
print_info "Creating plugin structure..."

mkdir -p "$PLUGIN_PATH/.claude-plugin"

# Create plugin.json
print_info "Creating plugin.json"
cat > "$PLUGIN_PATH/.claude-plugin/plugin.json" << EOF
{
  "name": "$PLUGIN_NAME",
  "version": "$VERSION",
  "description": "$DESCRIPTION",
  "author": {
    "name": "$AUTHOR_NAME",
    "email": "$AUTHOR_EMAIL"
  },
  "license": "$LICENSE",
  "keywords": []
}
EOF

# Create README.md
print_info "Creating README.md"
cat > "$PLUGIN_PATH/README.md" << EOF
# $PLUGIN_NAME

$DESCRIPTION

## Installation

\`\`\`bash
# Add marketplace
/plugin marketplace add <path-or-repo>

# Install plugin
/plugin install $PLUGIN_NAME@$PLUGIN_NAME
\`\`\`

## Features

TODO: List your plugin features

## Usage

TODO: Describe how to use your plugin

## Development

TODO: Add development instructions

## License

$LICENSE License - see [LICENSE](LICENSE) for details.
EOF

# Create CHANGELOG.md
print_info "Creating CHANGELOG.md"
cat > "$PLUGIN_PATH/CHANGELOG.md" << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [$VERSION] - $(date +%Y-%m-%d)

### Added
- Initial release
EOF

# Create LICENSE
print_info "Creating LICENSE"
if [[ "$LICENSE" == "MIT" ]]; then
  cat > "$PLUGIN_PATH/LICENSE" << EOF
MIT License

Copyright (c) $(date +%Y) $AUTHOR_NAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
else
  touch "$PLUGIN_PATH/LICENSE"
  print_warn "Please add $LICENSE license text to LICENSE file"
fi

# Create .gitignore
cat > "$PLUGIN_PATH/.gitignore" << 'EOF'
# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# Environment
.env
.env.local

# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/
dist/
build/

# Test coverage
coverage/
.coverage
*.cover
EOF

# Create components based on selections
if [[ "$WITH_SKILLS" == "y" ]]; then
  print_info "Creating skills structure"
  mkdir -p "$PLUGIN_PATH/skills/example-skill"

  cat > "$PLUGIN_PATH/skills/example-skill/SKILL.md" << 'EOF'
---
name: example-skill
description: An example skill that demonstrates skill authoring
version: 0.1.0
---

# Example Skill

This is an example skill. Skills are automatically activated based on:
- Keywords in the description
- User mentioning the skill name
- Context matching skill capabilities

## What This Skill Does

Describe what this skill helps with.

## When to Use

This skill activates when:
- Condition 1
- Condition 2
- Condition 3

## Quick Start

Provide a quick example of using this skill.

## Detailed Guide

Add comprehensive documentation here.
EOF

  print_info "Add skills to plugin.json manually or use the skill authoring tools"
fi

if [[ "$WITH_COMMANDS" == "y" ]]; then
  print_info "Creating commands structure"
  mkdir -p "$PLUGIN_PATH/commands"

  cat > "$PLUGIN_PATH/commands/hello.md" << 'EOF'
---
description: "Say hello with a friendly greeting"
---

Generate a friendly greeting for {{0:name}}.

Make the greeting:
- Warm and welcoming
- Include time of day
- Professional yet friendly
EOF
fi

if [[ "$WITH_AGENTS" == "y" ]]; then
  print_info "Creating agents structure"
  mkdir -p "$PLUGIN_PATH/agents"

  cat > "$PLUGIN_PATH/agents/helper.md" << 'EOF'
---
name: helper
description: "A helpful assistant for common tasks"
---

You are a helpful assistant specialized in [domain].

Your responsibilities:
1. Task 1
2. Task 2
3. Task 3

Guidelines:
- Be clear and concise
- Provide examples
- Explain your reasoning
EOF

  # Update plugin.json
  tmp=$(mktemp)
  jq '.agents = ["./agents/helper.md"]' "$PLUGIN_PATH/.claude-plugin/plugin.json" > "$tmp"
  mv "$tmp" "$PLUGIN_PATH/.claude-plugin/plugin.json"
fi

if [[ "$WITH_HOOKS" == "y" ]]; then
  print_info "Creating hooks structure"
  mkdir -p "$PLUGIN_PATH/hooks"

  cat > "$PLUGIN_PATH/hooks/example-hook.sh" << 'EOF'
#!/usr/bin/env bash

# Example hook - receives JSON on stdin, outputs JSON to stdout
input=$(cat)

# Parse input
file_path=$(echo "$input" | jq -r '.parameters.file_path // empty')

# Add your logic here
# For PreToolUse hooks, you can approve/block:
# echo '{"allowed": true}'
# echo '{"allowed": false, "reason": "validation failed"}'

# For PostToolUse hooks, you can modify the result:
# echo "$input" | jq '.result.modified = true'

# Default: allow the operation
echo '{"allowed": true}'
EOF
  chmod +x "$PLUGIN_PATH/hooks/example-hook.sh"

  print_info "Add hooks to plugin.json manually or use the hook authoring tools"
fi

if [[ "$WITH_MCP" == "y" ]]; then
  print_info "Creating MCP server structure"
  mkdir -p "$PLUGIN_PATH/servers/$PLUGIN_NAME-server"

  cat > "$PLUGIN_PATH/servers/$PLUGIN_NAME-server/server.py" << EOF
"""MCP server for $PLUGIN_NAME"""
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("$PLUGIN_NAME")

@mcp.tool()
async def example_tool(param: str) -> str:
    """
    Example tool implementation.

    Args:
        param: Parameter description

    Returns:
        Result description
    """
    return f"Processed: {param}"

if __name__ == "__main__":
    mcp.run(transport='stdio')
EOF

  cat > "$PLUGIN_PATH/servers/$PLUGIN_NAME-server/pyproject.toml" << EOF
[project]
name = "$PLUGIN_NAME-server"
version = "$VERSION"
description = "MCP server for $PLUGIN_NAME"
requires-python = ">=3.10"
dependencies = [
    "mcp>=1.2.0",
]
EOF

  # Update plugin.json
  tmp=$(mktemp)
  jq --arg name "$PLUGIN_NAME" '.mcpServers = {($name): {"command": "uv", "args": ["--directory", "${CLAUDE_PLUGIN_ROOT}/servers/\($name)-server", "run", "server.py"]}}' "$PLUGIN_PATH/.claude-plugin/plugin.json" > "$tmp"
  mv "$tmp" "$PLUGIN_PATH/.claude-plugin/plugin.json"
fi

# Create GitHub Actions workflow if requested
if [[ "$CREATE_GITHUB_ACTIONS" == "y" ]]; then
  print_info "Creating GitHub Actions workflow"
  mkdir -p "$PLUGIN_PATH/.github/workflows"

  cat > "$PLUGIN_PATH/.github/workflows/validate.yml" << 'EOF'
name: Validate Plugin

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate plugin.json
        run: |
          # Add validation logic here
          if [ ! -f ".claude-plugin/plugin.json" ]; then
            echo "Error: plugin.json not found"
            exit 1
          fi

          # Validate JSON syntax
          jq empty .claude-plugin/plugin.json
EOF
fi

# Initialize git repository
if [[ "$INIT_GIT" == "y" ]] && command -v git &> /dev/null; then
  print_info "Initializing git repository"
  cd "$PLUGIN_PATH"
  git init -q
  git add .
  git commit -q -m "feat: initial plugin structure

- Generated with outfitter init-plugin.sh
- Initialized $PLUGIN_NAME v$VERSION"
  cd - > /dev/null
fi

# Success message
echo
print_info "✓ Plugin created successfully!"
echo
echo -e "${BLUE}Plugin Location:${NC} $PLUGIN_PATH"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. cd $PLUGIN_PATH"
echo "  2. Edit .claude-plugin/plugin.json to update metadata"
echo "  3. Update README.md with plugin details"
[[ "$WITH_SKILLS" == "y" ]] && echo "  4. Customize skills in skills/"
[[ "$WITH_COMMANDS" == "y" ]] && echo "  4. Add commands to commands/"
[[ "$WITH_AGENTS" == "y" ]] && echo "  4. Customize agents in agents/"
[[ "$WITH_HOOKS" == "y" ]] && echo "  4. Implement hooks in hooks/"
[[ "$WITH_MCP" == "y" ]] && echo "  4. Implement MCP server in servers/"
echo
echo -e "${YELLOW}Test Locally:${NC}"
echo "  /plugin marketplace add $PLUGIN_PATH"
echo "  /plugin install $PLUGIN_NAME@$PLUGIN_NAME"
echo
print_info "Happy coding!"
