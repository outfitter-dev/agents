#!/usr/bin/env bash
# validate-command.sh - Validate Claude Code slash command structure
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
Usage: $(basename "$0") <command-file> [options]

Validate Claude Code slash command structure and frontmatter.

Arguments:
  command-file        Path to command .md file

Options:
  -s, --strict        Strict mode (warnings become errors)
  -q, --quiet         Only show errors and warnings
  -h, --help          Show this help

Examples:
  # Validate single command
  $(basename "$0") .claude/commands/deploy.md

  # Validate all commands in directory
  find .claude/commands -name "*.md" -exec $(basename "$0") {} \;

  # Strict validation
  $(basename "$0") my-command.md --strict
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
COMMAND_FILE=""
STRICT=false
QUIET=false

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
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      COMMAND_FILE="$1"
      shift
      ;;
  esac
done

# Validate file argument
if [[ -z "$COMMAND_FILE" ]]; then
  echo -e "${RED}Error: Command file required${NC}"
  show_help
  exit 1
fi

if [[ ! -f "$COMMAND_FILE" ]]; then
  error "File not found: $COMMAND_FILE"
  exit 1
fi

# Start validation
if [[ "$QUIET" == "false" ]]; then
  echo -e "${BLUE}Validating: $COMMAND_FILE${NC}"
  echo
fi

# 1. Check filename
FILENAME=$(basename "$COMMAND_FILE")
if [[ ! "$FILENAME" =~ \.md$ ]]; then
  error "File must have .md extension"
fi

