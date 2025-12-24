# Superpowers Subagent Patterns

Analysis of `obra/superpowers` orchestration skills for potential improvements to `baselayer/skills/subagent-coordination`.

**Source**: `~/.claude/plugins/cache/superpowers-marketplace/superpowers/4.0.1/skills/`

## Key Skills Reviewed

### subagent-driven-development

Execution workflow for implementing plans with subagents.

**Core pattern**: Fresh subagent per task + two-stage review (spec then quality)

**Process**:
1. Controller reads plan, extracts all tasks with full text upfront
2. Per task:
   - Dispatch implementer subagent (with full task text, not file reference)
   - Implementer asks questions if needed, then implements + tests + commits + self-reviews
   - Dispatch spec reviewer → verify code matches spec (nothing more, nothing less)
   - Dispatch code quality reviewer → verify implementation is well-built
   - Both reviews loop until approved
3. After all tasks: final code review of entire implementation

**Key insight**: Controller provides context, subagents execute. Don't make subagents read plan files.

### dispatching-parallel-agents

When and how to parallelize subagent work.

**Use when**:
- 3+ independent failures/tasks
- Different root causes or problem domains
- No shared state between investigations
- Each problem understood without context from others

**Don't use when**:
- Failures are related (fix one might fix others)
- Need full system state understanding
- Agents would interfere (editing same files)

**Good prompts are**:
- Focused: One clear problem domain
- Self-contained: All context needed
- Specific about output: What should agent return?

## Comparison: Our Skill vs Superpowers

| Pattern | subagent-coordination | superpowers | Gap |
|---------|----------------------|-------------|-----|
| Routing decisions | ✓ Primary focus | Assumes known | None |
| Prompt templates | ✗ | ✓ Three templates | Could add |
| Two-stage review | ✗ | ✓ Spec → Quality | Could add |
| Parallel dispatch | Brief mention | ✓ Full skill | Could expand |
| Controller role | Implicit | ✓ Explicit | Could clarify |
| Process diagrams | Text-based | ✓ Dot graphs | Could add |
| Red flags | Anti-patterns | ✓ "Never" list | Could enhance |

## Patterns Worth Adopting

### 1. Two-Stage Review

Separate concerns:
- **Spec compliance**: Did we build what was asked? Nothing missing, nothing extra.
- **Code quality**: Is it well-built? Clean, tested, maintainable.

Different mindsets, different reviewers. Spec first, quality second.

### 2. Controller Provides Full Context

Don't make subagents read plan files. Controller:
- Extracts all tasks upfront
- Provides full task text to each subagent
- Includes scene-setting context (where task fits, dependencies)
- Answers questions before subagent starts work

### 3. Fresh Subagent Per Task

Each task gets clean subagent. Prevents:
- Context pollution from previous tasks
- Confusion about what's already done
- State leaking between tasks

### 4. Prompt Templates

Superpowers provides templates for:

**implementer-prompt.md**:
- Task description (full text)
- Context (where it fits)
- "Ask questions before starting"
- Self-review checklist before reporting

**spec-reviewer-prompt.md**:
- What was requested (requirements)
- What implementer claims (report)
- "Do NOT trust the report" — verify by reading code
- Check: missing requirements, extra work, misunderstandings

**code-quality-reviewer-prompt.md**:
- Uses code-review skill template
- Only dispatched after spec compliance passes
- Returns: strengths, issues (critical/important/minor), assessment

### 5. Parallel Dispatch Criteria

**Safe to parallelize**:
- Independent problem domains
- No shared files being edited
- Each agent has complete context
- Results can be integrated without conflicts

**Not safe**:
- Related failures (fix one might fix others)
- Sequential dependencies
- Shared state or resources

## Potential Enhancements

If we want to incorporate these patterns:

1. **references/prompts.md** — Templates for implementer, spec-reviewer, code-quality-reviewer

2. **references/parallel-dispatch.md** — Expand on when/how to parallelize, criteria for independence

3. **Update SKILL.md**:
   - Add two-stage review to workflow patterns
   - Make controller role explicit
   - Add dot diagrams for complex flows
   - Enhance anti-patterns with specific "never" items

4. **Consider**: Should we have a separate `plan-execution` skill (like superpowers' subagent-driven-development) vs our routing-focused `subagent-coordination`? Different purposes.

## Notes

- Superpowers is very process-oriented (how to execute)
- Our skill is more routing-oriented (who handles what)
- Both are valuable, potentially complementary
- Superpowers uses dot/graphviz diagrams for flow visualization
- "Do NOT trust the report" is a strong pattern for spec review
