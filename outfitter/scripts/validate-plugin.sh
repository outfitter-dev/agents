#!/usr/bin/env bash

# validate-plugin.sh - Comprehensive Claude Code plugin validation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS=0

# Options
STRICT_MODE=false
QUIET_MODE=false
FIX_MODE=false

# Print functions
print_error() {
  ((ERRORS++))
  echo -e "${RED}✗ ERROR:${NC} $1"
}

print_warning() {
  ((WARNINGS++))
  echo -e "${YELLOW}⚠ WARNING:${NC} $1"
}

print_info() {
  [[ "$QUIET_MODE" == "false" ]] && echo -e "${BLUE}ℹ INFO:${NC} $1"
}

print_success() {
  [[ "$QUIET_MODE" == "false" ]] && echo -e "${GREEN}✓ PASS:${NC} $1"
}

print_check() {
  ((CHECKS++))
  [[ "$QUIET_MODE" == "false" ]] && echo -e "${CYAN}[CHECK $CHECKS]${NC} $1"
}

# Usage
usage() {
  cat << EOF
Usage: $0 [options] <plugin-directory>

Comprehensive validation for Claude Code plugins.

Arguments:
  plugin-directory    Path to plugin root directory

Options:
  -s, --strict        Treat warnings as errors
  -q, --quiet         Only show errors and warnings
  -f, --fix           Auto-fix issues where possible
  -h, --help          Show this help

Examples:
  # Validate current plugin
  $0 .

  # Validate specific plugin
  $0 /path/to/my-plugin

  # Strict validation
  $0 --strict .

  # Auto-fix common issues
  $0 --fix .

Exit Codes:
  0 - No errors
  1 - Validation errors found
  2 - Invalid arguments or plugin not found

EOF
  exit 2
}

# Parse arguments
PLUGIN_DIR=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -s|--strict)
      STRICT_MODE=true
      shift
      ;;
    -q|--quiet)
      QUIET_MODE=true
      shift
      ;;
    -f|--fix)
      FIX_MODE=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
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
  echo -e "${RED}Error: Plugin directory required${NC}"
  usage
fi

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo -e "${RED}Error: Directory not found: $PLUGIN_DIR${NC}"
  exit 2
fi

# Convert to absolute path
PLUGIN_DIR=$(cd "$PLUGIN_DIR" && pwd)

# Print header
if [[ "$QUIET_MODE" == "false" ]]; then
  echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║     Claude Code Plugin Validation         ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
  echo
  echo -e "${CYAN}Plugin Directory:${NC} $PLUGIN_DIR"
  echo
fi

# Check 1: plugin.json exists
print_check "Checking for plugin.json"
PLUGIN_JSON="$PLUGIN_DIR/.claude-plugin/plugin.json"

if [[ ! -f "$PLUGIN_JSON" ]]; then
  print_error "plugin.json not found at .claude-plugin/plugin.json"
  exit 1
else
  print_success "plugin.json exists"
fi

# Check 2: plugin.json is valid JSON
print_check "Validating plugin.json syntax"
if ! jq empty "$PLUGIN_JSON" 2>/dev/null; then
  print_error "plugin.json contains invalid JSON"
  exit 1
else
  print_success "plugin.json is valid JSON"
fi

# Check 3: Required fields in plugin.json
print_check "Validating plugin.json required fields"

PLUGIN_NAME=$(jq -r '.name // empty' "$PLUGIN_JSON")
PLUGIN_VERSION=$(jq -r '.version // empty' "$PLUGIN_JSON")
PLUGIN_DESC=$(jq -r '.description // empty' "$PLUGIN_JSON")

if [[ -z "$PLUGIN_NAME" ]]; then
  print_error "plugin.json missing required field: name"
