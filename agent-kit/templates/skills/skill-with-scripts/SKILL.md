---
name: [YOUR_SKILL_NAME]
description: [YOUR_DESCRIPTION] - Be specific about what the skill does, when to use it, and include trigger keywords. Example: "Deploy applications to production with automated testing, health checks, and rollback capabilities. Use when deploying, shipping to production, or when users mention deployment, release, or going live."
allowed-tools: Read, Bash
version: 1.0.0
---

# [YOUR_SKILL_NAME]

[Brief overview of the skill and its purpose]

## Overview

This skill provides automated [CAPABILITY] using helper scripts:
- **Feature 1**: [Description]
- **Feature 2**: [Description]
- **Feature 3**: [Description]

## Quick Start

### Using the Helper Script

The main script is located at `scripts/[script-name].sh`:

```bash
# Basic usage
./scripts/[script-name].sh [args]

# Example
./scripts/deploy.sh staging
```

## Core Workflows

### Workflow 1: [Name]

**When to use**: [Description of scenario]

**Steps**:
1. Run the helper script:

   ```bash
   bun run ./scripts/[script-name].sh [args]
   ```

2. The script will:
   - [Action 1]
   - [Action 2]
   - [Action 3]

3. Verify the result:

   ```bash
   [VERIFICATION_COMMAND]
   ```

**Example**:

```bash
# Full example workflow
[COMPLETE_EXAMPLE]
```

### Workflow 2: [Name]

**When to use**: [Description]

**Steps**:
[Instructions for second workflow using scripts]

## Helper Scripts

### scripts/[script-name].sh

**Purpose**: [Description of what the script does]

**Usage**:

```bash
./scripts/[script-name].sh <arg1> [optional-arg2]
```

**Arguments**:
- `arg1`: [Description]
- `arg2` (optional): [Description]

**Example**:

```bash
./scripts/[script-name].sh example-arg
```

**Output**:

```
[EXPECTED_OUTPUT]
```

### scripts/[another-script].sh

**Purpose**: [Description]

**Usage**:

```bash
./scripts/[another-script].sh [options]
```

**Options**:
- `--option1`: [Description]
- `--option2`: [Description]

## Instructions for Claude

When this skill is activated:

1. **Understand the request**
   - Identify which workflow matches the user's needs
   - Confirm the parameters with the user if unclear

2. **Use the appropriate script**
   - Choose the correct helper script for the task
   - Pass the validated arguments
   - Use Bash tool to execute

3. **Handle the output**
   - Parse the script output
   - Report results to the user
   - If errors occur, check script exit code and stderr

4. **Follow-up actions**
   - Verify the operation succeeded
   - Provide next steps to the user
   - Update relevant documentation if needed

## Best Practices

1. **Always validate inputs before running scripts**
   - Check required arguments are provided
   - Verify paths and parameters are valid
   - Confirm destructive operations with the user

2. **Monitor script execution**
   - Watch for error messages
   - Check exit codes (0 = success, non-zero = error)
   - Parse output for warnings

3. **Handle errors gracefully**
   - Explain what went wrong
   - Suggest fixes based on error messages
   - Offer to retry with corrections

## Script Details

### Error Handling

All scripts follow these conventions:
- **Exit code 0**: Success
- **Exit code 1**: General error
- **Exit code 2**: Invalid arguments
- **Exit code 3**: [Custom error type]

### Environment Variables

Scripts may use these environment variables:
- `VAR_1`: [Description]
- `VAR_2`: [Description]
- `VAR_3`: [Description]

Set them in `.env` or pass inline:

```bash
VAR_1=value ./scripts/[script-name].sh
```

## Examples

### Example 1: [Common Use Case]

**Scenario**: [Description]

**Commands**:

```bash
# Step 1: [Description]
./scripts/[script-name].sh arg1

# Step 2: [Description]
./scripts/[another-script].sh --option

# Step 3: Verify
[VERIFICATION_COMMAND]
```

**Expected Output**:

```
[OUTPUT_EXAMPLE]
```

### Example 2: [Another Use Case]

**Scenario**: [Description]

**Commands**:

```bash
[COMMAND_SEQUENCE]
```

## Troubleshooting

### Script not executable

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Script not found

```bash
# Verify script location
ls -la scripts/

# Run from project root
cd /path/to/project
./scripts/[script-name].sh
```

### Permission denied

```bash
# Check file permissions
ls -la scripts/[script-name].sh

# Fix permissions
chmod +x scripts/[script-name].sh
```

### Environment variables not set

```bash
# Check if .env exists
ls -la .env

# Load environment
source .env

# Or use direnv
direnv allow
```

## Requirements

**System Requirements**:
- [Requirement 1]
- [Requirement 2]

**Dependencies**:

```bash
# Install dependencies
[INSTALLATION_COMMANDS]
```

**File Structure**:

```
skill-directory/
├── SKILL.md
└── scripts/
    ├── [script-name].sh
    └── [another-script].sh
```

## Security Considerations

- ⚠️  Scripts run with your user permissions
- ⚠️  Always review scripts before running
- ⚠️  Validate all inputs to prevent injection
- ⚠️  Use quotes around variables: `"$VAR"`
- ⚠️  Never commit secrets to scripts

## Related Skills

- **[related-skill-1]**: [Description]
- **[related-skill-2]**: [Description]
