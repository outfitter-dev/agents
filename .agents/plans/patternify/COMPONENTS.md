# Component Specifications

Detailed specifications for each component in the /patternify system.

---

## 1. conversation-analysis Skill

### File: `outfitter/skills/conversation-analysis/SKILL.md`

```yaml
---
name: Conversation Analysis
description: This skill should be used when analyzing conversation history to identify patterns, signals, or behaviors. Use when the user asks to "analyze this conversation", "find patterns in our chat", "what went well", "identify issues", or when an agent needs to scan conversation for specific signals. Provides structured analysis of user messages, corrections, workflows, and interaction patterns.
---
```

### SKILL.md Body (~1,800 words)

```markdown
# Conversation Analysis

Structured methodology for extracting signals and patterns from conversation history.

## Quick Start

1. Identify the analysis goal (patterns, frustrations, workflows, etc.)
2. Scan conversation messages for relevant signals
3. Classify signals by type and confidence
4. Return structured findings

## Signal Taxonomy

### Success Signals

Indicators of productive interactions:

| Signal | Pattern | Example |
|--------|---------|---------|
| Explicit praise | "perfect", "that worked", "exactly" | "Perfect, that's exactly what I needed" |
| Continuation | Building on previous output | "Now let's also add..." |
| Adoption | Using suggested approach | User implements recommendation |

### Frustration Signals

Indicators of friction or issues:

| Signal | Pattern | Example |
|--------|---------|---------|
| Correction | "no, I meant", "not that" | "No, I meant the other file" |
| Reversion | Undoing an action | "Can you undo that change?" |
| Repetition | Asking same thing again | Same question rephrased |
| Explicit frustration | "why did you", "I didn't ask" | "Why did you modify that file?" |

### Workflow Signals

Indicators of multi-step processes:

| Signal | Pattern | Example |
|--------|---------|---------|
| Sequence markers | "first", "then", "next", "finally" | "First search, then analyze" |
| Phase transitions | Distinct stages of work | Research → Design → Implement |
| Tool chains | Multiple tools in sequence | Grep → Read → Edit → Bash |

### Request Signals

Explicit behavioral requests:

| Signal | Pattern | Example |
|--------|---------|---------|
| Prohibition | "don't", "never", "avoid" | "Don't modify package.json" |
| Requirement | "always", "must", "should" | "Always run tests first" |
| Preference | "prefer", "better if", "I like" | "I prefer smaller commits" |

## Analysis Process

### Step 1: Scope Definition

Define what to analyze:
- Full conversation or recent N messages
- Specific signal types to look for
- Any hints or focus areas from user

### Step 2: Signal Extraction

Scan messages systematically:

1. Read each user message
2. Identify signals matching taxonomy
3. Note the context and evidence
4. Record timestamp/position for ordering

### Step 3: Signal Classification

For each signal found:
- **Type**: success | frustration | workflow | request
- **Subtype**: Specific signal from taxonomy
- **Evidence**: Exact quote or description
- **Confidence**: high | medium | low
- **Context**: What was happening

### Step 4: Pattern Detection

Group related signals:
- Repeated signals → potential pattern
- Sequential signals → potential workflow
- Related frustrations → potential hook/rule

### Step 5: Structured Output

Return findings in consistent format.

## Output Format

```json
{
  "signals": [
    {
      "type": "workflow",
      "subtype": "sequence_markers",
      "evidence": "User said: 'First search for X, then analyze the results'",
      "confidence": "high",
      "context": "User describing their process",
      "position": 12
    }
  ],
  "patterns": [
    {
      "name": "search-analyze-pattern",
      "signals": ["signal-1", "signal-2"],
      "description": "User consistently follows search → analyze flow"
    }
  ],
  "summary": {
    "total_signals": 15,
    "by_type": {
      "success": 5,
      "frustration": 2,
      "workflow": 6,
      "request": 2
    }
  }
}
```

## Best Practices

### Accuracy Over Quantity

Prefer fewer high-confidence signals over many uncertain ones. Each signal should have clear evidence.

### Context Matters

A correction ("no, not that") in response to a clarifying question differs from a correction after an action. Note context.

### Recency Weighting

Recent signals often matter more. When presenting findings, weight recent patterns higher.

### Evidence Required

Every signal must link to specific conversation content. No inferred signals without evidence.

## Integration

This skill is designed to be loaded by agents that need conversation analysis capability. The pattern-analyzer agent loads this skill for its signal detection methodology.

## Additional Resources

For detailed guidance, see:
- **`references/signal-patterns.md`** - Extended signal taxonomy with edge cases
- **`references/extraction-techniques.md`** - Advanced extraction methods
- **`examples/sample-analysis.md`** - Complete analysis example
```

