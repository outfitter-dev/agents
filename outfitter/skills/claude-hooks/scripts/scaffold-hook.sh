#!/usr/bin/env bash
# scaffold-hook.sh - Generate hook configuration and script from templates
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
Usage: $(basename "$0") <hook-name> [options]

Generate a new Claude Code hook with configuration and script.

Arguments:
  hook-name           Name of the hook (kebab-case)

Options:
  -e, --event         Event type (required): PreToolUse, PostToolUse,
                      UserPromptSubmit, Notification, Stop, SubagentStop,
                      PreCompact, SessionStart, SessionEnd
  -m, --matcher       Matcher pattern (default: *)
  -t, --type          Template type: validation, formatting, logging,
                      notification, context (default: validation)
  -l, --language      Script language: bash, typescript, python (default: bash)
  -o, --output        Output directory for script (default: .claude/hooks)
  -c, --config        Config file to update (default: .claude/settings.json)
  -p, --personal      Use personal config (~/.claude/settings.json)
  --timeout           Hook timeout in seconds (default: 30)
  -i, --interactive   Interactive mode (prompts for all values)
  -h, --help          Show this help

Examples:
  # Simple validation hook
  $(basename "$0") validate-bash -e PreToolUse -m Bash

  # Python formatter with PostToolUse
  $(basename "$0") format-python -e PostToolUse -m "Write(*.py)" -t formatting

  # Interactive mode
  $(basename "$0") my-hook -i

  # Personal hook with custom output
  $(basename "$0") log-ops -e PreToolUse -m "*" -p

Event Types:
  PreToolUse        - Before tool execution (can block)
  PostToolUse       - After tool completes successfully
  UserPromptSubmit  - When user submits prompt
  Notification      - When notification sent
  Stop              - When main agent finishes
  SubagentStop      - When subagent finishes
  PreCompact        - Before conversation compacts
  SessionStart      - When session starts/resumes
  SessionEnd        - When session ends

Matcher Examples:
  "*"                      - Match all tools
  "Write"                  - Match Write tool only
  "Write|Edit"             - Match Write or Edit
  "Write(*.py)"            - Match Python file writes
  "mcp__memory__.*"        - Match memory MCP tools
EOF
}

# Parse arguments
HOOK_NAME=""
EVENT_TYPE=""
MATCHER="*"
TEMPLATE_TYPE="validation"
LANGUAGE="bash"
OUTPUT_DIR=".claude/hooks"
CONFIG_FILE=".claude/settings.json"
TIMEOUT=30
INTERACTIVE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -e|--event)
      EVENT_TYPE="$2"
      shift 2
      ;;
    -m|--matcher)
      MATCHER="$2"
      shift 2
      ;;
    -t|--type)
      TEMPLATE_TYPE="$2"
      shift 2
      ;;
    -l|--language)
      LANGUAGE="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -c|--config)
      CONFIG_FILE="$2"
      shift 2
      ;;
    -p|--personal)
      CONFIG_FILE="$HOME/.claude/settings.json"
      OUTPUT_DIR="$HOME/.claude/hooks"
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -i|--interactive)
      INTERACTIVE=true
      shift
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      HOOK_NAME="$1"
      shift
      ;;
  esac
done

# Validate hook name
if [[ -z "$HOOK_NAME" ]]; then
  echo -e "${RED}Error: Hook name required${NC}"
  show_help
  exit 1
fi

