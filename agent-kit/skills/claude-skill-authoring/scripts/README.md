# Scripts

Utility scripts for the claude-skill-authoring skill.

## scaffold-skill.sh

Generate new Claude Code Agent Skill from template with proper structure.

**Usage:**

```bash
./scripts/scaffold-skill.sh <skill-name> [options]
```

**Options:**
- `-d, --description <desc>`: Skill description (prompts if not provided)
- `-t, --type <type>`: Template type (simple, read-only, workflow, scripts)
- `-o, --output <dir>`: Output directory (default: .claude/skills)
- `-p, --personal`: Create in personal skills (~/.claude/skills)
- `--allowed-tools <tools>`: Comma-separated tool list
- `--with-reference`: Include REFERENCE.md stub
- `--with-examples`: Include EXAMPLES.md stub
- `--with-scripts`: Include scripts/ directory
- `--with-templates`: Include templates/ directory
- `-h, --help`: Show help

**Examples:**

```bash
# Simple skill
./scripts/scaffold-skill.sh my-analyzer

# Read-only skill with documentation
./scripts/scaffold-skill.sh code-reviewer -t read-only --with-reference --with-examples

# Personal workflow skill
./scripts/scaffold-skill.sh my-workflow -p -t workflow

# Skill with scripts
./scripts/scaffold-skill.sh data-processor -t scripts --with-scripts
```

**Template Types:**
- **simple**: Basic skill with minimal structure
- `read-only`: Analysis skill with Read, Grep, Glob tools
- `workflow`: Multi-step workflow skill
- `scripts`: Skill with utility scripts directory

## validate-skill.sh

Validate Claude Code Agent Skill structure, frontmatter, and best practices.

**Usage:**

```bash
./scripts/validate-skill.sh <skill-directory> [options]
```

**Options:**
- `-s, --strict`: Strict mode (warnings become errors)
- `-q, --quiet`: Only show errors and warnings
- `--check-description`: Check description quality (length, keywords)
- `--check-references`: Verify referenced files exist
- `-h, --help`: Show help

**Examples:**

```bash
# Basic validation
./scripts/validate-skill.sh .claude/skills/my-skill

# Thorough validation with all checks
./scripts/validate-skill.sh my-skill --check-description --check-references

# Strict validation (warnings = errors)
./scripts/validate-skill.sh my-skill --strict

# Validate all project skills
find .claude/skills -type d -maxdepth 1 -exec ./scripts/validate-skill.sh {} \;
```

**What It Checks:**
- SKILL.md exists and has content
- Valid YAML frontmatter syntax
- Required fields: name, description
- Optional fields: version, allowed-tools, author
- Description quality (with --check-description)
- Referenced files exist (with --check-references)
- Script executability
- Directory naming conventions
- Content organization

## Development

### Adding New Scripts

When adding new scripts to this directory:

1. **Make executable**: `chmod +x scripts/new-script.sh`
2. **Add shebang**: `#!/usr/bin/env bash` (or python, node)
3. **Add help flag**: Support `--help` flag
4. **Document here**: Add section to this README
5. **Reference from SKILL.md**: Link to script from main documentation

### Script Template

```bash
#!/usr/bin/env bash
# script-name.sh - Brief description
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") [options]

Description of what this script does.

Options:
  -h, --help    Show this help

Examples:
  $(basename "$0")
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Main script logic here
echo "Script executed successfully"
```

## Testing

Test scripts before committing:

```bash
# Test help output
./scripts/scaffold-skill.sh --help
./scripts/validate-skill.sh --help

# Test with example inputs
./scripts/scaffold-skill.sh test-skill -d "Test skill description"
./scripts/validate-skill.sh .claude/skills/test-skill

# Clean up test artifacts
rm -rf .claude/skills/test-skill
```
