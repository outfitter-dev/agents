# Signal Patterns Reference

Extended taxonomy with edge cases, disambiguation guidance, and confidence scoring rubric.

## Success Signals

### Explicit Praise

**Core indicators**: Positive adjectives, exclamation marks, superlatives.

**Examples**:
- "Perfect!"
- "Exactly what I needed"
- "This is great work"
- "Love it"
- "Well done"

**Edge cases**:
- "Good enough" → Low confidence (lukewarm, not enthusiastic)
- "That works" → Low confidence (neutral acceptance, not praise)
- "Thanks" → Context-dependent (could be courtesy, not satisfaction)

**Confidence criteria**:
- **High**: Superlatives ("perfect", "excellent"), multiple exclamations, enthusiastic tone
- **Medium**: Positive adjectives ("good", "nice") with neutral tone
- **Low**: Minimal positive language, could be polite rather than satisfied

### Continuation

**Core indicators**: Building on previous work, extending scope, applying pattern elsewhere.

**Examples**:
- "Now do the same for the login page"
- "Apply this pattern to all API routes"
- "Great, next let's handle the error cases"

**Edge cases**:
- "Now try X instead" → Frustration (correction) if contradicts prior work
- "Also do Y" → Continuation only if X succeeded; check for corrections first
- "Next, fix the bug in Z" → Context switch, not continuation

**Confidence criteria**:
- **High**: Explicit reference to prior success + request to extend
- **Medium**: Implied satisfaction + new related task
- **Low**: Sequential tasks without confirmation of prior success

### Adoption

**Core indicators**: User implements agent's suggestion without modification or pushback.

**Examples**:
- Agent: "Use TanStack Router" → User: *next message shows TanStack Router implementation*
- Agent: "Refactor to use async/await" → User: "Done, looks cleaner"
- Agent suggests pattern → User's code follows pattern exactly

**Edge cases**:
- User modifies suggestion before implementing → Medium confidence (partial adoption)
- User implements after asking clarifying questions → Still adoption (high confidence)
- User implements weeks later → Weak adoption signal (confounded by time)

**Confidence criteria**:
- **High**: Immediate implementation with no modifications
- **Medium**: Implementation after clarification or with minor adjustments
- **Low**: Implementation significantly delayed or heavily modified

### Completion Acceptance

**Core indicators**: Approval language followed by action (merge, ship, close ticket).

**Examples**:
- "Looks good, merge it"
- "Ship it"
- "Perfect, closing this issue"
- "LGTM" (Looks Good To Me)

**Edge cases**:
- "Looks good, but..." → Conditional acceptance, check for follow-up corrections
- "Merge" without review → Context-dependent (could be trust or urgency, not satisfaction)
- "Ship it" with sarcasm → Rare but check surrounding context for frustration

**Confidence criteria**:
- **High**: Explicit approval + action directive
- **Medium**: Approval without action or action without explicit approval
- **Low**: Ambiguous approval ("fine", "okay") that could indicate resignation

## Frustration Signals

### Correction

**Core indicators**: Negation words, contradiction of agent output, explicit redirection.

**Examples**:
- "No, I meant X not Y"
- "That's wrong, do Z instead"
- "Actually, use A instead of B"

**Edge cases**:
- "Small correction: use X" → Frustration (low confidence) if agent should have known
- "Let's adjust to X" → Not frustration if iterating on shared work
- "Change X to Y" → Context-dependent (correction vs. evolution)

**Confidence criteria**:
- **High**: Explicit negation ("no", "wrong", "don't") + correction
- **Medium**: Implicit correction ("actually", "instead") without harsh language
- **Low**: Neutral adjustment language that could be iteration not correction

### Reversion

**Core indicators**: Request to undo agent's changes, return to previous state.

**Examples**:
- "Revert that change"
- "Go back to the original version"
- "Undo what you just did"
- User manually reverts agent's commit

