#!/usr/bin/env bash
# scaffold-command.sh - Generate new Claude Code slash command from template
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help text
show_help() {
  cat << EOF
Usage: $(basename "$0") <command-name> [options]

Generate a new Claude Code slash command with proper structure.

Arguments:
  command-name        Name of the command (kebab-case, no .md extension)

Options:
  -d, --description   Command description (default: prompts interactively)
  -t, --type         Template type: simple, args, bash, files (default: simple)
  -o, --output       Output directory (default: .claude/commands)
  -p, --personal     Create in personal commands (~/.claude/commands)
  -n, --namespace    Namespace directory (e.g., git, test, deploy)
  -h, --help         Show this help

Examples:
  # Simple command in project
  $(basename "$0") review

  # Command with arguments
  $(basename "$0") deploy -t args -d "Deploy to environment"

  # Personal command with namespace
  $(basename "$0") check-security -p -n security

  # Command with bash execution
  $(basename "$0") git-status -t bash -n git
EOF
}

# Parse arguments
COMMAND_NAME=""
DESCRIPTION=""
TEMPLATE_TYPE="simple"
OUTPUT_DIR=".claude/commands"
NAMESPACE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -d|--description)
      DESCRIPTION="$2"
      shift 2
      ;;
    -t|--type)
      TEMPLATE_TYPE="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -p|--personal)
      OUTPUT_DIR="$HOME/.claude/commands"
      shift
      ;;
    -n|--namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      COMMAND_NAME="$1"
      shift
      ;;
  esac
done

# Validate command name
if [[ -z "$COMMAND_NAME" ]]; then
  echo -e "${RED}Error: Command name required${NC}"
  show_help
  exit 1
fi

# Validate command name format (kebab-case)
if [[ ! "$COMMAND_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo -e "${RED}Error: Command name must be kebab-case (e.g., my-command)${NC}"
  exit 1
fi

# Prompt for description if not provided
if [[ -z "$DESCRIPTION" ]]; then
  echo -e "${BLUE}Enter command description:${NC}"
  read -r DESCRIPTION
  if [[ -z "$DESCRIPTION" ]]; then
    echo -e "${YELLOW}Warning: No description provided${NC}"
  fi
fi

# Determine output path
if [[ -n "$NAMESPACE" ]]; then
  OUTPUT_PATH="$OUTPUT_DIR/$NAMESPACE"
else
  OUTPUT_PATH="$OUTPUT_DIR"
fi

FILE_PATH="$OUTPUT_PATH/$COMMAND_NAME.md"

# Create directory if needed
mkdir -p "$OUTPUT_PATH"

# Check if file already exists
if [[ -f "$FILE_PATH" ]]; then
  echo -e "${YELLOW}Warning: File already exists: $FILE_PATH${NC}"
  echo -e "${BLUE}Overwrite? (y/N):${NC}"
  read -r CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
  fi
fi

# Generate command based on template type
case "$TEMPLATE_TYPE" in
  simple)
    cat > "$FILE_PATH" << EOF
---
description: ${DESCRIPTION:-Brief description of what this command does}
---

# ${COMMAND_NAME}

Your command instructions go here.

This is where you define what Claude should do when the user runs /${COMMAND_NAME}.
EOF
    ;;

  args)
    cat > "$FILE_PATH" << EOF
---
description: ${DESCRIPTION:-Command with arguments}
argument-hint: <arg1> [arg2]
---

# ${COMMAND_NAME}

Argument 1: \$1
Argument 2: \$2 (optional)

Your command instructions using the arguments above.

For example:
- Process \$1 with configuration from \$2
- Use default if \$2 is not provided
EOF
    ;;

  bash)
    cat > "$FILE_PATH" << EOF
---
description: ${DESCRIPTION:-Command with bash execution}
allowed-tools: Bash(*)
---

# ${COMMAND_NAME}

## Context

Current directory: !\`pwd\`
Git branch: !\`git branch --show-current 2>/dev/null || echo "Not a git repo"\`

## Task

Based on the context above, your command instructions go here.

The bash commands will execute before this prompt is processed.
EOF
    ;;

  files)
    cat > "$FILE_PATH" << EOF
---
description: ${DESCRIPTION:-Command with file references}
argument-hint: <file-path>
allowed-tools: Read
---

# ${COMMAND_NAME}

File to process: \$1

## File Contents

@\$1

## Task

Based on the file contents above, your command instructions go here.

For example:
- Analyze the file structure
- Explain the code
- Suggest improvements
EOF
    ;;

  *)
    echo -e "${RED}Error: Unknown template type: $TEMPLATE_TYPE${NC}"
    echo "Valid types: simple, args, bash, files"
    exit 1
    ;;
esac

# Success message
echo -e "${GREEN}✓ Created command: $FILE_PATH${NC}"
echo
echo -e "${BLUE}Usage:${NC} /${COMMAND_NAME}"
if [[ -n "$NAMESPACE" ]]; then
  echo -e "${BLUE}Namespaced:${NC} /${NAMESPACE}/${COMMAND_NAME}"
fi
echo
echo -e "${BLUE}Test with:${NC}"
echo "  /help | grep $COMMAND_NAME"
echo "  /$COMMAND_NAME"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Edit $FILE_PATH"
echo "  2. Update frontmatter as needed"
echo "  3. Test the command"
echo "  4. Commit to repository"