# Validate hook name format (kebab-case)
if [[ ! "$HOOK_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo -e "${RED}Error: Hook name must be kebab-case (e.g., my-hook)${NC}"
  exit 1
fi

# Interactive mode
if [[ "$INTERACTIVE" == "true" ]]; then
  echo -e "${BLUE}=== Interactive Hook Setup ===${NC}"
  echo

  # Event type
  echo -e "${BLUE}Select event type:${NC}"
  echo "1) PreToolUse       - Before tool execution (can block)"
  echo "2) PostToolUse      - After tool completes"
  echo "3) UserPromptSubmit - When user submits prompt"
  echo "4) Notification     - When notification sent"
  echo "5) Stop             - When agent finishes"
  echo "6) SubagentStop     - When subagent finishes"
  echo "7) PreCompact       - Before compact"
  echo "8) SessionStart     - Session starts"
  echo "9) SessionEnd       - Session ends"
  read -r -p "Enter number (1-9): " EVENT_NUM

  case $EVENT_NUM in
    1) EVENT_TYPE="PreToolUse" ;;
    2) EVENT_TYPE="PostToolUse" ;;
    3) EVENT_TYPE="UserPromptSubmit" ;;
    4) EVENT_TYPE="Notification" ;;
    5) EVENT_TYPE="Stop" ;;
    6) EVENT_TYPE="SubagentStop" ;;
    7) EVENT_TYPE="PreCompact" ;;
    8) EVENT_TYPE="SessionStart" ;;
    9) EVENT_TYPE="SessionEnd" ;;
    *) echo -e "${RED}Invalid selection${NC}"; exit 1 ;;
  esac

  # Matcher
  echo
  echo -e "${BLUE}Enter matcher pattern (e.g., 'Write', '*.py', '*'):${NC}"
  read -r MATCHER

  # Template type
  echo
  echo -e "${BLUE}Select template type:${NC}"
  echo "1) validation    - Validate input and block if needed"
  echo "2) formatting    - Format files after modification"
  echo "3) logging       - Log operations"
  echo "4) notification  - Send notifications"
  echo "5) context       - Add context to prompts"
  read -r -p "Enter number (1-5): " TEMPLATE_NUM

  case $TEMPLATE_NUM in
    1) TEMPLATE_TYPE="validation" ;;
    2) TEMPLATE_TYPE="formatting" ;;
    3) TEMPLATE_TYPE="logging" ;;
    4) TEMPLATE_TYPE="notification" ;;
    5) TEMPLATE_TYPE="context" ;;
    *) echo -e "${RED}Invalid selection${NC}"; exit 1 ;;
  esac

  # Language
  echo
  echo -e "${BLUE}Select script language:${NC}"
  echo "1) bash"
  echo "2) typescript"
  echo "3) python"
  read -r -p "Enter number (1-3): " LANG_NUM

  case $LANG_NUM in
    1) LANGUAGE="bash" ;;
    2) LANGUAGE="typescript" ;;
    3) LANGUAGE="python" ;;
    *) echo -e "${RED}Invalid selection${NC}"; exit 1 ;;
  esac

  # Timeout
  echo
  read -r -p "Timeout in seconds (default: 30): " INPUT_TIMEOUT
  if [[ -n "$INPUT_TIMEOUT" ]]; then
    if [[ "$INPUT_TIMEOUT" =~ ^[0-9]+$ ]] && [[ "$INPUT_TIMEOUT" -gt 0 ]] && [[ "$INPUT_TIMEOUT" -le 300 ]]; then
      TIMEOUT="$INPUT_TIMEOUT"
    else
      echo -e "${YELLOW}Warning: Invalid timeout value, using default (30s)${NC}"
    fi
  fi
fi

# Validate event type
VALID_EVENTS=(PreToolUse PostToolUse UserPromptSubmit Notification Stop SubagentStop PreCompact SessionStart SessionEnd)
if [[ -z "$EVENT_TYPE" ]]; then
  echo -e "${RED}Error: Event type required (-e/--event)${NC}"
  echo "Valid events: ${VALID_EVENTS[*]}"
  exit 1
fi

valid_event=false
for evt in "${VALID_EVENTS[@]}"; do
  if [[ "$evt" == "$EVENT_TYPE" ]]; then
    valid_event=true
    break
  fi
done
if [[ "$valid_event" == "false" ]]; then
  echo -e "${RED}Error: Invalid event type: $EVENT_TYPE${NC}"
  echo "Valid events: ${VALID_EVENTS[*]}"
  exit 1
fi

# Validate language
VALID_LANGUAGES=(bash typescript python)
valid_lang=false
for lang in "${VALID_LANGUAGES[@]}"; do
  if [[ "$lang" == "$LANGUAGE" ]]; then
    valid_lang=true
    break
  fi
done
if [[ "$valid_lang" == "false" ]]; then
  echo -e "${RED}Error: Invalid language: $LANGUAGE${NC}"
  echo "Valid languages: ${VALID_LANGUAGES[*]}"
  exit 1
fi

# Determine script extension
case "$LANGUAGE" in
  bash) SCRIPT_EXT="sh" ;;
  typescript) SCRIPT_EXT="ts" ;;
  python) SCRIPT_EXT="py" ;;
esac

# Create output directory
mkdir -p "$OUTPUT_DIR"

SCRIPT_PATH="$OUTPUT_DIR/$HOOK_NAME.$SCRIPT_EXT"

# Check if script already exists
if [[ -f "$SCRIPT_PATH" ]]; then
  echo -e "${YELLOW}Warning: Script already exists: $SCRIPT_PATH${NC}"
  read -r -p "Overwrite? (y/N): " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
  fi
fi

# Generate script based on template and language
case "$LANGUAGE" in
  bash)
    cat > "$SCRIPT_PATH" << 'BASH_EOF'
#!/usr/bin/env bash
# HOOK_NAME - DESCRIPTION
set -euo pipefail

# Read input from stdin
INPUT=$(cat)

# Parse JSON input
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# TEMPLATE_LOGIC

exit 0
BASH_EOF
    ;;

  typescript)
    cat > "$SCRIPT_PATH" << 'TS_EOF'
