#!/usr/bin/env bash
# validate-skill.sh - Validate Claude Code Agent Skill structure
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
Usage: $(basename "$0") <skill-directory> [options]

Validate Claude Code Agent Skill structure, frontmatter, and best practices.

Arguments:
  skill-directory     Path to skill directory containing SKILL.md

Options:
  -s, --strict        Strict mode (warnings become errors)
  -q, --quiet         Only show errors and warnings
  --check-description Check description quality (length, keywords)
  --check-references  Verify referenced files exist
  -h, --help          Show this help

Examples:
  # Validate single skill
  $(basename "$0") .claude/skills/my-skill

  # Validate all project skills
  find .claude/skills -type d -maxdepth 1 -exec $(basename "$0") {} \;

  # Strict validation with all checks
  $(basename "$0") my-skill --strict --check-description --check-references
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
SKILL_DIR=""
STRICT=false
QUIET=false
CHECK_DESCRIPTION=false
CHECK_REFERENCES=false

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
    --check-description)
      CHECK_DESCRIPTION=true
      shift
      ;;
    --check-references)
      CHECK_REFERENCES=true
      shift
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      SKILL_DIR="$1"
      shift
      ;;
  esac
done

# Validate directory argument
if [[ -z "$SKILL_DIR" ]]; then
  echo -e "${RED}Error: Skill directory required${NC}"
  show_help
  exit 1
fi

if [[ ! -d "$SKILL_DIR" ]]; then
  error "Directory not found: $SKILL_DIR"
  exit 1
fi

# Resolve to absolute path for better error messages
SKILL_DIR=$(cd "$SKILL_DIR" && pwd)
SKILL_NAME=$(basename "$SKILL_DIR")

# Start validation
if [[ "$QUIET" == "false" ]]; then
  echo -e "${BLUE}Validating skill: $SKILL_NAME${NC}"
  echo -e "${BLUE}Location: $SKILL_DIR${NC}"
  echo
fi

# 1. Check SKILL.md exists
SKILL_FILE="$SKILL_DIR/SKILL.md"
if [[ ! -f "$SKILL_FILE" ]]; then
  error "SKILL.md not found (required)"
  exit 1
fi
success "SKILL.md exists"

# 2. Check file is not empty
if [[ ! -s "$SKILL_FILE" ]]; then
  error "SKILL.md is empty"
  exit 1
fi

