#!/usr/bin/env bash

# scaffold-plugin.sh - Create a new Claude Code plugin structure

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored output
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Usage information
usage() {
  cat << EOF
Usage: $0 [options] <plugin-name>

Create a new Claude Code plugin with proper structure.

Options:
  -d, --directory DIR   Create plugin in specified directory (default: current)
  -a, --author NAME     Author name
  -e, --email EMAIL     Author email
  -l, --license LICENSE License (default: MIT)
  --with-commands       Include sample command
  --with-agent          Include sample agent
  --with-hooks          Include sample hooks
  --with-mcp            Include MCP server template
  -h, --help            Show this help message

Example:
  $0 my-plugin --author "John Doe" --with-commands
  $0 my-plugin -d ./plugins --with-agent --with-hooks

EOF
  exit 1
}

# Default values
PLUGIN_DIR="."
AUTHOR_NAME=""
AUTHOR_EMAIL=""
LICENSE="MIT"
WITH_COMMANDS=false
WITH_AGENT=false
WITH_HOOKS=false
WITH_MCP=false

# Parse arguments
PLUGIN_NAME=""
while [[ $# -gt 0 ]]; do
  case $1 in
    -d|--directory)
      PLUGIN_DIR="$2"
      shift 2
      ;;
    -a|--author)
      AUTHOR_NAME="$2"
      shift 2
      ;;
    -e|--email)
      AUTHOR_EMAIL="$2"
      shift 2
      ;;
    -l|--license)
      LICENSE="$2"
      shift 2
      ;;
    --with-commands)
      WITH_COMMANDS=true
      shift
      ;;
    --with-agent)
      WITH_AGENT=true
      shift
      ;;
    --with-hooks)
      WITH_HOOKS=true
      shift
      ;;
    --with-mcp)
      WITH_MCP=true
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
      if [[ -z "$PLUGIN_NAME" ]]; then
        PLUGIN_NAME="$1"
      else
        print_error "Unexpected argument: $1"
        usage
      fi
      shift
      ;;
  esac
done

# Validate plugin name
if [[ -z "$PLUGIN_NAME" ]]; then
  print_error "Plugin name is required"
  usage
fi

# Validate plugin name format (kebab-case)
if ! echo "$PLUGIN_NAME" | grep -qE '^[a-z][a-z0-9-]*$'; then
  print_error "Plugin name must be in kebab-case (lowercase with hyphens): $PLUGIN_NAME"
  exit 1
fi

# Get author info if not provided
if [[ -z "$AUTHOR_NAME" ]]; then
  # Try to get from git config
  AUTHOR_NAME=$(git config user.name 2>/dev/null || echo "")
  if [[ -z "$AUTHOR_NAME" ]]; then
    read -p "Author name: " AUTHOR_NAME
  fi
fi

if [[ -z "$AUTHOR_EMAIL" ]]; then
  AUTHOR_EMAIL=$(git config user.email 2>/dev/null || echo "")
  if [[ -z "$AUTHOR_EMAIL" ]]; then
    read -p "Author email: " AUTHOR_EMAIL
  fi
fi

# Create plugin directory
PLUGIN_PATH="$PLUGIN_DIR/$PLUGIN_NAME"
if [[ -d "$PLUGIN_PATH" ]]; then
  print_error "Directory already exists: $PLUGIN_PATH"
  exit 1
fi

print_info "Creating plugin: $PLUGIN_NAME"
mkdir -p "$PLUGIN_PATH"

# Create plugin.json
print_info "Creating plugin.json"
cat > "$PLUGIN_PATH/plugin.json" << EOF
{
  "name": "$PLUGIN_NAME",
  "version": "0.1.0",
  "description": "A Claude Code plugin",
  "author": {
    "name": "$AUTHOR_NAME",
    "email": "$AUTHOR_EMAIL"
  },
  "license": "$LICENSE"
}
EOF

# Create README.md
print_info "Creating README.md"
cat > "$PLUGIN_PATH/README.md" << EOF
# $PLUGIN_NAME

A Claude Code plugin.

## Installation