else
  print_success "Plugin name: $PLUGIN_NAME"

  # Validate name format
  if [[ ! "$PLUGIN_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    print_error "Plugin name must be kebab-case: $PLUGIN_NAME"
  fi
fi

if [[ -z "$PLUGIN_VERSION" ]]; then
  print_error "plugin.json missing required field: version"
else
  print_success "Plugin version: $PLUGIN_VERSION"

  # Validate semantic versioning
  if [[ ! "$PLUGIN_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
    print_warning "Version should follow semantic versioning (e.g., 1.0.0)"
  fi
fi

if [[ -z "$PLUGIN_DESC" ]]; then
  print_warning "plugin.json missing recommended field: description"
else
  print_success "Plugin description present"

  # Check description length
  DESC_LEN=${#PLUGIN_DESC}
  if [[ $DESC_LEN -lt 20 ]]; then
    print_warning "Description is very short ($DESC_LEN chars)"
  elif [[ $DESC_LEN -gt 200 ]]; then
    print_warning "Description is very long ($DESC_LEN chars), consider shortening"
  fi
fi

# Check 4: Author info
print_check "Validating author information"
AUTHOR_NAME=$(jq -r '.author.name // empty' "$PLUGIN_JSON")
AUTHOR_EMAIL=$(jq -r '.author.email // empty' "$PLUGIN_JSON")

if [[ -z "$AUTHOR_NAME" ]]; then
  print_warning "plugin.json missing recommended field: author.name"
else
  print_success "Author: $AUTHOR_NAME"
fi

if [[ -z "$AUTHOR_EMAIL" ]]; then
  print_warning "plugin.json missing recommended field: author.email"
elif [[ ! "$AUTHOR_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  print_warning "Author email appears invalid: $AUTHOR_EMAIL"
fi

# Check 5: License
print_check "Checking license"
PLUGIN_LICENSE=$(jq -r '.license // empty' "$PLUGIN_JSON")

if [[ -z "$PLUGIN_LICENSE" ]]; then
  print_warning "plugin.json missing recommended field: license"
else
  print_success "License: $PLUGIN_LICENSE"

  # Check for LICENSE file
  if [[ ! -f "$PLUGIN_DIR/LICENSE" ]] && [[ ! -f "$PLUGIN_DIR/LICENSE.md" ]]; then
    print_warning "No LICENSE file found in plugin root"
  fi
fi

# Check 6: README.md
print_check "Checking README.md"
if [[ ! -f "$PLUGIN_DIR/README.md" ]]; then
  print_warning "No README.md found in plugin root"
else
  print_success "README.md exists"

  # Check README length
  README_LINES=$(wc -l < "$PLUGIN_DIR/README.md")
  if [[ $README_LINES -lt 10 ]]; then
    print_warning "README.md is very short ($README_LINES lines)"
  fi
fi

# Check 7: Validate skills
print_check "Validating skills"
SKILLS_DIR="$PLUGIN_DIR/skills"

if [[ -d "$SKILLS_DIR" ]]; then
  SKILL_COUNT=$(find "$SKILLS_DIR" -name "SKILL.md" | wc -l | xargs)
  if [[ $SKILL_COUNT -eq 0 ]]; then
    print_warning "skills/ directory exists but contains no SKILL.md files"
  else
    print_success "Found $SKILL_COUNT skill(s)"

    # Validate each skill
    while IFS= read -r skill_file; do
      SKILL_NAME=$(dirname "$skill_file" | xargs basename)
      print_info "Validating skill: $SKILL_NAME"

      # Check for frontmatter
      if ! head -n 1 "$skill_file" | grep -q '^---$'; then
        print_warning "Skill $SKILL_NAME missing frontmatter"
      else
        # Validate required frontmatter fields
        SKILL_FRONTMATTER=$(awk '/^---$/{flag=!flag; next} flag' "$skill_file" | head -n 20)

        if ! echo "$SKILL_FRONTMATTER" | grep -q '^name:'; then
          print_error "Skill $SKILL_NAME missing 'name' in frontmatter"
        fi

        if ! echo "$SKILL_FRONTMATTER" | grep -q '^description:'; then
          print_error "Skill $SKILL_NAME missing 'description' in frontmatter"
        fi

        if ! echo "$SKILL_FRONTMATTER" | grep -q '^version:'; then
          print_warning "Skill $SKILL_NAME missing 'version' in frontmatter"
        fi
      fi

      # Check file size (skills should have substantial content)
      SKILL_SIZE=$(wc -c < "$skill_file")
      if [[ $SKILL_SIZE -lt 500 ]]; then
        print_warning "Skill $SKILL_NAME is very small ($SKILL_SIZE bytes)"
      fi
    done < <(find "$SKILLS_DIR" -name "SKILL.md")
  fi
else
  print_info "No skills/ directory found"
fi

# Check 8: Validate commands
print_check "Validating slash commands"
COMMANDS_DIR="$PLUGIN_DIR/commands"

if [[ -d "$COMMANDS_DIR" ]]; then
  COMMAND_COUNT=$(find "$COMMANDS_DIR" -name "*.md" | wc -l | xargs)
  if [[ $COMMAND_COUNT -eq 0 ]]; then
    print_warning "commands/ directory exists but contains no .md files"
  else
    print_success "Found $COMMAND_COUNT command(s)"

    # Validate each command
    while IFS= read -r cmd_file; do
      CMD_NAME=$(basename "$cmd_file" .md)
      print_info "Validating command: $CMD_NAME"

      # Check filename format
      if [[ ! "$CMD_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
        print_warning "Command name should be kebab-case: $CMD_NAME"
      fi

      # Check if file is empty
      if [[ ! -s "$cmd_file" ]]; then
        print_error "Command $CMD_NAME is empty"
        continue
      fi

      # Check for frontmatter
      if head -n 1 "$cmd_file" | grep -q '^---$'; then
        # Validate frontmatter syntax
        FRONTMATTER=$(awk '/^---$/{flag=!flag; next} flag' "$cmd_file" | head -n 20)

        # Check for description
        if echo "$FRONTMATTER" | grep -q '^description:'; then
          DESC=$(echo "$FRONTMATTER" | grep '^description:' | sed 's/^description: *//')
          if [[ -z "$DESC" ]]; then
            print_warning "Command $CMD_NAME has empty description"
          fi
        fi

        # Check for tabs in frontmatter (YAML doesn't allow tabs)
        if echo "$FRONTMATTER" | grep -q $'\t'; then
          print_error "Command $CMD_NAME frontmatter contains tabs (use spaces)"
        fi
      fi
    done < <(find "$COMMANDS_DIR" -name "*.md")
  fi
else
  print_info "No commands/ directory found"
fi

# Check 9: Validate agents
print_check "Validating custom agents"
AGENTS_DIR="$PLUGIN_DIR/agents"

if [[ -d "$AGENTS_DIR" ]]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -name "*.md" | wc -l | xargs)
  if [[ $AGENT_COUNT -eq 0 ]]; then
    print_warning "agents/ directory exists but contains no .md files"
  else
    print_success "Found $AGENT_COUNT agent(s)"

    # Check if agents are referenced in plugin.json
    AGENTS_IN_JSON=$(jq -r '.agents // [] | length' "$PLUGIN_JSON")
    if [[ $AGENTS_IN_JSON -eq 0 ]]; then
      print_warning "Agents found but not referenced in plugin.json"
    fi

    # Validate each agent
    while IFS= read -r agent_file; do
      AGENT_NAME=$(basename "$agent_file" .md)
      print_info "Validating agent: $AGENT_NAME"

      # Check for frontmatter
      if ! head -n 1 "$agent_file" | grep -q '^---$'; then
        print_warning "Agent $AGENT_NAME missing frontmatter"
      else
        AGENT_FRONTMATTER=$(awk '/^---$/{flag=!flag; next} flag' "$agent_file" | head -n 20)

        if ! echo "$AGENT_FRONTMATTER" | grep -q '^name:'; then
          print_error "Agent $AGENT_NAME missing 'name' in frontmatter"
        fi

        if ! echo "$AGENT_FRONTMATTER" | grep -q '^description:'; then
          print_error "Agent $AGENT_NAME missing 'description' in frontmatter"
        fi
      fi
    done < <(find "$AGENTS_DIR" -name "*.md")
  fi
else
  print_info "No agents/ directory found"
fi

# Check 10: Validate hooks
print_check "Validating event hooks"
HOOKS_DIR="$PLUGIN_DIR/hooks"

if [[ -d "$HOOKS_DIR" ]]; then
  HOOK_COUNT=$(find "$HOOKS_DIR" -type f | wc -l | xargs)
  if [[ $HOOK_COUNT -eq 0 ]]; then
    print_warning "hooks/ directory exists but contains no files"
  else
    print_success "Found $HOOK_COUNT hook file(s)"

    # Check if hooks are referenced in plugin.json
    HOOKS_IN_JSON=$(jq -r '.hooks // {} | length' "$PLUGIN_JSON")
    if [[ $HOOKS_IN_JSON -eq 0 ]]; then
      print_warning "Hook files found but not configured in plugin.json"
    fi

    # Validate each hook script
    while IFS= read -r hook_file; do
      HOOK_NAME=$(basename "$hook_file")
      print_info "Validating hook: $HOOK_NAME"

      # Check if file is executable
      if [[ ! -x "$hook_file" ]]; then
        if [[ "$FIX_MODE" == "true" ]]; then
          chmod +x "$hook_file"
          print_info "Fixed: Made $HOOK_NAME executable"
        else
          print_warning "Hook $HOOK_NAME is not executable (use chmod +x)"
        fi
      fi

      # Check for shebang
      if ! head -n 1 "$hook_file" | grep -q '^#!'; then
        print_warning "Hook $HOOK_NAME missing shebang line"
      fi
    done < <(find "$HOOKS_DIR" -type f)
  fi
else
  print_info "No hooks/ directory found"
fi

# Check 11: Validate MCP servers
print_check "Validating MCP servers"
SERVERS_DIR="$PLUGIN_DIR/servers"

if [[ -d "$SERVERS_DIR" ]]; then
  SERVER_COUNT=$(find "$SERVERS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | xargs)
  if [[ $SERVER_COUNT -eq 0 ]]; then
    print_warning "servers/ directory exists but contains no server directories"
  else
    print_success "Found $SERVER_COUNT MCP server(s)"

    # Check if servers are referenced in plugin.json
    SERVERS_IN_JSON=$(jq -r '.mcpServers // {} | length' "$PLUGIN_JSON")
    if [[ $SERVERS_IN_JSON -eq 0 ]]; then
      print_warning "MCP servers found but not configured in plugin.json"
    fi

    # Validate each server
    while IFS= read -r server_dir; do
      SERVER_NAME=$(basename "$server_dir")
      print_info "Validating MCP server: $SERVER_NAME"

      # Check for server implementation
      if [[ -f "$server_dir/server.py" ]]; then
        print_success "Found Python server implementation"

        # Check for pyproject.toml
        if [[ ! -f "$server_dir/pyproject.toml" ]]; then
          print_warning "Server $SERVER_NAME missing pyproject.toml"
        fi
      elif [[ -f "$server_dir/index.js" ]] || [[ -f "$server_dir/index.ts" ]]; then
        print_success "Found Node.js server implementation"

        # Check for package.json
        if [[ ! -f "$server_dir/package.json" ]]; then
          print_warning "Server $SERVER_NAME missing package.json"
        fi
      else
        print_warning "Server $SERVER_NAME missing server implementation file"
      fi
    done < <(find "$SERVERS_DIR" -mindepth 1 -maxdepth 1 -type d)
  fi
else
  print_info "No servers/ directory found"
fi

# Check 12: Check for common files
print_check "Checking for common files"

if [[ ! -f "$PLUGIN_DIR/.gitignore" ]]; then
  print_warning "No .gitignore found"
else
  print_success ".gitignore exists"
fi

if [[ ! -f "$PLUGIN_DIR/CHANGELOG.md" ]]; then
  print_warning "No CHANGELOG.md found (recommended for versioning)"
else
  print_success "CHANGELOG.md exists"
fi

# Check 13: Git repository
print_check "Checking git repository"
if [[ ! -d "$PLUGIN_DIR/.git" ]]; then
  print_info "Not a git repository"
else
  print_success "Git repository initialized"

  # Check for uncommitted changes
  if ! git -C "$PLUGIN_DIR" diff-index --quiet HEAD -- 2>/dev/null; then
    print_info "Repository has uncommitted changes"
  fi
fi

# Summary
echo
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Validation Summary              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo

echo -e "${CYAN}Checks Performed:${NC} $CHECKS"

if [[ $ERRORS -gt 0 ]]; then
  echo -e "${RED}Errors Found:${NC}     $ERRORS"
fi

if [[ $WARNINGS -gt 0 ]]; then
  echo -e "${YELLOW}Warnings Found:${NC}   $WARNINGS"
fi

echo

# Convert warnings to errors in strict mode
if [[ "$STRICT_MODE" == "true" && $WARNINGS -gt 0 ]]; then
  ERRORS=$((ERRORS + WARNINGS))
  WARNINGS=0
  echo -e "${YELLOW}(Strict mode: warnings treated as errors)${NC}"
  echo
fi

# Exit with appropriate code
if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
  echo -e "${GREEN}✓ Validation passed! Plugin is ready to use.${NC}"
  exit 0
elif [[ $ERRORS -eq 0 ]]; then
  echo -e "${YELLOW}⚠ Validation passed with warnings.${NC}"
  echo -e "${YELLOW}  Consider addressing warnings before distribution.${NC}"
  exit 0
else
  echo -e "${RED}✗ Validation failed!${NC}"
  echo -e "${RED}  Please fix errors before using this plugin.${NC}"
  exit 1
fi