---

## 2. workflow-patterns Skill

### File: `outfitter/skills/workflow-patterns/SKILL.md`

```yaml
---
name: Workflow Patterns
description: This skill should be used when identifying reusable patterns from conversations or workflows. Use when the user asks to "capture this pattern", "turn this into a skill", "patternify", "extract workflow", or when analyzing conversation output for componentization. Classifies patterns as workflows, tool orchestration, or heuristics and recommends appropriate Claude component types.
---
```

### SKILL.md Body (~1,500 words)

```markdown
# Workflow Patterns

Classification and componentization of reusable patterns extracted from conversations.

## Quick Start

1. Receive signals/patterns from conversation analysis
2. Classify pattern type (workflow, orchestration, heuristic)
3. Determine appropriate component type(s)
4. Return classification with recommendations

## Pattern Types

### Workflows

Multi-step sequences with clear phases and progression.

**Characteristics:**
- Defined start and end states
- Sequential or branching steps
- Produces specific output
- Can be repeated

**Examples:**
- "Search → Analyze → Synthesize → Output"
- "Read spec → Design → Implement → Test → Refactor"
- "Gather requirements → Clarify → Plan → Execute"

**Best component:** Skill (knowledge of how to do it)
**Add command if:** User explicitly invokes it
**Add agent if:** Should run autonomously

### Orchestration

Novel combinations of tools, agents, or external systems.

**Characteristics:**
- Coordinates multiple capabilities
- Often involves back-and-forth
- Creates emergent behavior
- May involve external systems

**Examples:**
- "Pair with Codex, iterate collaboratively"
- "Use grep to find, read to understand, edit to fix"
- "Search web, analyze results, synthesize findings"

**Best component:** Skill or Agent (depends on autonomy)
**Add command if:** Needs explicit invocation
**Add hook if:** Should trigger on events

### Heuristics

Decision rules, problem-solving approaches, or best practices.

**Characteristics:**
- "When X, do Y" structure
- Based on experience or learning
- Guides decisions
- Often prevents mistakes

**Examples:**
- "When tests fail, check dependencies before code"
- "For new features, always start with types"
- "If error mentions X, usually means Y"

**Best component:** Skill (captures the knowledge)
**Add hook if:** Should auto-trigger to warn/block

## Component Mapping

### Decision Tree

```
Is it primarily knowledge/guidance?
├─ Yes → Skill
│   └─ Does user explicitly invoke it?
│       ├─ Yes → + Command
│       └─ No → Skill only
└─ No → Continue...

Does it require autonomous multi-step work?
├─ Yes → Agent
│   └─ Also needs knowledge base?
│       ├─ Yes → + Skill
│       └─ No → Agent only
└─ No → Continue...