COMMAND_NAME="${FILENAME%.md}"
if [[ ! "$COMMAND_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  warning "Command name should be kebab-case: $COMMAND_NAME"
fi

# 2. Check file is not empty
if [[ ! -s "$COMMAND_FILE" ]]; then
  error "File is empty"
  exit 1
fi

# 3. Extract frontmatter if present
HAS_FRONTMATTER=false
FRONTMATTER=""
IN_FRONTMATTER=false
LINE_NUM=0
CONTENT_START=0

while IFS= read -r line; do
  ((LINE_NUM++))

  if [[ $LINE_NUM -eq 1 && "$line" == "---" ]]; then
    HAS_FRONTMATTER=true
    IN_FRONTMATTER=true
    continue
  fi

  if [[ "$IN_FRONTMATTER" == "true" ]]; then
    if [[ "$line" == "---" ]]; then
      IN_FRONTMATTER=false
      CONTENT_START=$LINE_NUM
      break
    fi
    FRONTMATTER+="$line"$'\n'
  fi
done < "$COMMAND_FILE"

# 4. Validate frontmatter if present
if [[ "$HAS_FRONTMATTER" == "true" ]]; then
  success "Frontmatter found"

  # Check for unclosed frontmatter
  if [[ "$IN_FRONTMATTER" == "true" ]]; then
    error "Frontmatter not properly closed (missing closing ---)"
  fi

  # Validate YAML syntax (basic check)
  if ! echo "$FRONTMATTER" | grep -qE '^[a-z-]+:'; then
    warning "Frontmatter might have invalid YAML syntax"
  fi

  # Check for common fields
  if echo "$FRONTMATTER" | grep -q '^description:'; then
    DESCRIPTION=$(echo "$FRONTMATTER" | grep '^description:' | sed 's/^description: *//')
    if [[ -n "$DESCRIPTION" ]]; then
      success "Description: $DESCRIPTION"

      # Check description length
      DESC_LENGTH=${#DESCRIPTION}
      if [[ $DESC_LENGTH -gt 100 ]]; then
        warning "Description is long ($DESC_LENGTH chars). Consider keeping under 80 chars."
      fi
    else
      warning "Description field is empty"
    fi
  else
    warning "No description field (will use first line of content)"
  fi

  # Check argument-hint
  if echo "$FRONTMATTER" | grep -q '^argument-hint:'; then
    ARG_HINT=$(echo "$FRONTMATTER" | grep '^argument-hint:' | sed 's/^argument-hint: *//')
    info "Argument hint: $ARG_HINT"
  fi

  # Check allowed-tools
  if echo "$FRONTMATTER" | grep -q '^allowed-tools:'; then
    TOOLS=$(echo "$FRONTMATTER" | grep '^allowed-tools:' | sed 's/^allowed-tools: *//')
    info "Allowed tools: $TOOLS"

    # Validate tool names - check for names starting with lowercase
    # Claude tools are PascalCase (Read, Write, BashOutput)
    for tool in $(echo "$TOOLS" | tr ',' ' '); do
      tool=$(echo "$tool" | xargs)  # trim whitespace
      if [[ -n "$tool" && "$tool" =~ ^[a-z] ]]; then
        warning "Tool name '$tool' starts with lowercase (Claude tools are PascalCase, e.g., 'Read')"
      fi
    done
  fi

  # Check model
  if echo "$FRONTMATTER" | grep -q '^model:'; then
    MODEL=$(echo "$FRONTMATTER" | grep '^model:' | sed 's/^model: *//')
    info "Model: $MODEL"
  fi

  # Check for tabs (YAML doesn't allow tabs)
  if echo "$FRONTMATTER" | grep -q $'\t'; then
    error "Frontmatter contains tabs (YAML requires spaces)"
  fi

else
  info "No frontmatter (optional, but recommended)"
fi

# 5. Check content
CONTENT=$(tail -n +"$((CONTENT_START + 1))" "$COMMAND_FILE")

if [[ -z "$CONTENT" ]]; then
  error "No content after frontmatter"
else
  success "Content present"

  # Check content length
  CONTENT_LENGTH=${#CONTENT}
  if [[ $CONTENT_LENGTH -lt 20 ]]; then
    warning "Content is very short ($CONTENT_LENGTH chars)"
  fi

  # Check for argument usage
  if echo "$CONTENT" | grep -qE '\$[0-9]|\$ARGUMENTS'; then
    ARG_USAGE=$(echo "$CONTENT" | grep -oE '\$[0-9]|\$ARGUMENTS' | sort -u | tr '\n' ' ')
    info "Uses arguments: $ARG_USAGE"

    # Check if argument-hint is present
    if [[ "$HAS_FRONTMATTER" == "true" ]]; then
      if ! echo "$FRONTMATTER" | grep -q '^argument-hint:'; then
        warning "Command uses arguments but has no argument-hint in frontmatter"
      fi
    fi
  fi

  # Check for bash execution
  if echo "$CONTENT" | grep -qE '!\`[^`]+\`'; then
    BASH_COUNT=$(echo "$CONTENT" | grep -oE '!\`[^`]+\`' | wc -l | xargs)
    info "Uses bash execution ($BASH_COUNT commands)"

    # Check if Bash tool is allowed
    if [[ "$HAS_FRONTMATTER" == "true" ]]; then
      if echo "$FRONTMATTER" | grep -q '^allowed-tools:'; then
        if ! echo "$FRONTMATTER" | grep 'allowed-tools:' | grep -q 'Bash'; then
          warning "Command uses bash execution but Bash not in allowed-tools"
        fi
      fi
    fi
  fi

  # Check for file references
  if echo "$CONTENT" | grep -qE '@[a-zA-Z0-9$/_.-]+'; then
    FILE_REFS=$(echo "$CONTENT" | grep -oE '@[a-zA-Z0-9$/_.-]+' | wc -l | xargs)
    info "Uses file references ($FILE_REFS references)"

    # Check if Read tool is allowed
    if [[ "$HAS_FRONTMATTER" == "true" ]]; then
      if echo "$FRONTMATTER" | grep -q '^allowed-tools:'; then
        if ! echo "$FRONTMATTER" | grep 'allowed-tools:' | grep -q 'Read'; then
          warning "Command uses file references but Read not in allowed-tools"
        fi
      fi
    fi
  fi
fi

# 6. Check for common issues

# Unclosed code blocks (odd number of ``` markers indicates unclosed block)
FENCE_COUNT=$(echo "$CONTENT" | grep -c '^```' || true)
if [[ $FENCE_COUNT -gt 0 && $((FENCE_COUNT % 2)) -ne 0 ]]; then
  warning "Possibly unclosed code block (odd number of \`\`\` markers)"
fi

# Very long lines
while IFS= read -r line; do
  if [[ ${#line} -gt 200 ]]; then
    warning "Line longer than 200 characters (consider breaking up)"
    break
  fi
done < "$COMMAND_FILE"

# Convert warnings to errors in strict mode
if [[ "$STRICT" == "true" && $WARNINGS -gt 0 ]]; then
  ERRORS=$((ERRORS + WARNINGS))
  WARNINGS=0
fi

# Summary
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
