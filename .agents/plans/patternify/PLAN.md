# /patternify - Pattern Extraction and Component Generation

## Overview

`/patternify` is a command that analyzes conversation history to identify reusable patterns and generates appropriate Claude Code components (skills, commands, agents, hooks, or composites).

**Plugin:** outfitter
**Inspired by:** hookify (anthropics/claude-code)

## Problem Statement

When working with Claude, users often develop effective workflows, tool combinations, and decision heuristics during a session. Currently, capturing these patterns as reusable components requires:

1. Manually identifying what worked
2. Knowing which component type fits the pattern
3. Writing the component from scratch

`/patternify` automates this by analyzing conversation context and generating the appropriate components.

## User Stories

1. **Immediate capture**: "That workflow we just did - turn it into a skill"
2. **Retrospective analysis**: "Look at our session and find patterns worth keeping"
3. **Focused extraction**: "/patternify the codex collaboration approach"

## Architecture

```
User invokes /patternify [optional hint]
         │
         ▼
┌─────────────────────────┐
│   pattern-analyzer      │◄── Loads skills:
│   (agent via Task)      │    • conversation-analysis
│                         │    • workflow-patterns
└───────────┬─────────────┘
            │ Returns structured findings
            ▼
┌─────────────────────────┐
│   Present findings      │◄── AskUserQuestion (multi-select)
│                         │
└───────────┬─────────────┘
            │ User selects pattern(s)
            ▼
┌─────────────────────────┐
│   Jam skill             │◄── Refine until 🟢 (≥86)
│   (Q&A refinement)      │
└───────────┬─────────────┘
            │ Refined pattern specification
            ▼
┌─────────────────────────┐
│   Component detection   │◄── Auto-detect type:
│                         │    skill/command/agent/hook/composite
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Location picker       │◄── Smart defaults:
│                         │    plugin > project > personal > custom
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Generate files        │◄── Create component(s)
│                         │
└───────────┴─────────────┘
            │
            ▼
    Confirm + next steps
```

## Components to Create

### 1. Skill: `conversation-analysis`

**Purpose:** Base capability for analyzing conversation signals

**Location:** `outfitter/skills/conversation-analysis/`

**Structure:**
```
conversation-analysis/
├── SKILL.md              # ~1,800 words, imperative style
├── references/
│   ├── signal-patterns.md
│   └── extraction-techniques.md
└── examples/
    └── sample-analysis.md
```

**Frontmatter:**
```yaml
---
name: Conversation Analysis
description: This skill should be used when analyzing conversation history to identify patterns, signals, or behaviors. Use when the user asks to "analyze this conversation", "find patterns in our chat", "what went well", "identify issues", or when an agent needs to scan conversation for specific signals. Provides structured analysis of user messages, corrections, workflows, and interaction patterns.
---
```

**SKILL.md Core Sections:**

1. **Signal Taxonomy**
   - Frustration signals: "why did you", corrections, reversions
   - Success signals: "that worked", "perfect", continuation
   - Workflow signals: multi-step sequences, tool chains
   - Request signals: "don't do X", "always do Y"

2. **Extraction Process**
   - Scan: Read conversation messages
   - Classify: Categorize each signal
   - Structure: Format as structured output
   - Score: Assign confidence levels

3. **Output Format**
   - Structured JSON with signals, evidence, confidence

**References:**
- `signal-patterns.md`: Complete taxonomy of detectable signals
- `extraction-techniques.md`: Regex patterns, heuristics for detection

---

### 2. Skill: `workflow-patterns`

**Purpose:** Extension skill for identifying reusable patterns and mapping to components

**Location:** `outfitter/skills/workflow-patterns/`

**Structure:**
```
workflow-patterns/
├── SKILL.md              # ~1,500 words
├── references/
│   ├── pattern-types.md
│   └── component-mapping.md
└── examples/
    ├── workflow-pattern.md
    ├── orchestration-pattern.md
    └── heuristic-pattern.md
```