Should it trigger on specific events?
├─ Yes → Hook
│   └─ Also needs decision logic?
│       ├─ Yes → + Skill
│       └─ No → Hook only
└─ No → Skill (default)
```

### Component Characteristics

| Component | Best For | Invocation | Autonomy |
|-----------|----------|------------|----------|
| Skill | Knowledge, procedures, guidance | Auto-triggered by context | None |
| Command | User-initiated actions | Explicit /command | As designed |
| Agent | Autonomous complex tasks | Task tool | High |
| Hook | Event-triggered behavior | Automatic on events | Limited |

### Composite Patterns

Some patterns require multiple components:

**Skill + Command:**
- Pattern has reusable knowledge AND user-initiated action
- Example: TDD skill + /tdd command

**Skill + Hook:**
- Pattern has knowledge AND should auto-trigger
- Example: Security skill + PreToolUse hook

**Agent + Skill:**
- Autonomous work that needs domain knowledge
- Example: Code reviewer agent + review standards skill

**Command + Agent:**
- User invokes, then agent runs autonomously
- Example: /analyze command launches analyzer agent

## Pattern Specification

### Required Fields

For any pattern to become a component:

```yaml
name: kebab-case-name
title: Human Readable Title
type: workflow | orchestration | heuristic
description: What it does and when to use it
```

### Workflow-specific Fields

```yaml
steps:
  - "Step 1 description"
  - "Step 2 description"
triggers:
  - "phrase that triggers this"
  - "another trigger phrase"
```

### Orchestration-specific Fields

```yaml
tools_involved:
  - "Tool 1"
  - "Tool 2"
coordination: sequential | parallel | iterative
external_systems:
  - "System name (if any)"
```

### Heuristic-specific Fields

```yaml
condition: "When X happens"
action: "Do Y"
rationale: "Because Z"
exceptions:
  - "Unless A"
```

## Quality Criteria

### Good Pattern

- Clear, specific purpose
- Concrete steps or rules
- Based on evidence from conversation
- Appropriate scope (not too broad)
- Actionable

### Poor Pattern (Avoid)

- Vague or generic
- No concrete steps
- Speculation without evidence
- Too broad ("do good code")
- Not actionable

## Integration

This skill works with conversation-analysis to form a complete pattern extraction pipeline:

1. conversation-analysis extracts signals
2. workflow-patterns classifies and maps to components

The pattern-analyzer agent loads both skills.

## Additional Resources

For detailed guidance, see:
- **`references/pattern-types.md`** - Extended pattern taxonomy
- **`references/component-mapping.md`** - Detailed decision logic
- **`examples/`** - Pattern examples by type
```

---

## 3. pattern-analyzer Agent

### File: `outfitter/agents/pattern-analyzer.md`

Full specification in PLAN.md. Key points:

- **Model:** sonnet (quality over speed)
- **Color:** cyan (analysis theme)
- **Tools:** Read, Grep, Glob, Skill (for loading skills)
- **Description:** Includes 3 example blocks for triggering
- **System prompt:** ~800 words with clear process and output format

---

## 4. patternify Command

### File: `outfitter/commands/patternify.md`

Full specification in PLAN.md. Key sections:

1. Phase 1: Analyze (launch pattern-analyzer)
2. Phase 2: Present (AskUserQuestion multi-select)
3. Phase 3: Refine (jam skill)
4. Phase 4: Component type (auto-detect + confirm)
5. Phase 5: Location (smart picker)
6. Phase 6: Generate (create files)
7. Phase 7: Confirm (show results)

---

## Supporting Files

### references/signal-patterns.md

Extended taxonomy with:
- Edge cases for each signal type
- Disambiguation guidance
- Confidence scoring rubric

### references/extraction-techniques.md

- Regex patterns for common signals
- Heuristics for workflow detection
- Context analysis methods

### references/pattern-types.md

- Detailed examples of each pattern type
- Anti-patterns to avoid
- Complex/hybrid patterns

### references/component-mapping.md

- Full decision tree with examples
- Edge cases and exceptions
- Composite pattern guidance

### examples/

- `sample-analysis.md` - Complete conversation analysis
- `workflow-pattern.md` - Workflow pattern example
- `orchestration-pattern.md` - Orchestration example
- `heuristic-pattern.md` - Heuristic example
