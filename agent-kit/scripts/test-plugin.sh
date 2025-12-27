#!/usr/bin/env bash

# test-plugin.sh - Test Claude Code plugin locally

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Cleanup flag
CLEANUP_ON_EXIT=true
TEST_MARKETPLACE_DIR=""
NON_INTERACTIVE=false

# Cleanup function
cleanup() {
  if [[ "$CLEANUP_ON_EXIT" == "true" && -n "$TEST_MARKETPLACE_DIR" && -d "$TEST_MARKETPLACE_DIR" ]]; then
    print_info "Cleaning up test marketplace: $TEST_MARKETPLACE_DIR"
    rm -rf "$TEST_MARKETPLACE_DIR"
  fi
}

trap cleanup EXIT

# Usage
usage() {
  cat << EOF
Usage: $0 [options] <plugin-directory>

Test a Claude Code plugin locally before distribution.

Arguments:
  plugin-directory    Path to plugin root directory

Options:
  -k, --keep-temp     Keep temporary marketplace directory
  -v, --validate      Run validation before testing
  -n, --non-interactive  Skip interactive prompts (for CI/automated use)
  -h, --help          Show this help

Examples:
  # Test current plugin
  $0 .

  # Test and keep marketplace
  $0 --keep-temp /path/to/my-plugin

  # Validate and test
  $0 --validate .

What This Script Does:
  1. Creates a temporary local marketplace
  2. Adds your plugin to the marketplace
  3. Provides instructions for testing
  4. Cleans up temporary files (unless --keep-temp)

Note: This script prepares the test environment but does NOT
      install the plugin automatically. You'll need to run
      the Claude Code plugin commands manually to test.

EOF
  exit 0
}

# Parse arguments
PLUGIN_DIR=""
RUN_VALIDATION=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -k|--keep-temp)
      CLEANUP_ON_EXIT=false
      shift
      ;;
    -v|--validate)
      RUN_VALIDATION=true
      shift
      ;;
    -n|--non-interactive)
      NON_INTERACTIVE=true
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
      PLUGIN_DIR="$1"
      shift
      ;;
  esac
done

# Validate arguments
if [[ -z "$PLUGIN_DIR" ]]; then
  print_error "Plugin directory required"
  usage
fi

if [[ ! -d "$PLUGIN_DIR" ]]; then
  print_error "Directory not found: $PLUGIN_DIR"
  exit 1
fi

# Convert to absolute path
PLUGIN_DIR=$(cd "$PLUGIN_DIR" && pwd)

# Check for plugin.json
PLUGIN_JSON="$PLUGIN_DIR/.claude-plugin/plugin.json"
if [[ ! -f "$PLUGIN_JSON" ]]; then
  print_error "Not a valid plugin: .claude-plugin/plugin.json not found"
  exit 1
fi

# Extract plugin info
PLUGIN_NAME=$(jq -r '.name // empty' "$PLUGIN_JSON")
PLUGIN_VERSION=$(jq -r '.version // empty' "$PLUGIN_JSON")

if [[ -z "$PLUGIN_NAME" ]]; then
  print_error "Plugin name not found in plugin.json"
  exit 1
fi

# Print header
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Claude Code Plugin Testing          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo
echo -e "${CYAN}Plugin:${NC}   $PLUGIN_NAME"
echo -e "${CYAN}Version:${NC}  $PLUGIN_VERSION"
echo -e "${CYAN}Path:${NC}     $PLUGIN_DIR"
echo

# Step 1: Optional validation
if [[ "$RUN_VALIDATION" == "true" ]]; then
  print_step "Running validation"
  echo

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  VALIDATE_SCRIPT="$SCRIPT_DIR/validate-plugin.sh"

  if [[ -f "$VALIDATE_SCRIPT" ]]; then
    if ! "$VALIDATE_SCRIPT" "$PLUGIN_DIR"; then
      print_error "Validation failed. Fix errors before testing."
      exit 1
    fi
    echo
  else
    print_warn "validate-plugin.sh not found, skipping validation"
    echo
  fi
fi

# Step 2: Create temporary marketplace
print_step "Creating test marketplace"

TEST_MARKETPLACE_DIR=$(mktemp -d -t claude-test-marketplace.XXXXXX)
print_info "Test marketplace: $TEST_MARKETPLACE_DIR"

# Create marketplace structure
mkdir -p "$TEST_MARKETPLACE_DIR/.claude-plugin"

# Create marketplace.json
cat > "$TEST_MARKETPLACE_DIR/.claude-plugin/marketplace.json" << EOF
{
  "name": "test-marketplace",
  "version": "1.0.0",
  "description": "Temporary test marketplace for plugin development",
  "plugins": [
    {
      "name": "$PLUGIN_NAME",
      "source": {
        "type": "local",
        "path": "$PLUGIN_DIR"
      }
    }
  ]
}
EOF

print_info "Created marketplace configuration"
echo

# Step 3: Provide test instructions
print_step "Test Instructions"
echo

