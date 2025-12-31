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
| `subagent_type` | Yes | Agent identifier (filename without `.md`) |
| `resume` | No | Agent ID to resume a previous conversation |
| `model` | No | Override model for this invocation |
| `run_in_background` | No | Run agent asynchronously |

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
