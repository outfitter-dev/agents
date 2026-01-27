#!/usr/bin/env bash
# validate-hook.sh - Validate Claude Code hook configuration and scripts
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# Help text
show_help() {
  cat << EOF
Usage: $(basename "$0") <config-file> [options]

Validate Claude Code hook configuration and referenced scripts.

Arguments:
  config-file         Path to settings.json file with hooks configuration

Options:
  -s, --strict        Strict mode (warnings become errors)
  -q, --quiet         Only show errors and warnings
  --check-scripts     Verify all referenced scripts exist and are executable
  -h, --help          Show this help

Examples:
  # Validate project hooks
  $(basename "$0") .claude/settings.json

  # Validate personal hooks
  $(basename "$0") ~/.claude/settings.json

  # Strict validation with script checking
  $(basename "$0") .claude/settings.json --strict --check-scripts

Exit Codes:
  0 - Validation passed
  1 - Validation failed with errors
EOF
}

# Error reporting
error() {
  ((ERRORS++))
  echo -e "${RED}✗ Error:${NC} $1"
}

warning() {
  ((WARNINGS++))
  echo -e "${YELLOW}⚠ Warning:${NC} $1"
}

info() {
  if [[ "$QUIET" == "false" ]]; then
    echo -e "${BLUE}ℹ Info:${NC} $1"
  fi
}

success() {
  if [[ "$QUIET" == "false" ]]; then
    echo -e "${GREEN}✓ $1${NC}"
  fi
}

# Parse arguments
CONFIG_FILE=""
STRICT=false
QUIET=false
CHECK_SCRIPTS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -s|--strict)
      STRICT=true
      shift
      ;;
    -q|--quiet)
      QUIET=true
      shift
      ;;
    --check-scripts)
      CHECK_SCRIPTS=true
      shift
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      CONFIG_FILE="$1"
      shift
      ;;
  esac
done

# Validate file argument
if [[ -z "$CONFIG_FILE" ]]; then
  echo -e "${RED}Error: Config file required${NC}"
  show_help
  exit 1
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
  error "File not found: $CONFIG_FILE"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &>/dev/null; then
  error "jq is not installed (required for JSON validation)"
  exit 1
fi

# Start validation
if [[ "$QUIET" == "false" ]]; then
  echo -e "${BLUE}Validating: $CONFIG_FILE${NC}"
  echo
fi

# 1. Validate JSON syntax
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
  error "Invalid JSON syntax"
  exit 1
fi

success "JSON syntax valid"

# 2. Check if hooks exist in config
if ! jq -e '.hooks' "$CONFIG_FILE" >/dev/null 2>&1; then
  info "No hooks configuration found (file is valid but has no hooks)"
  exit 0
fi

success "Hooks configuration found"

# 3. Validate hook structure
VALID_EVENTS=(PreToolUse PostToolUse UserPromptSubmit Notification Stop SubagentStop PreCompact SessionStart SessionEnd)

# Get all event names
EVENTS=$(jq -r '.hooks | keys[]' "$CONFIG_FILE" 2>/dev/null || echo "")

if [[ -z "$EVENTS" ]]; then
  warning "No events defined in hooks configuration"
fi

TOTAL_HOOKS=0