#!/usr/bin/env bun
// HOOK_NAME - DESCRIPTION
import { stdin } from "process";

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  tool_name?: string;
  tool_input?: Record<string, any>;
  reason?: string;
}

// Read stdin
const chunks: Buffer[] = [];
for await (const chunk of stdin) {
  chunks.push(chunk);
}

const input: HookInput = JSON.parse(Buffer.concat(chunks).toString());

// Parse input
const hookEvent = input.hook_event_name;
const toolName = input.tool_name || "";
const filePath = input.tool_input?.file_path || "";

// TEMPLATE_LOGIC

process.exit(0);
TS_EOF
    ;;

  python)
    cat > "$SCRIPT_PATH" << 'PY_EOF'
#!/usr/bin/env python3
"""HOOK_NAME - DESCRIPTION"""
import json
import sys
from typing import Any, Dict

def main() -> None:
    """Main hook logic"""
    # Read input from stdin
    try:
        input_data: Dict[str, Any] = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)

    # Parse input
    hook_event = input_data.get("hook_event_name", "")
    tool_name = input_data.get("tool_name", "")
    file_path = input_data.get("tool_input", {}).get("file_path", "")

    # TEMPLATE_LOGIC

    sys.exit(0)

if __name__ == "__main__":
    main()
PY_EOF
    ;;
esac

# Replace placeholders with actual values
# Use perl instead of sed for better multiline support
perl -i -pe "s/HOOK_NAME/$HOOK_NAME/g" "$SCRIPT_PATH"
perl -i -pe "s/DESCRIPTION/Generated hook for $EVENT_TYPE event/g" "$SCRIPT_PATH"

# Insert template-specific logic by replacing the placeholder line
# Generate language-appropriate code based on the language choice
insert_template_logic() {
  local template=$1
  local lang=$2
  local replacement=""

  case "$lang" in
    bash)
      case "$template" in
        validation)
          replacement='# Validation logic\nif [[ -z "$TOOL_NAME" ]]; then\n  exit 0\nfi\n\n# Add your validation rules here\n# Example: Block dangerous operations\necho "✓ Validation passed"'
          ;;
        formatting)
          replacement='# Formatting logic\nif [[ -z "$FILE_PATH" ]]; then\n  exit 0\nfi\n\n# Add your formatting commands here\necho "✓ Formatting completed"'
          ;;
        logging)
          replacement='# Logging logic\nLOG_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/hook-logs.log"\nTIMESTAMP=$(date -Iseconds)\necho "[$TIMESTAMP] Event: $HOOK_EVENT, Tool: $TOOL_NAME" >> "$LOG_FILE"'
          ;;
        notification)
          replacement='# Notification logic\n# Add your notification code here\necho "✓ Notification sent"'
          ;;
        context)
          replacement='# Context injection logic\necho "## Additional Context"\necho "Hook Event: $HOOK_EVENT"\necho "Tool: $TOOL_NAME"\necho "Timestamp: $(date -Iseconds)"'
          ;;
      esac
      ;;
    typescript)
      case "$template" in
        validation)
          replacement='// Validation logic\n\tif (!toolName) {\n\t\tprocess.exit(0);\n\t}\n\n\t// Add your validation rules here\n\t// Example: Block dangerous operations\n\tstdout.write("✓ Validation passed\\n");\n\tprocess.exit(0);'
          ;;
        formatting)
          replacement='// Formatting logic\n\tif (!filePath) {\n\t\tprocess.exit(0);\n\t}\n\n\t// Add your formatting commands here\n\tstdout.write("✓ Formatting completed\\n");\n\tprocess.exit(0);'
          ;;
        logging)
          replacement='// Logging logic\n\tconst logFile = `${process.env.CLAUDE_PROJECT_DIR || "."}/.claude/hook-logs.log`;\n\tconst timestamp = new Date().toISOString();\n\tconst logLine = `[${timestamp}] Event: ${hookEvent}, Tool: ${toolName}\\n`;\n\tfs.appendFileSync(logFile, logLine);\n\tprocess.exit(0);'
          ;;
        notification)
          replacement='// Notification logic\n\t// Add your notification code here\n\tstdout.write("✓ Notification sent\\n");\n\tprocess.exit(0);'
          ;;
        context)
          replacement='// Context injection logic\n\tstdout.write("## Additional Context\\n");\n\tstdout.write(`Hook Event: ${hookEvent}\\n`);\n\tstdout.write(`Tool: ${toolName}\\n`);\n\tstdout.write(`Timestamp: ${new Date().toISOString()}\\n`);\n\tprocess.exit(0);'
          ;;
      esac
      ;;
    python)
      case "$template" in
        validation)
          replacement='# Validation logic\n    if not tool_name:\n        sys.exit(0)\n\n    # Add your validation rules here\n    # Example: Block dangerous operations\n    print("✓ Validation passed")'
          ;;
        formatting)
          replacement='# Formatting logic\n    if not file_path:\n        sys.exit(0)\n\n    # Add your formatting commands here\n    print("✓ Formatting completed")'
          ;;
        logging)
          replacement='# Logging logic\n    import os\n    from datetime import datetime\n    log_file = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".claude", "hook-logs.log")\n    timestamp = datetime.now().isoformat()\n    with open(log_file, "a") as f:\n        f.write(f"[{timestamp}] Event: {hook_event}, Tool: {tool_name}\\n")'
          ;;
        notification)
          replacement='# Notification logic\n    # Add your notification code here\n    print("✓ Notification sent")'
          ;;
        context)
          replacement='# Context injection logic\n    from datetime import datetime\n    print("## Additional Context")\n    print(f"Hook Event: {hook_event}")\n    print(f"Tool: {tool_name}")\n    print(f"Timestamp: {datetime.now().isoformat()}")'
          ;;
      esac
      ;;
  esac

  if [[ -n "$replacement" ]]; then
    perl -i -pe "BEGIN{undef \$/;} s/# TEMPLATE_LOGIC/$replacement/smg" "$SCRIPT_PATH"
  fi
}

