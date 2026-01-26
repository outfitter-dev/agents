# Task Tool Integration

How agents are invoked and orchestrated via the Task tool.

## Basic Invocation

From main conversation, Claude uses Task tool:

```json
{
  "description": "Security review of auth code",
  "prompt": "Review authentication code for security vulnerabilities",
  "subagent_type": "security-reviewer"
}
```

## Parameters

| Parameter | Required | Purpose |
|-----------|----------|---------|
| `description` | Yes | Short summary (3-5 words) of what agent will do |
| `prompt` | Yes | Detailed instructions for the agent |
| `subagent_type` | Yes | Agent identifier (see naming below) |
| `resume` | No | Agent ID to resume a previous conversation |
| `model` | No | Override model for this invocation |
| `run_in_background` | No | Run agent asynchronously |

## Agent Naming

The `subagent_type` format depends on agent source:

| Source | Format | Example |
|--------|--------|---------|
| Built-in | `name` | `Explore`, `Plan`, `general-purpose` |
| Same plugin | `name` | `security-reviewer` (file: `agents/security-reviewer.md`) |
| Other plugin | `plugin:name` | `outfitter:reviewer`, `outfitter:quartermaster` |

**Note**: Examples in this file use short names assuming agents are in the same plugin. When invoking plugin agents from outside, use the `plugin:name` format.

## Invocation Examples

**Basic:**

```json
{
  "description": "Review auth code",
  "prompt": "Review this authentication code for security issues",
  "subagent_type": "security-reviewer"
}
```

**Detailed prompt:**

```json
{
  "description": "Generate auth tests",
  "prompt": "Generate unit tests for the authentication service in src/auth/. Target 90% coverage. Focus on edge cases and error handling. Use existing patterns from tests/.",
  "subagent_type": "testing-specialist"
}
```

**With previous context:**

```json
{
  "description": "Fix security issues",
  "prompt": "Fix the security issues found in the previous review: SQL injection in user query, XSS vulnerability in profile page",
  "subagent_type": "security-fixer"
}
```

## Resumable Agents

Agents can be resumed to continue previous conversations:

```json
{
  "description": "Continue analysis",
  "prompt": "Now examine the error handling patterns",
  "subagent_type": "code-analyzer",
  "resume": "abc123"
}
```

**How it works:**
- Each agent execution returns a unique `agentId`
- Agent conversation stored in separate transcript
- Use `resume` parameter with the `agentId` to continue
- Agent resumes with full context from previous conversation

**Use cases:**
- Long-running research broken into multiple sessions
- Iterative refinement without losing context
- Multi-step workflows with sequential context

## Background Execution

Run agents asynchronously while continuing other work. Essential for parallel workflows.

### When to Use Background Execution

| Scenario | Background? | Rationale |
|----------|-------------|-----------|
| Independent parallel reviews | Yes | No dependencies, faster completion |
| Sequential pipeline | No | Each step needs previous result |
| Long-running analysis while user waits | Yes | Can work on other tasks meanwhile |
| Quick consultation mid-task | No | Need immediate answer to continue |

### Launching Background Agents

Set `run_in_background: true` in the Task tool call:

```json
{
  "description": "Security review (background)",
  "prompt": "Review authentication code for vulnerabilities",
  "subagent_type": "security-reviewer",
  "run_in_background": true
}
```

The Task tool returns immediately with a `task_id` instead of waiting for completion.

### Retrieving Results with TaskOutput

Use the `TaskOutput` tool to get results from background agents:

```json
{
  "task_id": "abc123",
  "block": true,
  "timeout": 30000
}
```

**Parameters:**

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `task_id` | Required | ID returned when launching background agent |
| `block` | `true` | Wait for completion (`true`) or check status (`false`) |
| `timeout` | `30000` | Max wait time in milliseconds (up to 600000) |

**Blocking mode** (`block: true`): Waits until agent completes or timeout.

**Non-blocking mode** (`block: false`): Returns current status immediately, useful for polling.

### Parallel Execution Pattern

