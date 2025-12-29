#!/usr/bin/env bash
# scaffold-skill.sh - Generate new Claude Code Agent Skill from template
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
Usage: $(basename "$0") <skill-name> [options]

Generate a new Claude Code Agent Skill with proper structure.

Arguments:
  skill-name          Name of the skill (kebab-case, no spaces)

Options:
  -d, --description   Skill description (default: prompts interactively)
  -t, --type         Template type: simple, read-only, workflow, scripts (default: simple)
  -o, --output       Output directory (default: .claude/skills)
  -p, --personal     Create in personal skills (~/.claude/skills)
  --allowed-tools    Comma-separated tool list (e.g., "Read, Grep, Glob")
  --with-reference   Include REFERENCE.md stub
  --with-examples    Include EXAMPLES.md stub
  --with-scripts     Include scripts/ directory
  --with-templates   Include templates/ directory
  -h, --help         Show this help

Examples:
  # Simple skill in project
  $(basename "$0") my-analyzer

  # Read-only analysis skill
  $(basename "$0") code-reviewer -t read-only

  # Personal skill with supporting files
  $(basename "$0") pdf-processor -p --with-reference --with-examples

  # Complex workflow skill with scripts
  $(basename "$0") deployment-workflow -t workflow --with-scripts

  # Skill with specific tools
  $(basename "$0") git-helper --allowed-tools "Bash(git *), Read, Write"
EOF
}

# Parse arguments
SKILL_NAME=""
DESCRIPTION=""
TEMPLATE_TYPE="simple"
OUTPUT_DIR=".claude/skills"
ALLOWED_TOOLS=""
WITH_REFERENCE=false
WITH_EXAMPLES=false
WITH_SCRIPTS=false
WITH_TEMPLATES=false

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
      OUTPUT_DIR="$HOME/.claude/skills"
      shift
      ;;
    --allowed-tools)
      ALLOWED_TOOLS="$2"
      shift 2
      ;;
    --with-reference)
      WITH_REFERENCE=true
      shift
      ;;
    --with-examples)
      WITH_EXAMPLES=true
      shift
      ;;
    --with-scripts)
      WITH_SCRIPTS=true
      shift
      ;;
    --with-templates)
      WITH_TEMPLATES=true
      shift
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      SKILL_NAME="$1"
      shift
      ;;
  esac
done

# Validate skill name
if [[ -z "$SKILL_NAME" ]]; then
  echo -e "${RED}Error: Skill name required${NC}"
  show_help
  exit 1
fi

# Validate skill name format (kebab-case)
if [[ ! "$SKILL_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo -e "${RED}Error: Skill name must be kebab-case (e.g., my-skill)${NC}"
  exit 1
fi

# Prompt for description if not provided
if [[ -z "$DESCRIPTION" ]]; then
  echo -e "${BLUE}Enter skill description:${NC}"
  echo -e "${YELLOW}(Include: what it does, when to use it, trigger keywords)${NC}"
  read -r DESCRIPTION
  if [[ -z "$DESCRIPTION" ]]; then
    echo -e "${YELLOW}Warning: No description provided${NC}"
    DESCRIPTION="Brief description of what this skill does"
  fi
fi

# Determine output path
SKILL_PATH="$OUTPUT_DIR/$SKILL_NAME"

# Check if directory already exists
if [[ -d "$SKILL_PATH" ]]; then
  echo -e "${YELLOW}Warning: Directory already exists: $SKILL_PATH${NC}"
  echo -e "${BLUE}Overwrite? (y/N):${NC}"
  read -r CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
  fi
  rm -rf "$SKILL_PATH"
fi

# Create directory structure
mkdir -p "$SKILL_PATH"
if [[ "$WITH_SCRIPTS" == "true" ]]; then
  mkdir -p "$SKILL_PATH/scripts"
fi
if [[ "$WITH_TEMPLATES" == "true" ]]; then
  mkdir -p "$SKILL_PATH/templates"
fi

# Generate SKILL.md based on template type
case "$TEMPLATE_TYPE" in
  simple)
    cat > "$SKILL_PATH/SKILL.md" << EOF
---
name: ${SKILL_NAME}
description: ${DESCRIPTION}
version: 1.0.0
---

# ${SKILL_NAME}

Brief introduction to what this skill does.

## Quick Start

Basic usage instructions here.

## Instructions

Step-by-step guidance for Claude on how to use this skill:

1. First step
2. Second step
3. Third step

## Examples

### Example 1: Basic Usage

Provide a concrete example of using this skill.

### Example 2: Advanced Usage

Show a more complex use case.

## Best Practices

- Best practice 1
- Best practice 2
- Best practice 3
EOF
    ;;

  read-only)
    ALLOWED_TOOLS=${ALLOWED_TOOLS:-"Read, Grep, Glob"}
    cat > "$SKILL_PATH/SKILL.md" << EOF