**Frontmatter:**
```yaml
---
name: Workflow Patterns
description: This skill should be used when identifying reusable patterns from conversations or workflows. Use when the user asks to "capture this pattern", "turn this into a skill", "patternify", "extract workflow", or when analyzing conversation output for componentization. Classifies patterns as workflows, tool orchestration, or heuristics and recommends appropriate Claude component types.
---
```

**SKILL.md Core Sections:**

1. **Pattern Types**

   | Type | Definition | Example |
   |------|------------|---------|
   | Workflow | Multi-step sequence with clear phases | "search → analyze → synthesize → output" |
   | Orchestration | Novel tool combination or coordination | "pair with Codex, iterate back-and-forth" |
   | Heuristic | Decision rule or problem-solving approach | "when tests fail, check X before Y" |

2. **Component Mapping**

   | Pattern Type | Primary Component | When Composite |
   |--------------|-------------------|----------------|
   | Workflow | Skill | + Command if user-initiated |
   | Orchestration | Skill or Agent | + Hook if needs automation |
   | Heuristic | Skill | + Hook if should auto-trigger |

3. **Composite Detection Signals**
   - Pattern needs user initiation → add Command
   - Pattern should run autonomously → add Agent
   - Pattern should trigger on events → add Hook
   - Pattern has both knowledge + action → Skill + Command

**References:**
- `pattern-types.md`: Deep dive on each pattern type with examples
- `component-mapping.md`: Decision tree for component selection

---

### 3. Agent: `pattern-analyzer`

**Purpose:** Autonomous agent that scans conversation and returns structured findings

**Location:** `outfitter/agents/pattern-analyzer.md`

**Frontmatter:**
```yaml
---
name: pattern-analyzer
description: Use this agent when analyzing conversation history to identify reusable patterns that could become skills, commands, agents, or hooks. Examples:

<example>
Context: User just completed a productive workflow and wants to capture it.
user: "That worked great - can you turn that into something reusable?"
assistant: "I'll use the pattern-analyzer agent to scan our conversation and identify the reusable patterns."
<commentary>
User explicitly wants to capture a pattern from the conversation. Launch pattern-analyzer to identify what can be extracted.
</commentary>
</example>

<example>
Context: User invoked /patternify command without arguments.
user: "/patternify"
assistant: "I'll launch the pattern-analyzer agent to scan our conversation for workflows, tool orchestration patterns, and heuristics worth capturing."
<commentary>
The /patternify command triggers pattern analysis. Without arguments, analyze the full conversation.
</commentary>
</example>

<example>
Context: User invoked /patternify with a hint.
user: "/patternify the codex collaboration workflow"
assistant: "I'll use the pattern-analyzer agent to focus on the Codex collaboration pattern from our conversation."
<commentary>
With a hint, the agent focuses analysis on the specific pattern mentioned while still using conversation context.
</commentary>
</example>

model: sonnet
color: cyan
tools: ["Read", "Grep", "Glob", "Skill"]
---
```