while IFS= read -r event; do
  [[ -z "$event" ]] && continue

  # Check if valid event
  if [[ ! " ${VALID_EVENTS[*]} " =~ " ${event} " ]]; then
    error "Invalid event type: $event (valid: ${VALID_EVENTS[*]})"
    continue
  fi

  success "Event: $event"

  # Validate event structure
  EVENT_ARRAY=$(jq -c ".hooks.\"$event\"" "$CONFIG_FILE")

  # Check if array
  if ! echo "$EVENT_ARRAY" | jq -e 'type == "array"' >/dev/null 2>&1; then
    error "Event '$event' must be an array"
    continue
  fi

  # Get array length
  ARRAY_LENGTH=$(echo "$EVENT_ARRAY" | jq 'length')
  info "  Found $ARRAY_LENGTH matcher(s) for $event"

  # Validate each matcher entry
  for ((i=0; i<ARRAY_LENGTH; i++)); do
    MATCHER_ENTRY=$(echo "$EVENT_ARRAY" | jq -c ".[$i]")

    # Check for matcher field
    if ! echo "$MATCHER_ENTRY" | jq -e '.matcher' >/dev/null 2>&1; then
      error "  Entry $i in $event: missing 'matcher' field"
      continue
    fi

    MATCHER=$(echo "$MATCHER_ENTRY" | jq -r '.matcher')
    info "  Matcher: $MATCHER"

    # Validate matcher pattern
    if [[ -z "$MATCHER" ]]; then
      warning "  Empty matcher pattern"
    fi

    # Check for hooks array
    if ! echo "$MATCHER_ENTRY" | jq -e '.hooks' >/dev/null 2>&1; then
      error "  Entry $i in $event: missing 'hooks' array"
      continue
    fi

    if ! echo "$MATCHER_ENTRY" | jq -e '.hooks | type == "array"' >/dev/null 2>&1; then
      error "  Entry $i in $event: 'hooks' must be an array"
      continue
    fi

    # Validate each hook in the array
    HOOKS_LENGTH=$(echo "$MATCHER_ENTRY" | jq '.hooks | length')
    ((TOTAL_HOOKS += HOOKS_LENGTH))

    for ((j=0; j<HOOKS_LENGTH; j++)); do
      HOOK=$(echo "$MATCHER_ENTRY" | jq -c ".hooks[$j]")

      # Check type field
      if ! echo "$HOOK" | jq -e '.type' >/dev/null 2>&1; then
        error "    Hook $j: missing 'type' field"
        continue
      fi

      HOOK_TYPE=$(echo "$HOOK" | jq -r '.type')
      if [[ "$HOOK_TYPE" != "command" ]]; then
        error "    Hook $j: invalid type '$HOOK_TYPE' (must be 'command')"
      fi

      # Check command field
      if ! echo "$HOOK" | jq -e '.command' >/dev/null 2>&1; then
        error "    Hook $j: missing 'command' field"
        continue
      fi

      COMMAND=$(echo "$HOOK" | jq -r '.command')
      info "    Command: $COMMAND"

      # Check if command is empty
      if [[ -z "$COMMAND" ]]; then
        error "    Hook $j: empty command"
        continue
      fi

      # Check timeout
      if echo "$HOOK" | jq -e '.timeout' >/dev/null 2>&1; then
        TIMEOUT=$(echo "$HOOK" | jq -r '.timeout')
        if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]]; then
          error "    Hook $j: timeout must be a number"
        elif [[ "$TIMEOUT" -lt 1 ]]; then
          error "    Hook $j: timeout must be at least 1 second"
        elif [[ "$TIMEOUT" -gt 300 ]]; then
          warning "    Hook $j: timeout is very long ($TIMEOUT seconds)"
        fi
      else
        info "    Using default timeout (30 seconds)"
      fi

      # Check script if enabled
      if [[ "$CHECK_SCRIPTS" == "true" ]]; then
        # Extract script path (handle variables)
        SCRIPT_PATH="$COMMAND"

        # Replace common variables
        SCRIPT_PATH="${SCRIPT_PATH//\$CLAUDE_PROJECT_DIR/$(dirname "$CONFIG_FILE")}"
        SCRIPT_PATH="${SCRIPT_PATH//\$\{CLAUDE_PROJECT_DIR\}/$(dirname "$CONFIG_FILE")}"
        SCRIPT_PATH="${SCRIPT_PATH//\~/~}"

        # Extract first argument (script path)
        SCRIPT_PATH=$(echo "$SCRIPT_PATH" | awk '{print $1}')

        # Remove quotes
        SCRIPT_PATH="${SCRIPT_PATH//\"/}"
        SCRIPT_PATH="${SCRIPT_PATH//\'/}"

        # Check if script exists
        if [[ -f "$SCRIPT_PATH" ]]; then
          success "    Script exists: $SCRIPT_PATH"

          # Check if executable
          if [[ ! -x "$SCRIPT_PATH" ]]; then
            warning "    Script not executable: $SCRIPT_PATH (run: chmod +x $SCRIPT_PATH)"
          else
            success "    Script is executable"
          fi

          # Check shebang
          FIRST_LINE=$(head -n 1 "$SCRIPT_PATH")
          if [[ ! "$FIRST_LINE" =~ ^#! ]]; then
            warning "    Script missing shebang line"
          fi
        elif [[ "$SCRIPT_PATH" =~ ^\$ ]] || [[ "$SCRIPT_PATH" =~ ^(echo|printf|cat|true|false|test|:)$ ]]; then
          info "    Inline/built-in command, skipping script check"
        else
          warning "    Script not found: $SCRIPT_PATH"
        fi
      fi
    done
  done

  echo
done <<< "$EVENTS"

# Summary
info "Total hooks validated: $TOTAL_HOOKS"
echo

# 4. Check for common issues

# Duplicate matchers
DUPLICATE_MATCHERS=$(jq -r '.hooks | to_entries[] | .key as $event | .value[] | .matcher | "\($event):\(.)"' "$CONFIG_FILE" | sort | uniq -c | awk '$1 > 1 {print $0}')
if [[ -n "$DUPLICATE_MATCHERS" ]]; then
  warning "Duplicate matchers found (may cause hooks to run multiple times):"
  echo "$DUPLICATE_MATCHERS" | while read -r line; do
    warning "  $line"
  done
fi

# Very long commands
LONG_COMMANDS=$(jq -r '.hooks | to_entries[] | .value[] | .hooks[] | .command | select(length > 200)' "$CONFIG_FILE" 2>/dev/null || echo "")
if [[ -n "$LONG_COMMANDS" ]]; then
  warning "Very long commands found (consider using script files):"
  echo "$LONG_COMMANDS" | while IFS= read -r cmd; do
    warning "  ${cmd:0:100}..."
  done
fi

# Hooks without timeout
HOOKS_WITHOUT_TIMEOUT=$(jq '[.hooks | to_entries[] | .value[] | .hooks[] | select(.timeout == null)] | length' "$CONFIG_FILE")
if [[ "$HOOKS_WITHOUT_TIMEOUT" -gt 0 ]]; then
  info "$HOOKS_WITHOUT_TIMEOUT hook(s) using default timeout"
fi

# PreToolUse hooks with long timeouts
SLOW_PRE_HOOKS=$(jq -r '.hooks.PreToolUse[]? | .hooks[] | select(.timeout > 10) | .command' "$CONFIG_FILE" 2>/dev/null || echo "")
if [[ -n "$SLOW_PRE_HOOKS" ]]; then
  warning "PreToolUse hooks with timeout >10s (may slow down operations):"
  echo "$SLOW_PRE_HOOKS" | while IFS= read -r cmd; do
    warning "  $cmd"
  done
fi

# Convert warnings to errors in strict mode
if [[ "$STRICT" == "true" && $WARNINGS -gt 0 ]]; then
  ERRORS=$((ERRORS + WARNINGS))
  WARNINGS=0
fi

# Final summary
echo
if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
  echo -e "${GREEN}✓ Validation passed!${NC}"
  exit 0
elif [[ $ERRORS -eq 0 ]]; then
  echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo -e "${RED}✗ Validation failed with $ERRORS error(s)${NC}"
  if [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}  and $WARNINGS warning(s)${NC}"
  fi
  exit 1
fi