---
name: ${SKILL_NAME}
description: ${DESCRIPTION}
allowed-tools: ${ALLOWED_TOOLS}
version: 1.0.0
---

# ${SKILL_NAME}

Read-only analysis skill that examines code/files without making modifications.

## Analysis Criteria

1. **First Criterion**: What to look for
2. **Second Criterion**: Another aspect to analyze
3. **Third Criterion**: Additional analysis point

## Analysis Process

1. Scan files using Grep/Glob
2. Read relevant files
3. Analyze content
4. Generate report

## Report Format

\`\`\`markdown
## Analysis Report

### Summary
High-level findings

### Detailed Findings
1. Finding 1 - Description and location
2. Finding 2 - Description and location

### Recommendations
Suggested improvements or actions
\`\`\`

## Examples

### Example Analysis

Show an example of analysis output.
EOF
    ;;

  workflow)
    ALLOWED_TOOLS=${ALLOWED_TOOLS:-"Read, Edit, Write, Bash(git *), Bash(bun *)"}
    cat > "$SKILL_PATH/SKILL.md" << EOF
---
name: ${SKILL_NAME}
description: ${DESCRIPTION}
allowed-tools: ${ALLOWED_TOOLS}
version: 1.0.0
---

# ${SKILL_NAME}

Multi-step workflow skill for complex operations.

## Workflow Steps

### Step 1: Preparation
- Verify prerequisites
- Gather required information
- Set up environment

### Step 2: Implementation
- Execute main operations
- Handle errors gracefully
- Validate intermediate results

### Step 3: Validation
- Run tests
- Verify output
- Check for issues

### Step 4: Completion
- Clean up temporary files
- Generate report
- Update documentation

## Prerequisites

- Requirement 1
- Requirement 2
- Requirement 3

## Error Handling

- How to handle common errors
- Recovery procedures
- Rollback strategy

## Examples

### Example Workflow

Show complete workflow execution.
EOF
    ;;

  scripts)
    WITH_SCRIPTS=true
    ALLOWED_TOOLS=${ALLOWED_TOOLS:-"Read, Write, Bash(*)"}
    cat > "$SKILL_PATH/SKILL.md" << EOF
---
name: ${SKILL_NAME}
description: ${DESCRIPTION}
allowed-tools: ${ALLOWED_TOOLS}
version: 1.0.0
---

# ${SKILL_NAME}

Skill with supporting utility scripts.

## Overview

This skill uses helper scripts in the \`scripts/\` directory.

## Usage

### Main Script
\`\`\`bash
./scripts/main.sh input-file.txt
\`\`\`

### Helper Scripts
\`\`\`bash
# Process data
./scripts/process.sh data.json

# Validate output
./scripts/validate.sh output.json
\`\`\`

## Scripts

- **main.sh**: Primary script for main operation
- **process.sh**: Data processing utility
- **validate.sh**: Output validation

See [scripts/README.md](scripts/README.md) for detailed documentation.

## Examples

### Example 1: Basic Processing

Show how to use scripts together.

### Example 2: Advanced Usage

Complex workflow with multiple scripts.
EOF

    # Create script stubs
    mkdir -p "$SKILL_PATH/scripts"

    cat > "$SKILL_PATH/scripts/main.sh" << 'EOFSCRIPT'
#!/usr/bin/env bash
# main.sh - Main script for skill operation
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") <input-file> [options]

Description of what this script does.

Options:
  -h, --help    Show this help
  -v, --verbose Verbose output

Examples:
  $(basename "$0") input.txt
EOF
}

# Parse arguments
INPUT_FILE=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    *)
      INPUT_FILE="$1"
      shift
      ;;
  esac
done

if [[ -z "$INPUT_FILE" ]]; then
  echo "Error: Input file required"
  show_help
  exit 1
fi

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "Error: File not found: $INPUT_FILE"
  exit 1
fi

# Main script logic here
echo "Processing: $INPUT_FILE"

# TODO: Implement script logic

echo "Done"
EOFSCRIPT

    chmod +x "$SKILL_PATH/scripts/main.sh"

    cat > "$SKILL_PATH/scripts/README.md" << 'EOFREADME'
# Scripts

Utility scripts for this skill.

## main.sh

Primary script for skill operation.

**Usage:**
```bash
./scripts/main.sh input-file.txt
```

**Options:**
- `-h, --help`: Show help
- `-v, --verbose`: Verbose output

## Adding New Scripts

When adding new scripts:
1. Make executable: `chmod +x scripts/new-script.sh`
2. Add help flag: `--help`
3. Document in this README
4. Reference from SKILL.md
EOFREADME
    ;;

  *)
    echo -e "${RED}Error: Unknown template type: $TEMPLATE_TYPE${NC}"
    echo "Valid types: simple, read-only, workflow, scripts"
    exit 1
    ;;
esac

# Add allowed-tools if specified and not already in template
if [[ -n "$ALLOWED_TOOLS" ]] && [[ "$TEMPLATE_TYPE" == "simple" ]]; then
  # Insert allowed-tools into frontmatter
  sed -i.bak "s/^version:/allowed-tools: ${ALLOWED_TOOLS}\nversion:/" "$SKILL_PATH/SKILL.md"
  rm "$SKILL_PATH/SKILL.md.bak" 2>/dev/null || true
fi

# Create REFERENCE.md if requested
if [[ "$WITH_REFERENCE" == "true" ]]; then
  cat > "$SKILL_PATH/REFERENCE.md" << EOF
# ${SKILL_NAME} Reference

Comprehensive reference documentation for ${SKILL_NAME}.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [API Reference](#api-reference)
4. [Advanced Usage](#advanced-usage)
5. [Troubleshooting](#troubleshooting)

## Overview

Detailed explanation of the skill's capabilities and architecture.

## Configuration

Configuration options and customization.

## API Reference

Complete reference of all functions, parameters, and return values.

## Advanced Usage

Advanced patterns and techniques.

## Troubleshooting

Common issues and solutions.
EOF
fi

# Create EXAMPLES.md if requested
if [[ "$WITH_EXAMPLES" == "true" ]]; then
  cat > "$SKILL_PATH/EXAMPLES.md" << EOF
# ${SKILL_NAME} Examples

Real-world examples of using ${SKILL_NAME}.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Intermediate Examples](#intermediate-examples)
3. [Advanced Examples](#advanced-examples)
4. [Real-World Case Studies](#real-world-case-studies)

## Basic Examples

### Example 1: Simple Usage

Step-by-step basic example.

### Example 2: Common Pattern

Frequently used pattern.

## Intermediate Examples

### Example 3: Combined Operations

More complex example combining multiple features.

### Example 4: Error Handling

Example showing proper error handling.

## Advanced Examples

### Example 5: Complex Workflow

Multi-step advanced workflow.

### Example 6: Integration

Integration with other tools/skills.

## Real-World Case Studies

### Case Study 1: Project Context

Real project implementation example.

### Case Study 2: Production Usage

How this skill is used in production.
EOF
fi

# Create templates directory stubs if requested
if [[ "$WITH_TEMPLATES" == "true" ]]; then
  cat > "$SKILL_PATH/templates/README.md" << EOF
# Templates

Template files for ${SKILL_NAME}.

## Usage

Copy templates and customize as needed:

\`\`\`bash
cp templates/config.yaml my-config.yaml
# Edit my-config.yaml
\`\`\`

## Available Templates

- **config.yaml**: Configuration template
- Add more templates as needed
EOF

  cat > "$SKILL_PATH/templates/config.yaml" << EOF
# Configuration template for ${SKILL_NAME}

# General settings
setting1: value1
setting2: value2

# Advanced options
advanced:
  option1: value1
  option2: value2
EOF
fi

# Success message
echo
echo -e "${GREEN}✓ Created skill: $SKILL_PATH${NC}"
echo
echo -e "${BLUE}Structure:${NC}"
tree -L 2 "$SKILL_PATH" 2>/dev/null || find "$SKILL_PATH" -maxdepth 2 -print | sed 's|^|  |'
echo
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Edit $SKILL_PATH/SKILL.md"
echo "  2. Customize frontmatter (especially description)"
echo "  3. Add detailed instructions and examples"
if [[ "$WITH_SCRIPTS" == "true" ]]; then
  echo "  4. Implement scripts in scripts/ directory"
fi
if [[ "$WITH_REFERENCE" == "true" ]]; then
  echo "  5. Complete REFERENCE.md documentation"
fi
if [[ "$WITH_EXAMPLES" == "true" ]]; then
  echo "  6. Add real-world examples to EXAMPLES.md"
fi
echo "  7. Test skill discovery: claude --debug"
echo "  8. Validate skill: ./scripts/validate-skill.sh $SKILL_PATH"
echo "  9. Commit to repository (if project skill)"
echo
echo -e "${BLUE}Testing:${NC}"
echo "  # Enable debug mode to see skill loading"
echo "  claude --debug"
echo
echo "  # Trigger skill with natural language"
echo '  "Can you help with [task that matches your description]?"'