**System Prompt:**
```markdown
You are a pattern extraction specialist that analyzes conversations to identify reusable workflows, tool orchestration patterns, and decision heuristics.

**Your Core Responsibilities:**
1. Load the `conversation-analysis` skill for signal detection methodology
2. Load the `workflow-patterns` skill for pattern classification and component mapping
3. Scan conversation history for reusable patterns
4. Classify and score each pattern found
5. Return structured findings for user selection

**Analysis Process:**

1. **Load Skills**
   Use the Skill tool to load:
   - `outfitter:conversation-analysis` - for signal detection
   - `outfitter:workflow-patterns` - for pattern classification

2. **Scan Conversation**
   Analyze the conversation (prioritize last 20-30 messages) for:
   - Multi-step workflows that succeeded
   - Novel tool combinations or orchestrations
   - Decision heuristics that worked well
   - Repeated patterns across messages
   - Explicit user praise or "that worked" signals

3. **Classify Patterns**
   For each pattern found:
   - Determine type: workflow | orchestration | heuristic
   - Extract key steps or components
   - Identify evidence (specific messages/actions)
   - Score confidence: high (clear, repeated) | medium (once, clear) | low (implicit)

4. **Map to Components**
   Using workflow-patterns guidance:
   - Recommend primary component type
   - Detect if composite needed
   - Note any special considerations

5. **Return Findings**
   Structure output for command to present to user

**Output Format:**

Return findings as JSON:
```json
{
  "patterns": [
    {
      "id": "pattern-1",
      "type": "workflow",
      "name": "suggested-kebab-name",
      "title": "Human Readable Title",
      "description": "What this pattern does and when to use it",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "evidence": [
        "User said: '...'",
        "Assistant did: '...'"
      ],
      "confidence": "high",
      "recommended_component": "skill",
      "composite_needs": null,
      "notes": "Any special considerations"
    }
  ],
  "summary": "Found N patterns: X workflows, Y orchestrations, Z heuristics",
  "hint_match": "pattern-1"  // If hint provided, which pattern matches
}
```

**Edge Cases:**

- **No patterns found**: Return empty patterns array with summary explaining why (e.g., "Conversation focused on Q&A without reusable workflows")
- **Hint provided**: Prioritize patterns matching the hint; set `hint_match` field
- **Pattern too broad**: If pattern spans entire conversation, note in `notes` that it may need scoping
- **Ambiguous type**: If pattern could be multiple types, list primary with alternatives in `notes`
- **Low confidence patterns**: Include but clearly mark; let user decide

**Quality Standards:**

- Every pattern must have concrete evidence from conversation
- Descriptions should be specific enough to recreate the pattern
- Confidence ratings should be justified by evidence quantity/clarity
- Component recommendations should follow workflow-patterns skill guidance
```

---

### 4. Command: `/patternify`

**Purpose:** Main entry point that orchestrates the full workflow

**Location:** `outfitter/commands/patternify.md`

**Frontmatter:**
```yaml
---
description: Analyze conversation to identify and capture reusable patterns as skills, commands, agents, or hooks
argument-hint: [optional pattern hint]
allowed-tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "Task", "TodoWrite", "AskUserQuestion", "Skill"]
---
```

**Command Body Structure:**

```markdown
# Patternify - Capture Conversation Patterns

Transform productive workflows, tool orchestrations, and decision heuristics from this conversation into reusable Claude Code components.

## Workflow

### Phase 1: Analyze Conversation

**If $ARGUMENTS provided:**
- User gave a hint: `$ARGUMENTS`
- Pass hint to pattern-analyzer for focused analysis

**If $ARGUMENTS empty:**
- Analyze full conversation for all pattern types

**Launch pattern-analyzer:**
Use Task tool to launch the pattern-analyzer agent:
```json
{
  "subagent_type": "pattern-analyzer",
  "description": "Analyze conversation for reusable patterns",
  "prompt": "Analyze this conversation for reusable patterns. Hint: $ARGUMENTS"
}
```

### Phase 2: Present Findings

After receiving pattern-analyzer results, present to user with AskUserQuestion:

**Question: Which patterns to capture?**
- Header: "Patterns Found"
- multiSelect: true
- Options: List each pattern (max 4)
  - Label: Pattern title
  - Description: Type + confidence + brief description

If no patterns found, inform user and offer to:
1. Try with a specific hint
2. Describe a pattern manually

### Phase 3: Refine with Jam

For each selected pattern, use the jam skill to refine:

Load jam skill, then for each pattern:
1. Present pattern summary
2. Ask clarifying questions until 🟢 confidence:
   - What triggers this pattern?
   - What are the key steps?
   - What's the expected output?
   - Any edge cases to handle?
3. Confirm final specification

### Phase 4: Determine Component Type

Based on jam refinement, confirm component type:

**Auto-detection rules:**
- Primarily knowledge/guidance → Skill
- User-initiated action → Command (may invoke skill)
- Autonomous multi-step work → Agent
- Event-triggered behavior → Hook
- Multiple concerns → Composite

Present recommendation with AskUserQuestion:
- Header: "Component Type"
- Options based on pattern, with recommendation marked

### Phase 5: Choose Location

Detect context and present smart-ordered picker:

**Detection logic:**
1. Check if in plugin directory (has .claude-plugin/)
   - If yes: plugin first
2. Check if in git repo
   - If yes: project first
3. Otherwise: personal first

**AskUserQuestion:**
- Header: "Location"
- Options (smart-ordered):
  - Plugin: `outfitter/skills/pattern-name/` (if in plugin)
  - Project: `.claude/skills/pattern-name/`
  - Personal: `~/.claude/skills/pattern-name/`
  - Custom: Specify path

### Phase 6: Generate Files

Based on component type and location, generate files:

**For Skill:**
```
location/skills/pattern-name/
├── SKILL.md
└── references/ (if needed)
```

**For Command:**
```
location/commands/pattern-name.md
```

**For Agent:**
```
location/agents/pattern-name.md
```

**For Hook:**
```
location/hooks/pattern-name/
├── hooks.json
└── handler.sh (or .ts)
```

**For Composite:**
Generate multiple files as needed.

### Phase 7: Confirm

Show user what was created:

```
Created pattern-name as [component type]:

Files:
- path/to/file1.md
- path/to/file2.md

Next steps:
1. Review the generated files
2. Test by [how to test]
3. Iterate as needed

The component is ready to use!
```

## Error Handling

**No patterns found:**
- Offer manual description option
- Suggest trying with specific hint

**Jam doesn't reach 🟢:**
- Allow proceeding with ⚠️ Residual Uncertainty section
- Document open questions in generated component

**File generation fails:**
- Check permissions
- Suggest alternative location
- Show manual creation steps

## Usage Examples

**Example 1: No arguments**
```
/patternify
```
Analyzes full conversation, presents all found patterns.

**Example 2: With hint**
```
/patternify the debugging workflow we used
```
Focuses on debugging-related patterns.

**Example 3: Specific capture**
```
/patternify codex collaboration
```
Extracts the Codex pairing pattern specifically.
```

---

## Implementation Order

1. **conversation-analysis skill** - Base capability, needed by agent
2. **workflow-patterns skill** - Extension, needed by agent
3. **pattern-analyzer agent** - Loads skills, returns findings
4. **patternify command** - Orchestrates full flow

## Testing Strategy

### Unit Testing

1. **conversation-analysis skill**
   - Test with sample conversations containing known signals
   - Verify signal detection accuracy

2. **workflow-patterns skill**
   - Test pattern classification with examples
   - Verify component mapping recommendations

3. **pattern-analyzer agent**
   - Test with real conversation transcripts
   - Verify structured output format

4. **patternify command**
   - End-to-end test with sample conversations
   - Test each phase independently

### Integration Testing

1. Run `/patternify` in a real session after productive work
2. Verify pattern detection matches expectations
3. Test jam refinement flow
4. Verify generated components are valid
5. Test generated components actually work

## Success Criteria

- [ ] Command successfully analyzes conversation
- [ ] Patterns are accurately detected and classified
- [ ] Jam refinement reaches 🟢 for clear patterns
- [ ] Generated components follow plugin-dev best practices
- [ ] Components work immediately after generation
- [ ] Smart location detection works correctly

## Future Extensions

1. **Additional pattern types**: error-patterns, security-patterns
2. **Pattern library**: Save/share discovered patterns
3. **Proactive suggestions**: Agent notices patterns and offers to capture
4. **Pattern composition**: Combine multiple patterns into larger components
5. **Cross-session analysis**: Analyze patterns across multiple sessions

## Dependencies

- **outfitter plugin**: Host for all components
- **jam skill**: Already exists in outfitter
- **plugin-dev skills**: For best practices guidance
- **hookify**: Reference implementation for conversation analysis pattern

## Open Questions

1. Should pattern-analyzer use haiku for speed or sonnet for quality?
   - **Decision**: sonnet - quality matters more than speed for this use case

2. How many patterns should be presented at once?
   - **Decision**: Max 4 in AskUserQuestion, pagination if more

3. Should we support editing existing components?
   - **Deferred**: v2 feature - focus on creation first
