#!/usr/bin/env bash

# create-marketplace.sh - Create a new Claude Code plugin marketplace

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
  cat << EOF
Usage: $0 [options]

Create a new Claude Code plugin marketplace.

Options:
  -n, --name NAME         Marketplace name (kebab-case)
  -o, --owner NAME        Owner name
  -e, --email EMAIL       Owner email
  -d, --description DESC  Marketplace description
  -r, --plugin-root PATH  Base path for relative plugin sources
  --dir DIRECTORY         Output directory (default: current)
  -h, --help              Show this help message

Example:
  $0 --name my-marketplace --owner "John Doe" --email "john@example.com"

EOF
  exit 1
}

# Default values
MARKETPLACE_NAME=""
OWNER_NAME=""
OWNER_EMAIL=""
DESCRIPTION=""
PLUGIN_ROOT=""
OUTPUT_DIR="."

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -n|--name)
      MARKETPLACE_NAME="$2"
      shift 2
      ;;
    -o|--owner)
      OWNER_NAME="$2"
      shift 2
      ;;
    -e|--email)
      OWNER_EMAIL="$2"
      shift 2
      ;;
    -d|--description)
      DESCRIPTION="$2"
      shift 2
      ;;
    -r|--plugin-root)
      PLUGIN_ROOT="$2"
      shift 2
      ;;
    --dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      print_error "Unknown option: $1"
      usage
      ;;
  esac
done

# Validate marketplace name
if [[ -z "$MARKETPLACE_NAME" ]]; then
  print_error "Marketplace name is required"
  usage
fi

if ! echo "$MARKETPLACE_NAME" | grep -qE '^[a-z][a-z0-9-]*$'; then
  print_error "Marketplace name must be in kebab-case: $MARKETPLACE_NAME"
  exit 1
fi

# Get owner info if not provided
if [[ -z "$OWNER_NAME" ]]; then
  OWNER_NAME=$(git config user.name 2>/dev/null || echo "")
  if [[ -z "$OWNER_NAME" ]]; then
    read -p "Owner name: " OWNER_NAME
  fi
fi

if [[ -z "$OWNER_EMAIL" ]]; then
  OWNER_EMAIL=$(git config user.email 2>/dev/null || echo "")
  if [[ -z "$OWNER_EMAIL" ]]; then
    read -p "Owner email: " OWNER_EMAIL
  fi
fi

# Create output directory
MARKETPLACE_DIR="$OUTPUT_DIR/.claude-plugin"
mkdir -p "$MARKETPLACE_DIR"

print_info "Creating marketplace: $MARKETPLACE_NAME"

# Build marketplace JSON
MARKETPLACE_JSON=$(jq -n \
  --arg name "$MARKETPLACE_NAME" \
  --arg owner_name "$OWNER_NAME" \
  --arg owner_email "$OWNER_EMAIL" \
  '{
    name: $name,
    owner: {
      name: $owner_name,
      email: $owner_email
    },
    plugins: []
  }')

# Add optional fields
if [[ -n "$DESCRIPTION" ]]; then
  MARKETPLACE_JSON=$(echo "$MARKETPLACE_JSON" | jq \
    --arg desc "$DESCRIPTION" \
    '.metadata.description = $desc')
fi

if [[ -n "$PLUGIN_ROOT" ]]; then
  MARKETPLACE_JSON=$(echo "$MARKETPLACE_JSON" | jq \
    --arg root "$PLUGIN_ROOT" \
    '.metadata.pluginRoot = $root')
fi

# Write marketplace.json
echo "$MARKETPLACE_JSON" | jq '.' > "$MARKETPLACE_DIR/marketplace.json"

print_info "Created marketplace.json at $MARKETPLACE_DIR/marketplace.json"

# Create README
README_PATH="$OUTPUT_DIR/README.md"
if [[ ! -f "$README_PATH" ]]; then
  cat > "$README_PATH" << EOF
# $MARKETPLACE_NAME

$DESCRIPTION

## Installation

\`\`\`bash
/plugin marketplace add path/to/$MARKETPLACE_NAME
\`\`\`

## Available Plugins

[List your plugins here]

## Usage

\`\`\`bash
# Install a plugin
/plugin install plugin-name@$MARKETPLACE_NAME
\`\`\`

## Contributing

[Add contribution guidelines]

## License

[Specify license]
EOF
  print_info "Created README.md"
fi

# Create .gitignore if it doesn't exist
GITIGNORE_PATH="$OUTPUT_DIR/.gitignore"
if [[ ! -f "$GITIGNORE_PATH" ]]; then
  cat > "$GITIGNORE_PATH" << EOF
*.log
.DS_Store
node_modules/
__pycache__/
.env
EOF
  print_info "Created .gitignore"
fi

# Initialize git if not already a repo
if [[ ! -d "$OUTPUT_DIR/.git" ]] && command -v git &> /dev/null; then
  print_info "Initializing git repository"
  cd "$OUTPUT_DIR"
  git init -q
  git add .
  git commit -q -m "feat: initial marketplace structure"
  cd - > /dev/null
fi

# Success message
print_info "Marketplace created successfully!"
echo ""
echo "Next steps:"
echo "  1. Add plugins to $MARKETPLACE_DIR/marketplace.json"
echo "  2. Create plugin directories"
echo "  3. Test locally:"
echo "     /plugin marketplace add $OUTPUT_DIR"
echo "  4. Push to Git hosting:"
echo "     git remote add origin <url>"
echo "     git push -u origin main"