echo -e "${CYAN}To test your plugin, run these commands in Claude Code:${NC}"
echo
echo -e "${YELLOW}1. Add the test marketplace:${NC}"
echo "   /plugin marketplace add $TEST_MARKETPLACE_DIR"
echo
echo -e "${YELLOW}2. List available plugins:${NC}"
echo "   /plugin"
echo
echo -e "${YELLOW}3. Install your plugin:${NC}"
echo "   /plugin install $PLUGIN_NAME@test-marketplace"
echo
echo -e "${YELLOW}4. Test your plugin components:${NC}"

# Check what components exist and provide specific test instructions
HAS_SKILLS=false
HAS_COMMANDS=false
HAS_AGENTS=false
HAS_HOOKS=false
HAS_MCP=false

if [[ -d "$PLUGIN_DIR/skills" ]] && [[ -n "$(find "$PLUGIN_DIR/skills" -name "SKILL.md" 2>/dev/null)" ]]; then
  HAS_SKILLS=true
fi

if [[ -d "$PLUGIN_DIR/commands" ]] && [[ -n "$(find "$PLUGIN_DIR/commands" -name "*.md" 2>/dev/null)" ]]; then
  HAS_COMMANDS=true
fi

if [[ -d "$PLUGIN_DIR/agents" ]] && [[ -n "$(find "$PLUGIN_DIR/agents" -name "*.md" 2>/dev/null)" ]]; then
  HAS_AGENTS=true
fi

if [[ -d "$PLUGIN_DIR/hooks" ]]; then
  HAS_HOOKS=true
fi

if [[ -d "$PLUGIN_DIR/servers" ]]; then
  HAS_MCP=true
fi

if [[ "$HAS_SKILLS" == "true" ]]; then
  echo "   • Skills are auto-activated - mention relevant keywords in prompts"
fi

if [[ "$HAS_COMMANDS" == "true" ]]; then
  echo "   • Test commands by typing slash commands (e.g., /command-name)"
  echo "   • List commands: /help"
fi

if [[ "$HAS_AGENTS" == "true" ]]; then
  echo "   • Agents are auto-invoked based on their configuration"
fi

if [[ "$HAS_HOOKS" == "true" ]]; then
  echo "   • Hooks run automatically on configured events"
  echo "   • Check settings to verify hooks are registered"
fi

if [[ "$HAS_MCP" == "true" ]]; then
  echo "   • MCP tools should be available automatically"
  echo "   • Check Claude Code logs if tools don't appear"
fi

if [[ "$HAS_SKILLS" == "false" && "$HAS_COMMANDS" == "false" && "$HAS_AGENTS" == "false" ]]; then
  echo "   • Plugin components not detected"
  echo "   • Ensure your plugin has skills/, commands/, or agents/"
fi

echo
echo -e "${YELLOW}5. Verify installation:${NC}"
echo "   /plugin info $PLUGIN_NAME"
echo
echo -e "${YELLOW}6. When done testing, uninstall:${NC}"
echo "   /plugin uninstall $PLUGIN_NAME"
echo "   /plugin marketplace remove test-marketplace"
echo

# Step 4: Additional tips
print_step "Testing Tips"
echo

echo -e "${CYAN}Common Issues:${NC}"
echo "  • If plugin doesn't appear: Check marketplace.json syntax"
echo "  • If skills don't activate: Verify SKILL.md frontmatter"
echo "  • If commands fail: Check command syntax and arguments"
echo "  • If hooks don't fire: Ensure scripts are executable (chmod +x)"
echo "  • If MCP tools missing: Check server configuration in plugin.json"
echo

echo -e "${CYAN}Debugging:${NC}"
echo "  • Check Claude Code logs for errors"
echo "  • Use /plugin info to see plugin details"
echo "  • Verify file paths in plugin.json are correct"
echo "  • Test components individually before combining"
echo

echo -e "${CYAN}Before Distribution:${NC}"
echo "  • Test all plugin components thoroughly"
echo "  • Update README.md with clear instructions"
echo "  • Run validation: ./scripts/validate-plugin.sh $PLUGIN_DIR"
echo "  • Update version in plugin.json"
echo "  • Update CHANGELOG.md with changes"
echo

# Step 5: Wait or exit
if [[ "$CLEANUP_ON_EXIT" == "false" ]]; then
  print_info "Test marketplace will be preserved at:"
  echo "  $TEST_MARKETPLACE_DIR"
  echo
  print_info "Remember to clean up manually when done:"
  echo "  rm -rf $TEST_MARKETPLACE_DIR"
  echo
elif [[ "$NON_INTERACTIVE" == "true" ]]; then
  print_info "Non-interactive mode: skipping wait"
  print_info "Test marketplace will be cleaned up automatically"
else
  print_info "Test marketplace will be cleaned up automatically"
  print_warn "Press Ctrl+C to cancel and keep the marketplace"
  echo
  echo -e "${CYAN}Press Enter when done testing...${NC}"
  read -r
fi

echo
print_info "Testing session complete!"
