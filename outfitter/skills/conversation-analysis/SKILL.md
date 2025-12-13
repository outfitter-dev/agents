---
name: Conversation Analysis
version: 1.1.0
description: Analyzes conversation history to identify patterns, signals, and behaviors. Use when the user asks to "analyze this conversation", "find patterns in our chat", "what went well", "identify issues", or when an agent needs to scan conversation for specific signals like frustration, success, workflow transitions, or user preferences.
---

# Conversation Analysis

Extract actionable signals and behavioral patterns from conversation history using structured signal taxonomy and pattern detection methods.

## Quick Start

1. Create "Parse Input" todo as `in_progress` via TodoWrite
2. **Define scope**: Identify which messages to analyze (recent N messages, specific date range, or entire conversation)
3. **Extract signals**: Scan for success, frustration, workflow, and request signals using the taxonomy below
4. **Detect patterns**: Group related signals into behavioral patterns (repetition, evolution, preferences)
5. **Generate output**: Produce structured JSON with signals, patterns, and summary
6. On phase transitions, update todos (see Progress Tracking)

## Progress Tracking

Use TodoWrite to show analysis progression. Create todos at session start, update as you advance.

**Core Phases:**

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Parse Input** | Session start | "Parsing input" |
| **Extract Insights** | Scope validated | "Extracting insights" |
| **Categorize Elements** | Signals extracted | "Categorizing elements" |
| **Synthesize Report** | Categorization complete | "Synthesizing report" |

**Workflow:**
- On session start: Create "Parse Input" as `in_progress`
- On phase transition: Mark current phase `completed`, add next phase as `in_progress`
- After delivering output: Mark "Synthesize Report" as `completed`

**Edge Cases:**
- **Narrow scope**: If analyzing <5 messages, may skip directly from "Parse Input" to "Synthesize Report"
- **Re-analysis**: If user requests refinement of existing analysis, resume at "Categorize Elements"
- **No regression**: Phases only advance, never regress

## Signal Taxonomy

### Success Signals

Indicators that an interaction or output met or exceeded user expectations.

| Signal Type | Examples | Context Clues |
|------------|----------|---------------|
| **Explicit Praise** | "Perfect!", "Exactly what I needed", "This is great" | Exclamation marks, positive adjectives |
| **Continuation** | "Now do the same for...", "Apply this pattern to..." | Building on previous work without corrections |
| **Adoption** | User incorporates agent's suggestion without modification | Next message shows implementation of suggested approach |
| **Completion Acceptance** | "Looks good", "Ship it", "Merge this" | Approval language followed by action |

### Frustration Signals

Indicators that an interaction failed to meet user expectations or created friction.

| Signal Type | Examples | Context Clues |
|------------|----------|---------------|
| **Correction** | "No, I meant...", "Actually, do X instead", "That's wrong" | Negation words, contradiction of prior agent output |
| **Reversion** | User manually undoes agent's changes | Follow-up message requests return to earlier state |
| **Repetition** | User repeats same request 2+ times | Similar phrasing, escalating specificity |
| **Explicit Frustration** | "This isn't working", "Why did you...", "I already told you..." | Question marks with negative tone, reference to prior failures |

### Workflow Signals

Indicators of task structure, phase transitions, and sequential patterns.

| Signal Type | Examples | Context Clues |
|------------|----------|---------------|
| **Sequence Markers** | "First...", "Next...", "Then...", "Finally..." | Ordinal language, numbered lists |
| **Phase Transitions** | "Now that X is done, let's Y", "Moving on to..." | References to completion + new direction |
| **Tool Chains** | Consistent tool usage patterns (Read → Edit → Bash) | Same tool sequence across multiple tasks |
| **Context Switches** | Abrupt topic changes, new file focus | No transition language, different domain vocabulary |

### Request Signals

Explicit or implicit user preferences, requirements, and constraints.

| Signal Type | Examples | Context Clues |
|------------|----------|---------------|
| **Prohibition** | "Don't use X", "Never do Y", "Avoid Z" | Negative imperatives, explicit constraints |
| **Requirement** | "Always check...", "Make sure to...", "You must..." | Absolute language, modal verbs |
| **Preference** | "I prefer...", "It's better to...", "I'd rather..." | Comparative language, subjective statements |
| **Conditional** | "If X then Y", "When A, do B" | Logical connectives, situational rules |

## Analysis Process

### Step 1: Scope Definition

Define the boundaries of the analysis.

```
Identify:
- Message range (all, recent N, date range, specific thread)
- Actors to include (user only, agent only, both)
- Exclusions (system messages, tool outputs, code blocks)
```