\`\`\`bash
/plugin marketplace add path/to/$PLUGIN_NAME
/plugin install $PLUGIN_NAME@$PLUGIN_NAME
\`\`\`

## Features

- Feature 1
- Feature 2

## Usage

Describe how to use this plugin.

## License

$LICENSE
EOF

# Create CHANGELOG.md
print_info "Creating CHANGELOG.md"
cat > "$PLUGIN_PATH/CHANGELOG.md" << EOF
# Changelog

## [0.1.0] - $(date +%Y-%m-%d)

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
cat > "$PLUGIN_PATH/.gitignore" << EOF
*.log
.DS_Store
.env
node_modules/
__pycache__/
*.pyc
.venv/
EOF

# Create sample command if requested
if [[ "$WITH_COMMANDS" == true ]]; then
  print_info "Creating sample command"
  mkdir -p "$PLUGIN_PATH/commands"
  cat > "$PLUGIN_PATH/commands/hello.md" << EOF
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

# Create sample agent if requested
if [[ "$WITH_AGENT" == true ]]; then
  print_info "Creating sample agent"
  mkdir -p "$PLUGIN_PATH/agents"
  cat > "$PLUGIN_PATH/agents/helper.md" << EOF
---
name: helper
description: "A helpful assistant for common tasks"
---

You are a helpful assistant specialized in [your domain].

Your responsibilities:
1. Task 1
2. Task 2
3. Task 3

Guidelines:
- Be clear and concise
- Provide examples
- Explain your reasoning
EOF

  # Update plugin.json to reference agent
  tmp=$(mktemp)
  jq '.agents = ["./agents/helper.md"]' "$PLUGIN_PATH/plugin.json" > "$tmp"
  mv "$tmp" "$PLUGIN_PATH/plugin.json"
fi

# Create sample hooks if requested
if [[ "$WITH_HOOKS" == true ]]; then
  print_info "Creating sample hooks"
  mkdir -p "$PLUGIN_PATH/hooks"
  cat > "$PLUGIN_PATH/hooks/pre-write.sh" << 'EOF'
#!/usr/bin/env bash

# Pre-write validation hook
input=$(cat)

file_path=$(echo "$input" | jq -r '.parameters.file_path')
content=$(echo "$input" | jq -r '.parameters.content')

# Add your validation logic here

# Allow the operation
echo '{"allowed": true}'
EOF
  chmod +x "$PLUGIN_PATH/hooks/pre-write.sh"

  # Update plugin.json to reference hooks
  tmp=$(mktemp)
  jq '.hooks = {"PreToolUse": [{"matcher": "Write", "hooks": [{"type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/pre-write.sh"}]}]}' "$PLUGIN_PATH/plugin.json" > "$tmp"
  mv "$tmp" "$PLUGIN_PATH/plugin.json"
fi

# Create MCP server template if requested
if [[ "$WITH_MCP" == true ]]; then
  print_info "Creating MCP server template"
  mkdir -p "$PLUGIN_PATH/servers/$PLUGIN_NAME-server"

  cat > "$PLUGIN_PATH/servers/$PLUGIN_NAME-server/server.py" << 'EOF'
"""MCP server for PLUGIN_NAME"""
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("PLUGIN_NAME")

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

  # Replace PLUGIN_NAME in template
  sed -i.bak "s/PLUGIN_NAME/$PLUGIN_NAME/g" "$PLUGIN_PATH/servers/$PLUGIN_NAME-server/server.py"
  rm "$PLUGIN_PATH/servers/$PLUGIN_NAME-server/server.py.bak"

  cat > "$PLUGIN_PATH/servers/$PLUGIN_NAME-server/pyproject.toml" << EOF
[project]
name = "$PLUGIN_NAME-server"
version = "0.1.0"
description = "MCP server for $PLUGIN_NAME"
requires-python = ">=3.10"
dependencies = [
    "mcp>=1.2.0",
]
EOF

  # Update plugin.json to reference MCP server
  tmp=$(mktemp)
  jq --arg name "$PLUGIN_NAME" '.mcpServers = {($name): {"command": "uv", "args": ["--directory", "${CLAUDE_PLUGIN_ROOT}/servers/\($name)-server", "run", "server.py"]}}' "$PLUGIN_PATH/plugin.json" > "$tmp"
  mv "$tmp" "$PLUGIN_PATH/plugin.json"
fi

# Initialize git repository
if command -v git &> /dev/null; then
  print_info "Initializing git repository"
  cd "$PLUGIN_PATH"
  git init -q
  git add .
  git commit -q -m "feat: initial plugin structure"
  cd - > /dev/null
fi

# Success message
print_info "Plugin created successfully!"
echo ""
echo "Next steps:"
echo "  cd $PLUGIN_PATH"
echo "  # Edit plugin.json to update description"
if [[ "$WITH_COMMANDS" == true ]]; then
  echo "  # Customize commands in commands/"
fi
if [[ "$WITH_AGENT" == true ]]; then
  echo "  # Customize agent in agents/"
fi
if [[ "$WITH_HOOKS" == true ]]; then
  echo "  # Implement hooks in hooks/"
fi
if [[ "$WITH_MCP" == true ]]; then
  echo "  # Implement MCP server in servers/"
fi
echo ""
echo "Test locally:"
echo "  /plugin marketplace add $PLUGIN_PATH"
echo "  /plugin install $PLUGIN_NAME@$PLUGIN_NAME"
