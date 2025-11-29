---
description: Analyze conversation to identify and capture reusable patterns as skills, commands, agents, or hooks
argument-hint: [optional pattern hint]
allowed-tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "Task", "TodoWrite", "AskUserQuestion", "Skill"]
version: 1.0.0
---

# Patternify - Capture Conversation Patterns

Transform productive workflows, tool orchestrations, and decision heuristics from this conversation into reusable Claude Code components (skills, commands, agents, or hooks).

## Phase 1: Analyze Conversation

Detect patterns in the conversation using the pattern-analyzer agent:

**If `$ARGUMENTS` provided:**
Launch pattern-analyzer with focused hint:
```json
{
  "subagent_type": "pattern-analyzer",
  "description": "Analyze conversation for patterns matching: $ARGUMENTS",
  "prompt": "Analyze this conversation for reusable patterns. Focus on: $ARGUMENTS"
}
```

**If `$ARGUMENTS` empty:**
Launch pattern-analyzer for comprehensive analysis:
```json
{
  "subagent_type": "pattern-analyzer",
  "description": "Analyze conversation for all reusable patterns",
  "prompt": "Analyze this conversation for reusable patterns across all types (workflows, tool orchestrations, decision heuristics, debugging approaches, etc.)"
}
```

Wait for pattern-analyzer to complete before proceeding.

## Phase 2: Present Findings

After receiving pattern-analyzer results, present findings to user:

**If patterns found:**
- Use AskUserQuestion with multiSelect: true
- Header: "Patterns Found"
- Present up to 4 most relevant patterns as options
- Each option:
  - Label: Pattern title (concise, 3-7 words)
  - Description: `[Type] (Confidence: XX%) - Brief description of what this pattern captures`

**If no patterns found:**
Inform user and offer alternatives:
- "No clear patterns detected in this conversation"
- Options:
  1. Try again with a specific hint: `/patternify <describe what you're looking for>`
  2. Describe the pattern manually and I'll help create the component
  3. Continue conversation to establish clearer patterns

**If analyzer returns error with partial results:**
- Present warning: "⚠️ Analysis incomplete due to [error type]"
- Show patterns found (if any) with confidence disclaimer
- Offer options:
  1. Proceed with available patterns
  2. Retry analysis with different scope
  3. Manually describe pattern

**If analyzer returns complete failure:**
- Log error details for debugging
- Inform user: "Pattern analysis failed: [reason]"
- Offer manual pattern specification option

## Phase 3: Refine with Jam

For each pattern selected by the user:

1. **Load jam skill**: Use Skill tool to invoke `jam`
2. **Present pattern summary** from analyzer results
3. **Ask clarifying questions** until reaching 🟢 confidence (≥86%):
   - What specific actions or words should trigger this pattern?
   - What are the key steps in this workflow?
   - What's the expected output or outcome?
   - Are there edge cases, error conditions, or variations to handle?
   - What context or prerequisites are needed?
   - Should this be autonomous or user-initiated?
4. **Confirm final specification** before proceeding to component generation

**If 🟢 not reached:**
- Allow proceeding with ⚠️ Residual Uncertainty
- Document open questions in generated component's comments or TODO sections

## Phase 4: Determine Component Type

Auto-detect appropriate component type(s) using these rules:

**Detection Logic:**
- **Skill**: Primarily knowledge, guidance, or multi-phase process with progressive disclosure
  - Examples: debugging methodology, research process, design approach
- **Command**: User-initiated single action or workflow
  - Examples: format code, run tests, generate boilerplate
  - May invoke a skill internally
- **Agent**: Autonomous multi-step work requiring specialized context/instructions
  - Examples: PR reviewer, feature implementer, test generator
- **Hook**: Event-triggered behavior
  - Examples: pre-commit validation, post-merge cleanup
- **Composite**: Multiple concerns requiring multiple components
  - Examples: skill + command, skill + hook, command + agent

**Present recommendation:**
Use AskUserQuestion:
- Header: "Component Type"
- multiSelect: false
- Options: List applicable types with recommended one marked "(Recommended)" in description
- If composite, offer option: "Multiple components (skill + command/hook/agent)"

## Phase 5: Choose Location

Smart-ordered location picker based on current context:

**Detection logic:**
1. Check if in plugin directory: Look for `.claude-plugin/plugin.json` in current path or ancestors
2. Check if in git repo: Run `git rev-parse --git-dir`
3. Otherwise: Default to personal

**Present options** (ordered by detection results):

Use AskUserQuestion:
- Header: "Location"
- multiSelect: false
- Options (order based on context):
  - **Plugin**: `{plugin-name}/{component-dir}/pattern-name/` - "Add to current plugin (shareable via marketplace)"
  - **Project**: `.claude/{component-dir}/pattern-name/` - "Add to current project (git-committed, team-shared)"
  - **Personal**: `~/.claude/{component-dir}/pattern-name/` - "Add to personal toolkit (available globally)"
  - **Custom**: "Specify custom path"

Where `{component-dir}` is: `skills`, `commands`, `agents`, or `hooks` based on Phase 4 selection.

If Custom selected, ask for explicit path.

## Phase 6: Generate Files

Generate component files based on type and location:

### For Skill:
```
{location}/skills/{pattern-name}/
├── SKILL.md              # Main skill file with frontmatter, progressive disclosure
└── references/           # (Optional) Supporting files, examples, schemas
    ├── EXAMPLES.md
    └── REFERENCE.md
```

**SKILL.md structure:**
- YAML frontmatter: description, keywords, allowed-tools
- Progressive disclosure: Start with core guidance, expand with details
- Examples section: 2-3 usage examples
- Reference section: Advanced details, edge cases (or link to REFERENCE.md)

### For Command:
```
{location}/commands/{pattern-name}.md
```

**Command structure:**
- YAML frontmatter: description, argument-hint, allowed-tools
- Clear workflow steps
- Error handling guidance
- Usage examples

### For Agent:
```
{location}/agents/{pattern-name}.md
```

**Agent structure:**
- YAML frontmatter: description, capabilities, allowed-tools
- Specialized system prompt
- Task-specific guidance
- Quality standards

### For Hook:
```
{location}/hooks/
├── hooks.json            # Update or create with new hook entry
└── {pattern-name}.sh     # Hook script (or .ts for TypeScript)
```

**hooks.json entry:**
```json
{
  "hooks": [
    {
      "name": "pattern-name",
      "event": "appropriate-event",
      "matcher": { /* event-specific matcher */ },
      "script": "./pattern-name.sh",
      "description": "Brief description"
    }
  ]
}
```

### For Composite:
Generate all applicable files. For example, skill + command:
- Create skill in `skills/{pattern-name}/`
- Create command in `commands/{pattern-name}.md` that invokes the skill

**File Generation:**
- Use Write tool for new files
- Use Edit tool to update existing hooks.json
- Follow plugin-dev best practices for structure and content
- Include comprehensive documentation from jam refinement

## Phase 7: Confirm

Show user what was created with clear next steps:

```
✓ Created {pattern-name} as {component-type}

Files generated:
- {absolute-path-1}
- {absolute-path-2}
{- ...}

Next steps:
1. Review the generated files for accuracy
2. Test the component:
   {test-instructions-based-on-type}
3. Iterate as needed - use /patternify again to refine

The component is ready to use!
```

**Test instructions by type:**
- **Skill**: Load with Skill tool or invoke manually to verify guidance
- **Command**: Run `/{pattern-name}` to test workflow
- **Agent**: Invoke via Task tool with sample input
- **Hook**: Trigger the event to verify behavior (or test manually)

## Error Handling

### No patterns found:
- Inform user: "No clear patterns detected in this conversation"
- Offer options:
  1. "Try with a specific hint: `/patternify <what you're looking for>`"
  2. "Describe the pattern manually and I'll create the component"
  3. "Continue the conversation to establish clearer patterns"

### Jam doesn't reach 🟢:
- Show current confidence level with ⚠️ warning
- Ask: "Proceed with remaining uncertainty documented, or continue refining?"
- If proceeding: Add "Residual Uncertainty" or "TODO" sections to generated files
- Document specific open questions for future iteration

### File generation fails:
1. **Check permissions**: Verify write access to target directory
2. **Suggest alternative location**: Offer personal or custom path
3. **Show manual creation steps**: Provide file contents for manual creation
4. **Report specific error**: Include error message and suggested fix

### Location detection fails:
- Default to personal location
- Inform user: "Defaulting to personal toolkit (~/.claude/...)"
- Offer to specify custom path

## Validating Generated Components

After generating a component, validate it works correctly:

### Skill Validation
```bash
# Check skill loads properly
claude "Load the {pattern-name} skill and summarize what it does"

# Test trigger phrases
claude "Help me {trigger-phrase-from-skill}"
```

### Command Validation
```bash
# Run the command
claude "/{pattern-name}"

# Verify output matches expectations
```

### Agent Validation
```bash
# Invoke via Task tool context
claude "Use the {pattern-name} agent to analyze X"

# Verify structured output format
```

### Hook Validation
```bash
# Check hooks.json is valid
cat .claude/hooks/hooks.json | jq .

# Test by triggering the event (e.g., git commit)
git commit --allow-empty -m "test: trigger hook"
```

## Usage Examples

### Example 1: Full Conversation Analysis
```
User: /patternify
→ Analyzes entire conversation
→ Presents found patterns for selection
→ Refines selected patterns with jam
→ Generates components
```

### Example 2: Focused Pattern Extraction
```
User: /patternify the debugging workflow we used
→ Focuses on debugging-related patterns
→ Prioritizes matches to "debugging workflow"
→ Proceeds with refinement and generation
```

### Example 3: Specific Pattern
```
User: /patternify codex collaboration
→ Extracts the Codex pairing pattern specifically
→ Maps to appropriate component type
→ Generates with integration notes
```

## Quick Reference

| Phase | Action | Tool |
|-------|--------|------|
| 1. Analyze | Launch pattern-analyzer | Task |
| 2. Present | Show patterns for selection | AskUserQuestion |
| 3. Refine | Build confidence with jam | Skill |
| 4. Type | Detect component type | AskUserQuestion |
| 5. Location | Choose where to save | AskUserQuestion |
| 6. Generate | Create files | Write |
| 7. Confirm | Show results + next steps | Output |