**Example**: "Analyze the last 20 user messages, excluding code blocks and tool outputs."

**Phase transition**: After scope is validated, mark "Parse Input" as `completed` and create "Extract Insights" as `in_progress`.

### Step 2: Signal Extraction

Scan each message for signals using the taxonomy.

```
For each message:
1. Normalize text (lowercase, trim, remove formatting)
2. Check for signal keywords and patterns
3. Examine context (previous 1-2 messages, current task)
4. Extract signal with metadata:
   - Signal type
   - Message ID/timestamp
   - Exact quote
   - Confidence (high/medium/low)
```

**Extraction criteria**:
- **High confidence**: Explicit language matching signal type exactly
- **Medium confidence**: Implicit language or contextual clues
- **Low confidence**: Ambiguous language requiring interpretation

**Phase transition**: After signals are extracted, mark "Extract Insights" as `completed` and create "Categorize Elements" as `in_progress`.

### Step 3: Signal Classification

Categorize extracted signals by type and sub-type.

```
Group signals into:
- Success (praise, continuation, adoption, acceptance)
- Frustration (correction, reversion, repetition, explicit)
- Workflow (sequence, transition, tool chain, context switch)
- Request (prohibition, requirement, preference, conditional)
```

**Classification rules**:
- A single message may contain multiple signals
- Prioritize explicit signals over implicit ones
- Consider recency when weighting contradictory signals
- Mark ambiguous signals for manual review

### Step 4: Pattern Detection

Identify behavioral patterns from signal clusters.

```
Detect patterns:
- **Repetition**: Same signal type 3+ times
- **Evolution**: Signal type changes over time (frustration → success)
- **Preferences**: Consistent request signals across sessions
- **Workflow habits**: Recurring tool chains or sequences
- **Problem areas**: Clustered frustration signals
```

**Pattern confidence**:
- **Strong**: 5+ consistent signals across multiple sessions
- **Moderate**: 3-4 signals with some variation
- **Weak**: 2 signals or contradictory evidence

**Phase transition**: After categorization is complete, mark "Categorize Elements" as `completed` and create "Synthesize Report" as `in_progress`.

### Step 5: Structured Output

Generate JSON with signals, patterns, and actionable summary.

See **Output Format** section below for schema and examples.

**Phase transition**: After output is delivered, mark "Synthesize Report" as `completed`.

## Output Format

Return analysis as structured JSON:

```json
{
  "analysis": {
    "scope": {
      "message_count": 25,
      "date_range": "2025-11-20 to 2025-11-28",
      "actors": ["user", "agent"]
    },
    "signals": [
      {
        "type": "success",
        "subtype": "explicit_praise",
        "message_id": "msg_123",
        "timestamp": "2025-11-28T10:30:00Z",
        "quote": "Perfect! This is exactly what I needed",
        "confidence": "high",
        "context": "User response to agent's TypeScript refactor"
      },
      {
        "type": "frustration",
        "subtype": "repetition",
        "message_id": "msg_118",
        "timestamp": "2025-11-28T09:15:00Z",
        "quote": "Again, please use Bun not npm",
        "confidence": "high",
        "context": "Third time user corrected package manager choice"
      },
      {
        "type": "request",
        "subtype": "requirement",
        "message_id": "msg_115",
        "timestamp": "2025-11-28T08:45:00Z",
        "quote": "Always run tests before committing",
        "confidence": "high",
        "context": "User establishing workflow requirement"
      },
      {
        "type": "workflow",
        "subtype": "tool_chain",
        "message_id": "msg_120",
        "timestamp": "2025-11-28T09:45:00Z",
        "quote": "Read the file, edit it, then run the tests",
        "confidence": "medium",
        "context": "User describing preferred edit workflow"
      }
    ],
    "patterns": [
      {
        "pattern_type": "repetition",
        "category": "frustration",
        "description": "User repeatedly corrected package manager choice (npm → Bun)",
        "occurrences": 3,
        "confidence": "strong",
        "first_seen": "2025-11-28T08:00:00Z",
        "last_seen": "2025-11-28T09:15:00Z",
        "recommendation": "Add 'Always use Bun for package management' to project memory"
      },
      {
        "pattern_type": "preference",
        "category": "workflow",
        "description": "User prefers Read → Edit → Test sequence for code changes",
        "occurrences": 5,
        "confidence": "strong",
        "first_seen": "2025-11-27T14:00:00Z",
        "last_seen": "2025-11-28T09:45:00Z",
        "recommendation": "Internalize as standard workflow for file modifications"
      },
      {
        "pattern_type": "evolution",
        "category": "success",
        "description": "User satisfaction increased after agent started using TanStack Router",
        "occurrences": 4,
        "confidence": "moderate",
        "first_seen": "2025-11-28T10:00:00Z",
        "last_seen": "2025-11-28T10:30:00Z",
        "recommendation": "Continue using TanStack Router for frontend routing tasks"
      }
    ],
    "summary": {
      "total_signals": 12,
      "by_type": {
        "success": 4,
        "frustration": 3,
        "workflow": 3,
        "request": 2
      },
      "key_insights": [
        "User has strong preference for Bun over npm (repeated corrections)",
        "Standard workflow pattern: Read → Edit → Test",
        "High satisfaction with TanStack Router adoption",
        "Requirement to always run tests before commits"
      ],
      "action_items": [
        "Update project memory: Use Bun for all package operations",
        "Internalize Read → Edit → Test as default workflow",
        "Add pre-commit hook requirement to project guidelines"
      ]
    }
  }
}
```