Launch multiple agents in a single message, then collect results:

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Launch all agents in parallel (single message)         │
├─────────────────────────────────────────────────────────────────┤
│ Task(security-reviewer, run_in_background: true) → task_id_1   │
│ Task(performance-analyzer, run_in_background: true) → task_id_2│
│ Task(quality-reviewer, run_in_background: true) → task_id_3    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Collect results (can work on other tasks meanwhile)    │
├─────────────────────────────────────────────────────────────────┤
│ TaskOutput(task_id_1, block: true) → security findings         │
│ TaskOutput(task_id_2, block: true) → performance findings      │
│ TaskOutput(task_id_3, block: true) → quality findings          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Aggregate and synthesize results                       │
└─────────────────────────────────────────────────────────────────┘
```

### Example: Comprehensive Code Review

```json
// Launch three reviewers in parallel (single message with multiple tool calls)
[
  {
    "description": "Security review",
    "prompt": "Review src/auth/ for security vulnerabilities",
    "subagent_type": "security-reviewer",
    "run_in_background": true
  },
  {
    "description": "Performance review",
    "prompt": "Analyze src/auth/ for performance bottlenecks",
    "subagent_type": "performance-analyzer",
    "run_in_background": true
  },
  {
    "description": "Type safety review",
    "prompt": "Check src/auth/ for type safety issues",
    "subagent_type": "type-checker",
    "run_in_background": true
  }
]

// Returns immediately with task IDs:
// task_id_1: "sec-abc123"
// task_id_2: "perf-def456"
// task_id_3: "type-ghi789"

// Later, collect results:
{ "task_id": "sec-abc123", "block": true }
{ "task_id": "perf-def456", "block": true }
{ "task_id": "type-ghi789", "block": true }
```

### Working While Agents Run

With background agents running, the main conversation can:

- Continue other implementation work
- Launch additional agents
- Respond to user questions
- Periodically check status with `block: false`

```json
// Check if agent is done without blocking
{
  "task_id": "abc123",
  "block": false
}
// Returns status: "running" | "completed" | "failed"
```

### Error Handling

Background agents can fail. Handle gracefully:

**Timeout**: If `TaskOutput` times out, the agent is still running. Increase timeout or check again later.

**Agent failure**: TaskOutput returns error details. Decide whether to retry, use fallback, or report to user.

**Lost task ID**: Task IDs are returned when launching. Store them if needed across conversation turns.

### Best Practices

1. **Launch together**: Put all parallel Task calls in a single message for true concurrency
2. **Collect together**: Retrieve results in batch when all are needed
3. **Use timeouts wisely**: Set based on expected agent runtime
4. **Handle failures**: Always plan for agents that fail or timeout
5. **Don't over-parallelize**: 3-5 parallel agents is usually optimal

### When NOT to Use Background

- Agent result needed immediately for next step
- Simple, fast agent calls (overhead not worth it)
- Debugging agent behavior (harder to trace)
- When sequential ordering matters

## Response Flow

```
1. User makes request
   ↓
2. Claude (main) decides agent needed
   ↓
3. Claude uses Task tool with subagent_type
   ↓
4. Agent conversation starts
   ↓
5. Agent completes task
   ↓
6. Results returned to main conversation
   ↓
7. Main Claude incorporates results
   ↓
8. Response to user
```

## Multi-Agent Workflows

### Sequential

```json
// 1. Review
{ "description": "Review code", "prompt": "Review this code for issues", "subagent_type": "code-reviewer" }

// 2. Fix (with review results)
{ "description": "Fix issues", "prompt": "Fix issues: [list from review]", "subagent_type": "code-fixer" }

// 3. Test (after fixes)
{ "description": "Generate tests", "prompt": "Generate tests for the fixed code", "subagent_type": "testing-specialist" }
```

### Parallel

Independent agents run concurrently:

```
┌─ Security Agent → Security report
├─ Performance Agent → Performance report
├─ Quality Agent → Quality report
└─ Test Agent → Coverage report

Main Claude aggregates → User
```

### Specialist Consultation

Mid-implementation expert input:

```
Main Claude implementing
  ↓
Question about security pattern
  ↓
Task(security-expert, "Best pattern for X?")
  ↓
Security agent responds
  ↓
Main Claude continues
```

### Iterative Refinement

```
1. Implementation Agent → creates
2. Review Agent → finds issues
3. Implementation Agent → fixes
4. Review Agent → verifies
5. Repeat until approved
```

## Agent Chaining Patterns

**Pipeline:**

```
Analyzer → Fixer → Tester → Reviewer → User
```

**Hierarchical:**

```
Coordinator
├─ Backend Agent
│  ├─ API Agent
│  └─ Database Agent
└─ Frontend Agent
   ├─ Component Agent
   └─ Styling Agent
```

**Fan-out/Fan-in:**

```
         ┌─ Agent A ─┐
Request ─┼─ Agent B ─┼─ Aggregate → User
         └─ Agent C ─┘
```
