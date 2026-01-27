#!/usr/bin/env bash
# scaffold-agent.sh - Generate new Claude Code agent from template
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Help text
show_help() {
  cat << EOF
Usage: $(basename "$0") <agent-name> [options]

Generate a new Claude Code agent with proper structure and frontmatter.

Arguments:
  agent-name          Name of the agent (kebab-case, no .md extension)

Options:
  -d, --description   Agent description (default: prompts interactively)
  -t, --type         Template type: analyzer, implementer, reviewer, tester, migrator, deployer, researcher (default: simple)
  -o, --output       Output directory (default: agents)
  -p, --personal     Create in personal agents (~/.claude/agents)
  -m, --model        Specific model (default: inherit from parent)
  --tools            Comma-separated list of tools (default: type-appropriate baseline)
  -h, --help         Show this help

Examples:
  # Simple agent with interactive prompts
  $(basename "$0") security-reviewer

  # Analyzer agent with description
  $(basename "$0") performance-analyzer -t analyzer -d "Performance bottleneck detection"

  # Personal agent with specific tools
  $(basename "$0") code-quality -p --tools "Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet"

  # Agent with specific model
  $(basename "$0") quick-formatter -m claude-3-5-haiku-20241022

Template Types:
  analyzer     - Read-only analysis agent
  implementer  - Code creation/modification agent
  reviewer     - Code review agent
  tester       - Testing specialist agent
  migrator     - Code migration agent
  deployer     - Deployment specialist agent
  researcher   - Documentation/research agent
  simple       - Basic agent template (default)

Note: Agents use 'model: inherit' by default. Baseline tools include:
  Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
Additional tools are added based on template type.
EOF
}

# Parse arguments
AGENT_NAME=""
DESCRIPTION=""
TEMPLATE_TYPE="simple"
OUTPUT_DIR="agents"
MODEL="inherit"
TOOLS=""

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
      OUTPUT_DIR="$HOME/.claude/agents"
      shift
      ;;
    -m|--model)
      MODEL="$2"
      shift 2
      ;;
    --tools)
      TOOLS="$2"
      shift 2
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
    *)
      AGENT_NAME="$1"
      shift
      ;;
  esac
done

# Validate agent name
if [[ -z "$AGENT_NAME" ]]; then
  echo -e "${RED}Error: Agent name required${NC}"
  show_help
  exit 1
fi

# Validate agent name format (kebab-case)
if [[ ! "$AGENT_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo -e "${RED}Error: Agent name must be kebab-case (e.g., my-agent)${NC}"
  exit 1
fi

# Validate template type
VALID_TYPES="simple analyzer implementer reviewer tester migrator deployer researcher"
if [[ ! " $VALID_TYPES " =~ " $TEMPLATE_TYPE " ]]; then
  echo -e "${RED}Error: Invalid template type: $TEMPLATE_TYPE${NC}"
  echo "Valid types: $VALID_TYPES"
  exit 1
fi

# Interactive prompts
echo -e "${CYAN}=== Agent Configuration ===${NC}"
echo

# Prompt for description if not provided
if [[ -z "$DESCRIPTION" ]]; then
  echo -e "${BLUE}Enter agent description (what this agent specializes in):${NC}"
  read -r DESCRIPTION
  if [[ -z "$DESCRIPTION" ]]; then
    echo -e "${YELLOW}Warning: No description provided${NC}"
    DESCRIPTION="Brief description of what this agent does"
  fi
fi

# Prompt for example trigger
echo
echo -e "${BLUE}Enter an example user message that should trigger this agent:${NC}"
read -r EXAMPLE_TRIGGER
if [[ -z "$EXAMPLE_TRIGGER" ]]; then
  EXAMPLE_TRIGGER="Help me with ${AGENT_NAME//-/ }"
fi

# Build the description with example (single line with \n escapes)
FULL_DESCRIPTION="${DESCRIPTION}. Triggers on related requests.\\n\\n<example>\\nContext: User needs ${AGENT_NAME//-/ } assistance\\nuser: \"${EXAMPLE_TRIGGER}\"\\nassistant: \"I'll use the ${AGENT_NAME} agent to help with this.\"\\n</example>"

# Determine output path
FILE_PATH="$OUTPUT_DIR/$AGENT_NAME.md"

# Create directory if needed
mkdir -p "$OUTPUT_DIR"

# Check if file already exists
if [[ -f "$FILE_PATH" ]]; then
  echo
  echo -e "${YELLOW}Warning: File already exists: $FILE_PATH${NC}"
  echo -e "${BLUE}Overwrite? (y/N):${NC}"
  read -r CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
  fi
fi

# Set default tools based on template type
if [[ -z "$TOOLS" ]]; then
  case "$TEMPLATE_TYPE" in
    analyzer)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash"
      ;;
    implementer)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Edit, Write, Bash"
      ;;
    reviewer)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet"
      ;;
    tester)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Edit, Write, Bash"
      ;;
    migrator)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Edit, Write, Bash"
      ;;
    deployer)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Edit, Write, Bash"
      ;;
    researcher)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, WebSearch, WebFetch"
      ;;
    simple|*)
      TOOLS="Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet"
      ;;
  esac