## Best Practices

### Accuracy Over Quantity

Extract only clear, unambiguous signals. Avoid over-interpreting neutral language.

```
Good: User said "Don't use any types" → Prohibition signal (high confidence)
Bad: User said "That works" → Success signal (low confidence, could be lukewarm)
```

### Context Matters

Consider surrounding messages when classifying signals.

```
Message: "Try again"
- After agent error: Frustration signal
- After user provides new info: Workflow signal (iteration)
```

### Recency Weighting

Recent signals override contradictory older signals.

```
Pattern evolution:
- Day 1: "Use npm" (request)
- Day 3: "Actually, use Bun instead" (correction + new request)
Result: Current preference is Bun, not npm
```

### Evidence Required

Patterns require 2+ supporting signals. Single occurrences are not patterns.

```
Insufficient: User said "Use TypeScript" once → Not a pattern
Sufficient: User requested TypeScript in 3 different tasks → Preference pattern
```

### Signal Confidence

Mark confidence level for every signal to support downstream filtering.

```
High: Exact match to signal type with no ambiguity
Medium: Implicit signal or requires context to interpret
Low: Ambiguous language, could be multiple signal types
```

## Critical Rules

**ALWAYS:**
* Create "Parse Input" todo at session start
* Update todos at phase transitions (scope validated, signals extracted, categorization complete)
* Mark "Synthesize Report" as `completed` after delivering output
* Include confidence levels for all extracted signals
* Support pattern claims with 2+ supporting signals

**NEVER:**
* Skip phase transitions - always update todos when moving between steps
* Deliver output without marking final phase complete
* Extract low-confidence signals without marking them as such
* Claim patterns from single occurrences
* Regress phases - phases only advance, never go backward

## Integration

This skill is automatically loaded by the `pattern-analyzer` agent when analyzing conversations. It can also be invoked directly:

```
User: "Analyze our last 20 messages for frustration signals"
Agent: *loads conversation-analysis skill*
Agent: *extracts signals, detects patterns, generates JSON*
```

### Integration Points

- **Memory updates**: Patterns → project memory entries
- **Workflow optimization**: Tool chain patterns → workflow templates
- **Quality improvement**: Frustration clusters → areas for agent improvement
- **Preference learning**: Request signals → user preference database

## Works Well With

| Skill/Component | Integration Pattern |
|-----------------|---------------------|
| **workflow-patterns** | Chain: conversation-analysis extracts signals → workflow-patterns classifies and maps to components |
| **pattern-analyzer agent** | Loaded by agent to provide signal detection methodology |
| **jam** | Use jam to refine ambiguous patterns before componentization |
| **validate-claude-skill** | After creating skills from patterns, validate against best practices |

## When to Go Deeper

**Need more nuanced detection?** See [Signal Patterns](references/signal-patterns.md) for disambiguation rules, edge cases, and confidence scoring rubrics.

**Building extraction tools?** See [Extraction Techniques](references/extraction-techniques.md) for regex patterns, heuristics, and algorithm implementations.

**Learning by example?** See [Sample Analysis](examples/sample-analysis.md) for a complete worked walkthrough with explanations.

## Additional Resources

- **Signal Patterns**: `references/signal-patterns.md` — Extended taxonomy with edge cases
- **Extraction Techniques**: `references/extraction-techniques.md` — Regex patterns and heuristics
- **Sample Analysis**: `examples/sample-analysis.md` — Complete worked example
