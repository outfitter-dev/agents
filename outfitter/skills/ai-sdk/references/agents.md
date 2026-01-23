# ToolLoopAgent Patterns

Deep dive on v6 agent workflows.

## When to Use ToolLoopAgent

| Use Case | Approach |
|----------|----------|
| Single tool call | `streamText` with tools |
| Multi-step reasoning | `ToolLoopAgent` |
| Autonomous workflows | `ToolLoopAgent` with `stopWhen` |
| Complex orchestration | `ToolLoopAgent` with custom stop conditions |

## Agent Configuration

```typescript
import { ToolLoopAgent, stepCountIs } from 'ai';

const agent = new ToolLoopAgent({
  // Required
  model: 'anthropic/claude-sonnet-4.5',

  // Optional
  instructions: 'You are a research assistant.',
  tools: { search, calculate, summarize },

  // Stop conditions
  stopWhen: stepCountIs(10),
  // Or custom: async ({ steps }) => steps.length >= 10

  // Tool selection
  toolChoice: 'auto', // 'auto' | 'required' | 'none'

  // Token limits
  maxOutputTokens: 4096,
});
```

## Execution Patterns

### Non-Streaming (Simple)

```typescript
const result = await agent.generate({
  prompt: 'Research quantum computing breakthroughs.',
});

console.log(result.text);
console.log(result.steps); // Array of all steps
console.log(result.steps.length, 'steps executed');
```

### Streaming (Real-time)

```typescript
const stream = agent.stream({
  prompt: 'Analyze this data and provide insights.',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
```

### UI Streaming (React/Next.js)

```typescript
import { createAgentUIStream } from 'ai';

const stream = await createAgentUIStream({
  agent,
  messages: [{ role: 'user', content: 'What is the weather?' }],
  abortSignal: controller.signal,
});

for await (const chunk of stream) {
  // Yield to client
}
```

## Stop Conditions

### Built-in: Step Count

```typescript
import { stepCountIs } from 'ai';

stopWhen: stepCountIs(5) // Stop after 5 steps
```

### Custom: Finish Reason

```typescript
stopWhen: async ({ steps }) =>
  steps.at(-1)?.finishReason === 'stop'
```

### Custom: Combined

```typescript
stopWhen: async ({ steps }) =>
  steps.length >= 10 || steps.at(-1)?.finishReason === 'stop'
```

## Tool Choice Control

```typescript
const agent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  tools: { search, calculate },

  // Force tool use every step
  toolChoice: 'required',

  // Disable tools (text only)
  toolChoice: 'none',

  // Let model decide (default)
  toolChoice: 'auto',
});
```

## Agent with Constraints

```typescript
const customerSupportAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  instructions: `You are a customer support specialist.

Rules:
- Never promise refunds without checking policy
- Always be empathetic and professional
- If unsure, offer to escalate
- Keep responses concise
- Never share internal company information`,
  tools: {
    checkOrderStatus,
    lookupPolicy,
    createTicket,
  },
});
```

## Accessing Step History

```typescript
const result = await agent.generate({ prompt: '...' });

for (const step of result.steps) {
  if (step.type === 'tool-call') {
    console.log(`Called ${step.tool} with`, step.input);
  } else if (step.type === 'text-generation') {
    console.log('Generated:', step.output);
  }
}
```

## Error Handling

```typescript
try {
  const result = await agent.generate({ prompt: '...' });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Agent execution aborted');
  } else {
    console.error('Agent error:', error);
  }
}
```

## Best Practices

**DO:**
- Set reasonable `stopWhen` limits
- Use typed tool schemas with Zod
- Handle abort signals for long-running agents
- Log step history for debugging

**DON'T:**
- Leave agents unbounded (no stop condition)
- Use synchronous blocking operations in tools
- Ignore error states
- Skip tool validation