insert_template_logic "$TEMPLATE_TYPE" "$LANGUAGE"

# Make script executable
chmod +x "$SCRIPT_PATH"

echo -e "${GREEN}✓ Created hook script: $SCRIPT_PATH${NC}"

# Generate hook configuration
echo
echo -e "${BLUE}Hook configuration to add to $CONFIG_FILE:${NC}"
echo

# Construct relative path if in project
if [[ "$OUTPUT_DIR" == ".claude/hooks" ]] || [[ "$OUTPUT_DIR" == "$PWD/.claude/hooks" ]]; then
  COMMAND_PATH="\$CLAUDE_PROJECT_DIR/.claude/hooks/$HOOK_NAME.$SCRIPT_EXT"
elif [[ "$OUTPUT_DIR" == "$HOME/.claude/hooks" ]]; then
  COMMAND_PATH="$HOME/.claude/hooks/$HOOK_NAME.$SCRIPT_EXT"
else
  COMMAND_PATH="$SCRIPT_PATH"
fi

cat << EOF
{
  "hooks": {
    "$EVENT_TYPE": [
      {
        "matcher": "$MATCHER",
        "hooks": [
          {
            "type": "command",
            "command": "$COMMAND_PATH",
            "timeout": $TIMEOUT
          }
        ]
      }
    ]
  }
}
EOF

echo
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Edit $SCRIPT_PATH to add your hook logic"
echo "  2. Test the hook: ./scripts/test-hook.ts $SCRIPT_PATH"
echo "  3. Add configuration to $CONFIG_FILE"
echo "  4. Validate config: ./scripts/validate-hook.sh $CONFIG_FILE"
echo

# Offer to add to config
if [[ -f "$CONFIG_FILE" ]]; then
  read -r -p "Add this hook to $CONFIG_FILE now? (y/N): " ADD_CONFIG
  if [[ "$ADD_CONFIG" =~ ^[Yy]$ ]]; then
    # Check if hooks already exist in config
    if jq -e '.hooks' "$CONFIG_FILE" >/dev/null 2>&1; then
      # Hooks exist, merge
      TEMP_FILE=$(mktemp)
      jq --arg event "$EVENT_TYPE" \
         --arg matcher "$MATCHER" \
         --arg cmd "$COMMAND_PATH" \
         --argjson timeout "$TIMEOUT" \
         '.hooks[$event] += [{
           "matcher": $matcher,
           "hooks": [{
             "type": "command",
             "command": $cmd,
             "timeout": $timeout
           }]
         }]' "$CONFIG_FILE" > "$TEMP_FILE"
      mv "$TEMP_FILE" "$CONFIG_FILE"
    else
      # No hooks, create new structure
      TEMP_FILE=$(mktemp)
      jq --arg event "$EVENT_TYPE" \
         --arg matcher "$MATCHER" \
         --arg cmd "$COMMAND_PATH" \
         --argjson timeout "$TIMEOUT" \
         '. + {
           "hooks": {
             ($event): [{
               "matcher": $matcher,
               "hooks": [{
                 "type": "command",
                 "command": $cmd,
                 "timeout": $timeout
               }]
             }]
           }
         }' "$CONFIG_FILE" > "$TEMP_FILE"
      mv "$TEMP_FILE" "$CONFIG_FILE"
    fi
    echo -e "${GREEN}✓ Added hook to $CONFIG_FILE${NC}"
  fi
else
  echo -e "${YELLOW}Note: Config file $CONFIG_FILE doesn't exist yet${NC}"
  echo "You'll need to create it and add the hook configuration manually"
fi