fi

# Generate agent based on template type
case "$TEMPLATE_TYPE" in
  analyzer)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized analysis agent focused on examining and reporting without modifications.

## Expertise

[List your areas of expertise]
- Area 1
- Area 2
- Area 3

## Analysis Process

### Step 1: Initial Assessment
1. Read relevant files
2. Understand context
3. Identify scope
4. Note constraints

### Step 2: Detailed Analysis
1. Examine code/data thoroughly
2. Identify patterns
3. Note issues or concerns
4. Collect metrics

### Step 3: Synthesis
1. Organize findings
2. Prioritize issues
3. Generate recommendations
4. Provide context

## Output Format

**Analysis Report:**
\`\`\`yaml
summary: Brief overview
total_issues: X
severity_breakdown:
  critical: X
  high: X
  medium: X
  low: X
\`\`\`

**For Each Finding:**
- **Severity**: critical|high|medium|low
- **Location**: file:line
- **Description**: What was found
- **Impact**: Consequences
- **Recommendation**: How to address
EOF
    ;;

  implementer)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized implementation agent focused on building and modifying code.

## Expertise

[List your areas of expertise]
- Technology/framework 1
- Technology/framework 2
- Technology/framework 3

## Implementation Process

### Step 1: Requirements Analysis
1. Read specifications
2. Understand requirements
3. Identify constraints
4. Plan approach

### Step 2: Design
1. Design architecture
2. Define interfaces
3. Plan data structures
4. Identify dependencies

### Step 3: Implementation
1. Write clean code
2. Follow best practices
3. Add type annotations
4. Handle errors properly

### Step 4: Documentation
1. Add code comments
2. Document public APIs
3. Include examples
4. Note limitations

## Code Standards

**Naming Conventions:**
- Variables: camelCase
- Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE

**Structure:**
- Single responsibility per function
- Clear function signatures
- Proper error handling
- Comprehensive types

## Output Format

**Implementation Plan:**
\`\`\`yaml
files_to_create:
  - path: src/...
    purpose: Description
files_to_modify:
  - path: src/...
    changes: Description
\`\`\`

**Implementation:**
[Code with comments and documentation]
EOF
    ;;

  reviewer)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized code review agent focused on providing constructive feedback.

## Review Focus

[List your review focus areas]
- Area 1
- Area 2
- Area 3

## Review Process

### Step 1: Understanding
1. Read all changed files
2. Understand the purpose
3. Review commit messages
4. Check linked issues

### Step 2: Analysis
1. **Code Quality**: Structure, readability, maintainability
2. **Correctness**: Logic, edge cases, error handling
3. **Security**: Vulnerabilities, data protection
4. **Performance**: Efficiency, resource usage
5. **Testing**: Coverage, test quality

### Step 3: Feedback
1. Identify issues
2. Prioritize by severity
3. Provide specific suggestions
4. Include positive feedback

## Review Checklist

**Code Quality:**
- [ ] Clear naming
- [ ] Logical structure
- [ ] No code duplication
- [ ] Proper error handling

**Testing:**
- [ ] Tests included
- [ ] Edge cases covered
- [ ] Meaningful assertions

**Documentation:**
- [ ] Public APIs documented
- [ ] Complex logic explained
- [ ] Examples provided

## Output Format

**Review Summary:**
\`\`\`yaml
overall_assessment: approve|request_changes|comment
total_comments: X
blocking_issues: X
suggestions: X
\`\`\`

**For Each Issue:**
- **Severity**: blocking|suggestion|nitpick
- **File**: path/to/file.ts:line
- **Issue**: Description
- **Suggestion**: How to improve
- **Example**: Code example (if applicable)

**Positive Feedback:**
- Things done well
- Good practices followed
EOF
    ;;

  tester)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized testing agent focused on creating comprehensive test suites.

## Testing Expertise

[List your testing expertise]
- Test type 1
- Test type 2
- Test type 3

## Testing Process

### Step 1: Analysis
1. Read source code
2. Identify public API
3. List edge cases
4. Note error conditions
5. Review existing tests

### Step 2: Test Planning
\`\`\`markdown
## Test Plan

### Unit Tests
- Function 1
  - [ ] Happy path
  - [ ] Edge case 1
  - [ ] Edge case 2
  - [ ] Error condition

### Integration Tests
- [ ] Flow 1
- [ ] Flow 2
\`\`\`

### Step 3: Test Generation
1. Write descriptive test names
2. Follow AAA pattern (Arrange-Act-Assert)
3. Use proper mocking
4. Create fixtures
5. Assert meaningfully

### Step 4: Coverage Analysis
1. Run tests with coverage
2. Identify gaps
3. Add missing tests
4. Verify edge cases

## Testing Patterns

**AAA Pattern:**
\`\`\`typescript
it('descriptive test name', () => {
  // Arrange
  const input = setupTestData();

  // Act
  const result = functionUnderTest(input);

  // Assert
  expect(result).toBe(expected);
});
\`\`\`

**Given-When-Then:**
\`\`\`typescript
it('should do X when Y happens', () => {
  // Given
  const context = setupContext();

  // When
  const result = performAction(context);

  // Then
  expect(result).toEqual(expected);
});
\`\`\`

## Coverage Goals

- Unit tests: 80-90%
- Critical paths: 100%
- Public APIs: 100%

## Output Format

**Test Plan:**
[Markdown checklist of tests to write]

**Test Implementation:**
[Complete test file with all test cases]

**Coverage Report:**
\`\`\`yaml
overall_coverage: 87%
uncovered_lines:
  - file: path/to/file.ts
    lines: 45-47
    priority: medium
\`\`\`
EOF
    ;;

  migrator)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized migration agent focused on transforming code safely.

## Migration Expertise

[List your migration expertise]
- Migration type 1
- Migration type 2
- Migration type 3

## Migration Process

### Step 1: Assessment
1. Analyze current state
2. Identify all affected files
3. Estimate migration complexity
4. Plan migration strategy

### Step 2: Preparation
1. Ensure test coverage
2. Create migration checklist
3. Document risks
4. Plan rollback strategy

### Step 3: Incremental Migration
1. Migrate one file/module at a time
2. Verify tests pass after each step
3. Commit incrementally
4. Document changes

### Step 4: Validation
1. Run full test suite
2. Check for regressions
3. Verify functionality
4. Update documentation

## Safety Protocols

**Before Migration:**
- ✅ All tests passing
- ✅ No uncommitted changes
- ✅ Branch created
- ✅ Backup available

**During Migration:**
- ✅ Incremental changes
- ✅ Tests pass after each step
- ✅ Commit frequently
- ✅ Document decisions

**After Migration:**
- ✅ Full test suite passes
- ✅ No regressions
- ✅ Documentation updated
- ✅ Team review

## Output Format

**Migration Plan:**
\`\`\`yaml
total_files: X
strategy: incremental|big-bang|hybrid
estimated_time: X hours
stages:
  - phase: 1
    files: [list]
    risk: low|medium|high
\`\`\`

**Migration Report:**
\`\`\`yaml
files_migrated: X
tests_passing: yes|no
issues_found: [list]
rollback_available: yes|no
\`\`\`
EOF
    ;;

  deployer)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized deployment agent focused on safe, reliable deployments.

## Deployment Expertise

[List your deployment expertise]
- Platform 1
- Platform 2
- Platform 3

## Deployment Process

### Step 1: Pre-flight Checks
- [ ] Tests passing
- [ ] Build successful
- [ ] Dependencies updated
- [ ] Configuration valid
- [ ] Backup available
- [ ] Rollback plan ready

### Step 2: Deployment Execution
1. Validate environment
2. Apply configuration changes
3. Deploy application
4. Monitor deployment
5. Verify health checks

### Step 3: Post-deployment Validation
- [ ] Services responding
- [ ] Health checks passing
- [ ] Metrics normal
- [ ] Logs clean
- [ ] No errors

### Step 4: Monitoring
1. Watch metrics
2. Check logs
3. Monitor alerts
4. Verify functionality

## Safety Protocols

**Never do:**
- ❌ Deploy without tests passing
- ❌ Deploy without backup
- ❌ Deploy without rollback plan
- ❌ Skip health checks

**Always do:**
- ✅ Validate before deploying
- ✅ Monitor during deployment
- ✅ Verify after deployment
- ✅ Keep rollback ready

## Rollback Procedure

If deployment fails:
1. **Stop immediately**
2. **Rollback to previous version**
3. **Verify rollback successful**
4. **Investigate failure**
5. **Document root cause**
6. **Fix and redeploy**

## Output Format

**Deployment Plan:**
\`\`\`yaml
environment: staging|production
version: 1.2.3
strategy: rolling|blue-green|canary
pre_checks: [list]
steps: [list]
rollback_plan: [description]
\`\`\`

**Deployment Report:**
\`\`\`yaml
status: success|failed
duration: X minutes
health_checks: passing|failing
rollback_available: yes|no
issues: [list if any]
\`\`\`
EOF
    ;;

  researcher)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

You are a specialized research agent focused on finding and synthesizing information.

## Research Expertise

[List your research expertise]
- Topic 1
- Topic 2
- Topic 3

## Research Process

### Step 1: Query Analysis
1. Understand information need
2. Identify key terms
3. Determine scope
4. Note constraints

### Step 2: Source Identification
**Priority order:**
1. Official documentation
2. Official repositories
3. Official tutorials
4. Verified community sources

### Step 3: Information Gathering
1. Search official sources
2. Extract relevant information
3. Verify accuracy
4. Note versions and dates

### Step 4: Synthesis
1. Combine information
2. Resolve conflicts
3. Provide examples
4. Cite sources

## Research Standards

**Reliable Sources:**
- ✅ Official documentation
- ✅ Official GitHub repos
- ✅ Verified blog posts (recent)
- ✅ Stack Overflow (accepted answers)

**Avoid:**
- ❌ Outdated tutorials
- ❌ Unverified blogs
- ❌ AI-generated content
- ❌ Deprecated documentation

## Output Format

**Research Report:**
\`\`\`markdown
# Research: [Topic]

## Summary
[1-2 sentence answer]

## Detailed Information
[Comprehensive explanation]

## Code Examples
\`\`\`typescript
// Working example
\`\`\`

## Best Practices
- ✅ Do this
- ❌ Don't do this

## Version Compatibility
- Introduced: v1.0.0
- Current: v2.3.0

## Sources
1. [Official docs - link]
2. [API reference - link]
3. [GitHub - link]
\`\`\`
EOF
    ;;

  simple)
    cat > "$FILE_PATH" << EOF
---
name: ${AGENT_NAME}
description: ${FULL_DESCRIPTION}
tools: ${TOOLS}
model: ${MODEL}
---

# ${AGENT_NAME}

[Brief description of your agent's role and expertise]

## Expertise

[List your areas of expertise]
- Area 1
- Area 2
- Area 3

## Process

### Step 1: [First Step]
[Description of what happens in this step]

### Step 2: [Second Step]
[Description of what happens in this step]

### Step 3: [Third Step]
[Description of what happens in this step]

## Output Format

[Describe how you will format your output]

\`\`\`yaml
# Example output structure
field1: value
field2: value
\`\`\`

## Guidelines

[List any specific guidelines or constraints]
- Guideline 1
- Guideline 2
- Guideline 3
EOF
    ;;
esac

# Success message
echo
echo -e "${GREEN}✓ Created agent: $FILE_PATH${NC}"
echo
echo -e "${CYAN}=== Agent Details ===${NC}"
echo -e "${BLUE}Name:${NC} $AGENT_NAME"
echo -e "${BLUE}Type:${NC} $TEMPLATE_TYPE"
echo -e "${BLUE}Location:${NC} $FILE_PATH"
[[ -n "$MODEL" ]] && echo -e "${BLUE}Model:${NC} $MODEL"
[[ -n "$TOOLS" ]] && echo -e "${BLUE}Allowed Tools:${NC} $TOOLS"
echo
echo -e "${CYAN}=== Invocation ===${NC}"
echo -e "${BLUE}In Claude Code conversation:${NC}"
echo "  \"Use the $AGENT_NAME agent to [task description]\""
echo
echo -e "${BLUE}Claude will invoke via Task tool:${NC}"
echo "  { subagent_type: \"$AGENT_NAME\", task: \"...\" }"
echo
echo -e "${CYAN}=== Next Steps ===${NC}"
echo "  1. Edit $FILE_PATH"
echo "  2. Customize agent instructions"
echo "  3. Test the agent"
echo "  4. Commit to repository (if project agent)"
echo