# 3. Check directory name format (kebab-case)
if [[ ! "$SKILL_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  warning "Skill directory name should be kebab-case: $SKILL_NAME"
fi

# 4. Extract and validate frontmatter
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
done < "$SKILL_FILE"

# 5. Validate frontmatter
if [[ "$HAS_FRONTMATTER" == "false" ]]; then
  error "No frontmatter found (required for skills)"
else
  success "Frontmatter found"

  # Check for unclosed frontmatter
  if [[ "$IN_FRONTMATTER" == "true" ]]; then
    error "Frontmatter not properly closed (missing closing ---)"
  fi

  # Check for tabs (YAML doesn't allow tabs)
  if echo "$FRONTMATTER" | grep -q $'\t'; then
    error "Frontmatter contains tabs (YAML requires spaces)"
  fi

  # Validate YAML syntax (basic check)
  if ! echo "$FRONTMATTER" | grep -qE '^[a-z-]+:'; then
    warning "Frontmatter might have invalid YAML syntax"
  fi

  # Check for required field: name
  if echo "$FRONTMATTER" | grep -q '^name:'; then
    SKILL_NAME_FM=$(echo "$FRONTMATTER" | grep '^name:' | sed 's/^name: *//')
    if [[ -n "$SKILL_NAME_FM" ]]; then
      success "Name: $SKILL_NAME_FM"

      # Verify name matches directory
      if [[ "$SKILL_NAME_FM" != "$SKILL_NAME" ]]; then
        warning "Frontmatter name ($SKILL_NAME_FM) differs from directory name ($SKILL_NAME)"
      fi

      # Check name format
      if [[ ! "$SKILL_NAME_FM" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
        warning "Skill name should be kebab-case: $SKILL_NAME_FM"
      fi
    else
      warning "Name field is empty"
    fi
  else
    error "No 'name' field in frontmatter (required)"
  fi

  # Check for required field: description
  if echo "$FRONTMATTER" | grep -q '^description:'; then
    # Handle multi-line descriptions (YAML literal block)
    DESCRIPTION=$(echo "$FRONTMATTER" | awk '/^description:/{flag=1; sub(/^description: */, ""); print; next} flag && /^[^ ]/{flag=0} flag{print}')

    if [[ -n "$DESCRIPTION" ]]; then
      success "Description found"

      if [[ "$CHECK_DESCRIPTION" == "true" ]]; then
        # Check description length
        DESC_LENGTH=${#DESCRIPTION}
        if [[ $DESC_LENGTH -lt 30 ]]; then
          warning "Description is short ($DESC_LENGTH chars). Add more detail for better discovery."
        elif [[ $DESC_LENGTH -gt 300 ]]; then
          warning "Description is long ($DESC_LENGTH chars). Consider being more concise."
        else
          info "Description length: $DESC_LENGTH chars (good)"
        fi

        # Check for "Use when" clause
        if ! echo "$DESCRIPTION" | grep -iq "use when"; then
          warning "Description missing 'Use when' clause for better discovery"
        fi

        # Check for trigger keywords
        if ! echo "$DESCRIPTION" | grep -iq "trigger\|mention\|working with"; then
          info "Consider adding trigger keywords to description for better discovery"
        fi

        # Check for file extensions or specific terms
        if ! echo "$DESCRIPTION" | grep -iqE '\.(json|pdf|csv|xlsx|ts|js|py|rs)|API|database|git'; then
          info "Consider adding specific file types or domain terms to description"
        fi
      fi
    else
      warning "Description field is empty"
    fi
  else
    error "No 'description' field in frontmatter (required)"
  fi

  # Check allowed-tools
  if echo "$FRONTMATTER" | grep -q '^allowed-tools:'; then
    TOOLS=$(echo "$FRONTMATTER" | grep '^allowed-tools:' | sed 's/^allowed-tools: *//')
    info "Allowed tools: $TOOLS"

    # Validate tool names (should be capitalized)
    if echo "$TOOLS" | grep -qE '\b(read|write|edit|grep|glob|bash)\b'; then
      warning "Tool names should be capitalized (e.g., 'Read' not 'read')"
    fi

    # Check for common tool patterns
    if echo "$TOOLS" | grep -q 'Bash([^)]*)'; then
      success "Bash tool restrictions specified"
    fi
  else
    info "No tool restrictions (inherits from conversation)"
  fi

  # Check version
  if echo "$FRONTMATTER" | grep -q '^version:'; then
    VERSION=$(echo "$FRONTMATTER" | grep '^version:' | sed 's/^version: *//')
    if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      success "Version: $VERSION (semantic versioning)"
    else
      warning "Version should follow semantic versioning (e.g., 1.0.0): $VERSION"
    fi
  else
    info "No version specified (optional)"
  fi

  # Check author
  if echo "$FRONTMATTER" | grep -q '^author:'; then
    AUTHOR=$(echo "$FRONTMATTER" | grep '^author:' | sed 's/^author: *//')
    info "Author: $AUTHOR"
  fi

  # Check keywords
  if echo "$FRONTMATTER" | grep -q '^keywords:'; then
    KEYWORDS=$(echo "$FRONTMATTER" | grep '^keywords:' | sed 's/^keywords: *//')
    info "Keywords: $KEYWORDS"
  fi
fi

# 6. Check content
CONTENT=$(tail -n +"$((CONTENT_START + 1))" "$SKILL_FILE")

if [[ -z "$CONTENT" ]]; then
  error "No content after frontmatter"
else
  success "Content present"

  # Check content length
  CONTENT_LENGTH=$(echo "$CONTENT" | wc -l | xargs)
  if [[ $CONTENT_LENGTH -lt 10 ]]; then
    warning "Content is very short ($CONTENT_LENGTH lines)"
  elif [[ $CONTENT_LENGTH -gt 500 ]]; then
    warning "Content is long ($CONTENT_LENGTH lines). Consider progressive disclosure (reference REFERENCE.md or EXAMPLES.md)"
  else
    info "Content length: $CONTENT_LENGTH lines"
  fi

  # Check for section headers
  if ! echo "$CONTENT" | grep -q '^##'; then
    warning "No section headers found. Consider organizing with ## headings"
  fi

  # Check for examples
  if echo "$CONTENT" | grep -qi '##.*example\|### Example'; then
    success "Examples section found"
  else
    info "Consider adding examples section for clarity"
  fi

  # Check for code blocks
  if echo "$CONTENT" | grep -q '^```'; then
    CODE_BLOCKS=$(echo "$CONTENT" | grep -c '^```')
    if [[ $((CODE_BLOCKS % 2)) -ne 0 ]]; then
      warning "Odd number of code block markers. Possible unclosed code block."
    fi
  fi

  # Check for references to supporting files
  if [[ "$CHECK_REFERENCES" == "true" ]]; then
    # Extract markdown links
    REFERENCED_FILES=$(echo "$CONTENT" | grep -oE '\[([^]]+)\]\(([^)]+\.md)\)' | sed -E 's/.*\(([^)]+)\).*/\1/' | sort -u)

    if [[ -n "$REFERENCED_FILES" ]]; then
      while IFS= read -r ref_file; do
        # Handle relative paths
        ref_path="$SKILL_DIR/$ref_file"
        if [[ -f "$ref_path" ]]; then
          success "Referenced file exists: $ref_file"
        else
          warning "Referenced file not found: $ref_file"
        fi
      done <<< "$REFERENCED_FILES"
    fi

    # Check for script references
    SCRIPT_REFS=$(echo "$CONTENT" | grep -oE '\./scripts/[a-zA-Z0-9_-]+\.(sh|py|js)' | sort -u)
    if [[ -n "$SCRIPT_REFS" ]]; then
      while IFS= read -r script_ref; do
        script_path="$SKILL_DIR/$script_ref"
        if [[ -f "$script_path" ]]; then
          if [[ -x "$script_path" ]]; then
            success "Script exists and is executable: $script_ref"
          else
            warning "Script exists but is not executable: $script_ref (run: chmod +x $script_path)"
          fi
        else
          warning "Referenced script not found: $script_ref"
        fi
      done <<< "$SCRIPT_REFS"
    fi
  fi
fi

# 7. Check supporting files
if [[ -f "$SKILL_DIR/REFERENCE.md" ]]; then
  success "REFERENCE.md exists (progressive disclosure)"
  if [[ ! -s "$SKILL_DIR/REFERENCE.md" ]]; then
    warning "REFERENCE.md is empty"
  fi
fi

if [[ -f "$SKILL_DIR/EXAMPLES.md" ]]; then
  success "EXAMPLES.md exists (progressive disclosure)"
  if [[ ! -s "$SKILL_DIR/EXAMPLES.md" ]]; then
    warning "EXAMPLES.md is empty"
  fi
fi

if [[ -f "$SKILL_DIR/README.md" ]]; then
  info "README.md exists"
fi

# 8. Check scripts directory
if [[ -d "$SKILL_DIR/scripts" ]]; then
  success "scripts/ directory exists"

  SCRIPT_COUNT=$(find "$SKILL_DIR/scripts" -type f \( -name "*.sh" -o -name "*.py" -o -name "*.js" \) | wc -l | xargs)
  if [[ $SCRIPT_COUNT -eq 0 ]]; then
    warning "scripts/ directory exists but contains no scripts"
  else
    info "Found $SCRIPT_COUNT script(s)"

    # Check script permissions
    while IFS= read -r script; do
      if [[ ! -x "$script" ]]; then
        warning "Script not executable: $(basename "$script") (run: chmod +x $script)"
      fi
    done < <(find "$SKILL_DIR/scripts" -type f \( -name "*.sh" -o -name "*.py" -o -name "*.js" \))

    # Check for scripts README
    if [[ -f "$SKILL_DIR/scripts/README.md" ]]; then
      success "scripts/README.md exists"
    else
      info "Consider adding scripts/README.md to document scripts"
    fi
  fi
fi

# 9. Check templates directory
if [[ -d "$SKILL_DIR/templates" ]]; then
  info "templates/ directory exists"

  TEMPLATE_COUNT=$(find "$SKILL_DIR/templates" -type f | wc -l | xargs)
  if [[ $TEMPLATE_COUNT -eq 0 ]]; then
    warning "templates/ directory exists but contains no templates"
  else
    info "Found $TEMPLATE_COUNT template(s)"
  fi
fi

# 10. Check for common issues

# Very long lines
MAX_LINE_LENGTH=0
while IFS= read -r line; do
  LINE_LENGTH=${#line}
  if [[ $LINE_LENGTH -gt $MAX_LINE_LENGTH ]]; then
    MAX_LINE_LENGTH=$LINE_LENGTH
  fi
  if [[ $LINE_LENGTH -gt 200 ]]; then
    warning "Line longer than 200 characters found (consider breaking up)"
    break
  fi
done < "$SKILL_FILE"

# Check for TODO/FIXME comments
if grep -iq 'TODO\|FIXME\|XXX' "$SKILL_FILE"; then
  info "Found TODO/FIXME comments (remember to address before finalizing)"
fi

# Convert warnings to errors in strict mode
if [[ "$STRICT" == "true" && $WARNINGS -gt 0 ]]; then
  ERRORS=$((ERRORS + WARNINGS))
  WARNINGS=0
fi

# Summary
echo
if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
  echo -e "${GREEN}✓ Validation passed!${NC}"
  echo
  echo -e "${BLUE}Next steps:${NC}"
  echo "  1. Test skill discovery: claude --debug"
  echo "  2. Trigger skill with natural language matching description"
  echo "  3. Verify tool restrictions work as expected"
  if [[ "$CHECK_DESCRIPTION" == "false" ]]; then
    echo "  4. Run with --check-description for description quality check"
  fi
  if [[ "$CHECK_REFERENCES" == "false" ]]; then
    echo "  5. Run with --check-references to verify all referenced files exist"
  fi
  exit 0
elif [[ $ERRORS -eq 0 ]]; then
  echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
  echo
  echo -e "${BLUE}Suggestions:${NC}"
  echo "  • Review warnings above"
  echo "  • Run with --strict to treat warnings as errors"
  echo "  • Run with --check-description --check-references for thorough validation"
  exit 0
else
  echo -e "${RED}✗ Validation failed with $ERRORS error(s)${NC}"
  if [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}  and $WARNINGS warning(s)${NC}"
  fi
  echo
  echo -e "${BLUE}Common fixes:${NC}"
  echo "  • Ensure SKILL.md has proper frontmatter (--- at start and end)"
  echo "  • Add required fields: name, description"
  echo "  • Use kebab-case for skill names"
  echo "  • Capitalize tool names: Read, Write, Bash(*)"
  echo "  • Make scripts executable: chmod +x scripts/*.sh"
  exit 1
fi
