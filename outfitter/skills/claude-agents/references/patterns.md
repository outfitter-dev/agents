# Agent Patterns & Best Practices

Design patterns and quality guidelines.

## Best Practices

### Single Responsibility

```yaml
# ✅ Focused
description: SQL injection vulnerability detector

# ❌ Too broad
description: Security expert for all issues
```

**Why:** Easier to invoke correctly and maintain.

### Clear Boundaries

```markdown
## Scope

**I handle:**
- ✅ Security vulnerability detection
- ✅ Secure coding recommendations

**I don't handle:**
- ❌ Implementation of fixes
- ❌ Performance optimization
```

**Why:** Prevents confusion, improves invocation accuracy.

### Consistent Output

```markdown
## Output Format

**For each finding:**
- Severity: critical|high|medium|low
- Location: file:line
- Description: What's vulnerable
- Remediation: How to fix
```

**Why:** Predictable, parseable results.

### Safety First

```markdown
## Safety Protocol

Before modifying production:
1. ✅ Backup verified
2. ✅ Tested in staging
3. ✅ Rollback plan ready
4. ⚠️ Get explicit approval
```

**Why:** Prevents accidents and data loss.

### Document Examples

```markdown
## Example Tasks

**Good:**
- "Review auth.service.ts for security issues"
- "Check JWT implementation"

**Not ideal:**
- "Review everything" (too broad)
- "Fix bugs" (not my role)
```

**Why:** Helps users work effectively with agent.

## Multi-Agent Patterns

### Sequential Processing

```
User: "Prepare this code for production"

1. Security Agent → Issues found
2. Fixer Agent → Code updated
3. Test Agent → Tests created
4. Quality Agent → Approved
```

**When:** Steps depend on previous results.

### Parallel Review

```
User: "Comprehensive code review"

┌─ Security Agent → Security report
├─ Performance Agent → Performance report
├─ Quality Agent → Quality report
└─ Test Agent → Coverage report

Aggregate → User
```

**When:** Independent reviews, faster results.

### Specialist Consultation

```
Main Claude implementing feature
  ↓
Question about security pattern
  ↓
Task(security-expert, "Best pattern for X?")
  ↓
Answer received
  ↓
Continue implementation
```

**When:** Need expert input mid-task.

### Iterative Refinement

```
1. Implementation Agent → Creates initial
2. Review Agent → Finds issues
3. Implementation Agent → Fixes
4. Review Agent → Verifies
5. Repeat until approved
```

**When:** High-quality requirements.

## Anti-Patterns

### Over-Restriction

```yaml
# ❌ Unnecessary restriction
tools: Read  # Can't even search!

# ✅ Appropriate baseline
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

### Vague Description

```yaml
# ❌ Hard to invoke
description: Helps with code stuff

# ✅ Clear triggers
description: |
  SQL injection detector for user input handling.
  Triggers on query security, input validation, parameterization.
```

### Missing Examples

```yaml
# ❌ No examples
description: Security reviewer

# ✅ With examples
description: |
  Security reviewer for authentication code.

  <example>
  user: "Check the login flow"
  assistant: "I'll use security-reviewer agent."
  </example>
```

### Scope Creep

```markdown
# ❌ Does too much
- Reviews code
- Fixes issues
- Writes tests
- Deploys changes
- Monitors production

# ✅ Focused
- Reviews code for security issues
- Reports findings with severity
- Suggests remediation
```