**Edge cases**:
- "Let's try the original approach" → Could be exploration, not frustration
- Revert after testing both options → Scientific method, not frustration
- Partial revert → Medium confidence (some parts worked, some didn't)

**Confidence criteria**:
- **High**: Explicit revert request with no justification (implies failure)
- **Medium**: Revert with explanation that agent's approach had issues
- **Low**: Revert as part of A/B testing or exploration

### Repetition

**Core indicators**: Same request issued 2+ times with escalating specificity or frustration.

**Examples**:
- Message 1: "Use Bun not npm"
- Message 2: "Again, use Bun"
- Message 3: "I already told you to use Bun!"

**Edge cases**:
- Repetition after context switch → May not be frustration, could be reminder
- Repetition with new information → Evolution, not frustration
- Repetition across different tasks → Preference signal, not frustration

**Confidence criteria**:
- **High**: 3+ repetitions with escalating tone or "again"/"already told you"
- **Medium**: 2 repetitions with no new context
- **Low**: 2 similar requests in different contexts (could be unrelated)

### Explicit Frustration

**Core indicators**: Direct expression of dissatisfaction, questioning agent's behavior.

**Examples**:
- "This isn't working"
- "Why did you do X when I said Y?"
- "I already told you not to..."
- "This is frustrating"

**Edge cases**:
- "Hmm, that's odd" → Confusion, not necessarily frustration
- "Why X?" → Curiosity if neutral tone; frustration if accusatory
- "Not quite" → Gentle correction, low frustration

**Confidence criteria**:
- **High**: Explicit frustration words ("frustrating", "annoying") or accusatory questions
- **Medium**: Implied dissatisfaction ("not working", "this is wrong")
- **Low**: Neutral problem statements without emotional language

## Workflow Signals

### Sequence Markers

**Core indicators**: Ordinal language, numbered lists, temporal connectives.

**Examples**:
- "First, do X. Then Y. Finally Z."
- "Step 1: A, Step 2: B, Step 3: C"
- "Before we start, let's..."

**Edge cases**:
- Single "first" without "second" → Low confidence (could be emphasis, not sequence)
- "Then" without "first" → Continuation, not new sequence
- Numbered list describing features (not steps) → Not workflow signal

**Confidence criteria**:
- **High**: Multiple ordinal markers (first, second, third) or numbered steps
- **Medium**: Single sequence marker with clear temporal relationship
- **Low**: Ambiguous temporal language ("before", "after") without clear sequence

### Stage Transitions

**Core indicators**: Reference to completion + new direction, explicit context shift.

**Examples**:
- "Now that X is done, let's work on Y"
- "Moving on to the API layer"
- "With that complete, next is..."

**Edge cases**:
- "Let's do Y" without completion reference → Context switch, not stage transition
- "After X, do Y" (pre-planning) → Sequence marker, not transition
- "Y is next" → Future reference, not active transition

**Confidence criteria**:
- **High**: Explicit completion reference + new task
- **Medium**: Implied completion + new direction
- **Low**: New task without completion signal (could be interruption)

### Tool Chains

**Core indicators**: Consistent sequence of tool usage across multiple tasks.

**Examples**:
- Pattern: Read → Edit → Bash (test) appears 5+ times
- Pattern: Glob → Grep → Read appears 3+ times for search tasks
- Pattern: Write → Bash (validate) appears 4+ times

**Edge cases**:
- Same tools in different order → Not a chain, separate usage
- Tool chain appears once → Not a pattern yet
- Tool chain broken by user interruption → Still valid if resumes afterward

**Confidence criteria**:
- **High**: 5+ occurrences of same tool sequence
- **Medium**: 3-4 occurrences with occasional variation
- **Low**: 2 occurrences or significant variation in sequence

### Context Switches

**Core indicators**: Abrupt topic change, new file focus, no transition language.

**Examples**:
- Working on auth.ts → Suddenly "Fix the database schema"
- Discussing React components → "Now debug the API"
- Mid-task: "Actually, let's work on something else"

**Edge cases**:
- Switch after completing task → Stage transition, not context switch
- Switch with explanation → Intentional pivot, still a switch but lower friction
- Return to previous context → Resumption, not new switch

**Confidence criteria**:
- **High**: Abrupt change with no transition, different domain
- **Medium**: Change with minimal transition or related domain
- **Low**: Change with explanation or natural task completion

## Request Signals

### Prohibition

**Core indicators**: Negative imperatives, explicit constraints, "don't" statements.

**Examples**:
- "Don't use any types"
- "Never use npm, always use Bun"
- "Avoid using classes"

**Edge cases**:
- "I wouldn't use X" → Preference, not prohibition (softer language)
- "Don't do X unless Y" → Conditional prohibition
- "Try not to X" → Soft prohibition (low confidence)

**Confidence criteria**:
- **High**: Absolute negatives ("never", "don't", "no") with no conditions
- **Medium**: Soft negatives ("avoid", "try not to") or conditional prohibitions
- **Low**: Implicit discouragement without explicit prohibition

### Requirement

**Core indicators**: Absolute language, modal verbs (must, should, always), imperatives.

**Examples**:
- "Always run tests before committing"
- "You must validate input"
- "Make sure to check for errors"

**Edge cases**:
- "It's good to X" → Preference, not requirement
- "Should probably X" → Weak requirement (medium confidence)
- "Try to X" → Suggestion, not requirement

**Confidence criteria**:
- **High**: Absolute modal verbs ("must", "always") or strong imperatives
- **Medium**: Soft modal verbs ("should") or qualified requirements
- **Low**: Suggestions ("could", "might want to") without strong language

### Preference

**Core indicators**: Comparative language, subjective statements, "prefer" / "better" / "rather".

**Examples**:
- "I prefer TypeScript over JavaScript"
- "It's better to use async/await"
- "I'd rather use functional components"

**Edge cases**:
- "I like X" → Weak preference (low confidence)
- "X is better" (stated as fact) → Could be requirement depending on tone
- "Prefer X, but Y works too" → Flexible preference (medium confidence)

**Confidence criteria**:
- **High**: Explicit preference language ("prefer", "I'd rather") with comparison
- **Medium**: Implied preference through evaluation ("better", "cleaner")
- **Low**: Weak positive statements without comparison

### Conditional

**Core indicators**: Logical connectives (if/then, when, unless), situational rules.

**Examples**:
- "If X then Y"
- "When working on auth, always use Z"
- "Unless A, do B"

**Edge cases**:
- "Maybe if X" → Uncertain conditional (low confidence)
- "X or Y depending on Z" → Multiple conditionals, complex rule
- "If X" without "then" → Incomplete conditional, infer consequence from context

**Confidence criteria**:
- **High**: Explicit if/then structure with clear condition and action
- **Medium**: Implied conditional (when, unless) or incomplete structure
- **Low**: Vague conditional ("depending on", "maybe if")

## Disambiguation Guidance

### Success vs. Frustration

**Ambiguous case**: "That works"

- **Success** if: No prior corrections, agent's first attempt, user moves on
- **Frustration** if: After multiple attempts, lukewarm tone, user makes adjustments

**Rule**: Check for prior corrections. If 0-1, success. If 2+, frustration.

### Continuation vs. Correction

**Ambiguous case**: "Now do X for Y too"

- **Continuation** if: X succeeded for original target, Y is similar target
- **Correction** if: X failed for original target, Y is different approach

**Rule**: Verify success of X before classifying as continuation.

### Request vs. Workflow

**Ambiguous case**: "Always run tests before committing"

- **Request (requirement)** if: User establishing new rule
- **Workflow (sequence)** if: User describing existing process

**Rule**: Check if user is prescribing (request) or describing (workflow). Use tense as clue: imperative = request, present tense = workflow.

### Preference vs. Requirement

**Ambiguous case**: "Use TypeScript"

- **Preference** if: Soft language, alternatives mentioned, presented as opinion
- **Requirement** if: Absolute language, no alternatives, presented as rule

**Rule**: Look for qualifiers. "I prefer X" = preference. "Use X" = requirement. "Always use X" = strong requirement.

## Confidence Scoring Rubric

### High Confidence (0.8 - 1.0)

- Explicit signal keywords match taxonomy exactly
- No ambiguity in language or intent
- Context strongly supports classification
- Multiple supporting clues (tone, punctuation, surrounding messages)

**Example**: "Don't use npm, always use Bun" → Prohibition (high confidence)

### Medium Confidence (0.5 - 0.79)

- Implicit signal requiring some interpretation
- Context provides partial support
- Minor ambiguity but best classification is clear
- Single supporting clue or mixed signals

**Example**: "Bun is better here" → Preference (medium confidence)

### Low Confidence (0.2 - 0.49)

- Ambiguous language with multiple possible interpretations
- Weak or contradictory context
- Signal requires significant inference
- Borderline between two signal types

**Example**: "That's fine" → Success? Frustration? (low confidence)

### No Signal (< 0.2)

- Neutral language with no clear signal
- Insufficient context to classify
- Pure information exchange with no behavioral indicator

**Example**: "The file is at /path/to/file" → No signal

## Signal Combinations

Certain signal combinations indicate specific patterns:

### Success → Continuation

Pattern: **Positive Reinforcement Loop**

User satisfied with approach and wants to extend it.

```
Message 1: "Perfect! This works great" (success: explicit praise)
Message 2: "Now apply this to all the other routes" (success: continuation)
```

**Recommendation**: Internalize the successful approach as a pattern to reuse.

### Frustration (repetition) → Success

Pattern: **Learning Curve Overcome**

Agent initially misunderstood but eventually delivered correctly.

```
Message 1: "Use Bun not npm" (frustration: correction)
Message 2: "Again, Bun not npm" (frustration: repetition)
Message 3: "Perfect, that's the right package manager" (success: praise)
```

**Recommendation**: Add the learned requirement to memory to avoid future repetition.

### Request (prohibition) + Frustration (repetition)

Pattern: **Persistent Violation**

Agent repeatedly violates an explicit constraint.

```
Message 1: "Don't use any types" (request: prohibition)
Message 3: "I said no any types" (frustration: repetition + request)
Message 5: "Again, avoid any types" (frustration: repetition + request)
```

**Recommendation**: Escalate to memory update or configuration change. This is a critical user requirement being violated.

### Workflow (tool chain) + Success (adoption)

Pattern: **Workflow Optimization**

User established efficient tool sequence and agent adopted it.

```
Message 1: "Read, then Edit, then run tests" (workflow: sequence)
Message 3: *agent follows sequence* (workflow: tool chain)
Message 5: "Great, you've got the workflow down" (success: praise)
```

**Recommendation**: Codify tool chain as a standard workflow template.

### Context Switch + Frustration (explicit)

Pattern: **Blocked Progress**

User abandons current task due to persistent issues.

```
Message 1: "This isn't working" (frustration: explicit)
Message 2: "Let's work on something else instead" (workflow: context switch)
```

**Recommendation**: Mark the abandoned task for later review. Likely indicates a blocker or knowledge gap.

## Temporal Patterns

### Escalation Pattern

Signal intensity increases over time.

```
T1: "Use Bun" (request: preference)
T2: "Please use Bun, not npm" (request: requirement)
T3: "I already told you to use Bun!" (frustration: repetition + explicit)
```

**Detection**: Same topic, increasing frustration or stronger modal verbs.

**Recommendation**: High-priority memory update. User is emphasizing this requirement.

### De-escalation Pattern

Frustration decreases as issue resolves.

```
T1: "This is broken" (frustration: explicit)
T2: "Getting closer" (neutral)
T3: "Perfect!" (success: praise)
```

**Detection**: Same topic, decreasing frustration and increasing success signals.

**Recommendation**: Identify what changed between T2 and T3. This is the successful approach.

### Cyclical Pattern

Same issue recurs periodically.

```
Day 1: "Use TypeScript" (request)
Day 5: "Remember to use TypeScript" (frustration: repetition)
Day 10: "Again, TypeScript not JavaScript" (frustration: repetition)
```

**Detection**: Same request/correction across multiple sessions with time gaps.

**Recommendation**: Critical memory failure. Agent is not retaining this requirement across sessions.
