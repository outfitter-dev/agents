# Performance Considerations

Optimizing agent efficiency and resource usage.

## Cost Factors

- Agent loading time
- Context switching overhead
- Tool invocations
- Model inference

## Optimization Strategies

### Right-Size Models

```yaml
# ❌ Heavyweight for simple task
model: opus
# Task: Format code

# ✅ Appropriate
model: haiku  # or inherit
```

### Focused Descriptions

```yaml
# ❌ Too many triggers (slow matching)
description: Does everything related to code...

# ✅ Focused (fast matching)
description: |
  SQL injection detector. Triggers on
  SQL security, injection detection, query validation.
```

### Minimal Context

```json
// ❌ Too much context
{
  "task": "Review code",
  "context": ["@entire-codebase", "All git history"]
}

// ✅ Focused context
{
  "task": "Review authentication code",
  "context": ["@src/auth/auth.service.ts", "Focus on JWT validation"]
}
```

### Sequential Over Parallel

```
// ❌ Parallel (multiple agent contexts)
- Security agent reviewing
- Performance agent reviewing
- Quality agent reviewing

// ✅ Sequential (one at a time)
1. Security agent → results
2. Performance agent → results
3. Quality agent → results
```

**Why:** Lower memory overhead, clearer results.

## Caching

Agents benefit from prompt caching:
- Description and instructions cached
- Repeated invocations faster
- Tool restrictions cached

**Maximize caching:**
- Keep agent instructions stable
- Don't dynamically generate agent content
- Reuse agents frequently

## Tool Philosophy

```yaml
# Default: inherit (don't over-specify)
model: inherit

# If restricting, use baseline + needed extras
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, WebSearch

# Full bash when needed (simpler than Bash(*))
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash
```

## Context Size Guidelines

| Agent Type | Typical Context | Max Recommended |
|------------|-----------------|-----------------|
| Quick review | 1-3 files | 5 files |
| Standard review | 3-10 files | 20 files |
| Deep analysis | Full module | 50 files |
| Research | Varies | Focused queries |

## Latency vs Quality Tradeoffs

| Priority | Model | Context | Use Case |
|----------|-------|---------|----------|
| Speed | haiku | Minimal | Quick checks |
| Balance | sonnet/inherit | Moderate | Standard work |
| Quality | opus | Full | Critical analysis |
