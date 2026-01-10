# SDK Integration Reference

Guide to using slash commands with the Claude Agent SDK.

## Overview

Custom slash commands are fully accessible through the Claude Agent SDK, enabling programmatic invocation and integration into automated workflows.

---

## Discovering Commands

Commands are listed in the system initialization message:

### TypeScript

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Hello",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Available commands:", message.slash_commands);
    // Example: ["/compact", "/clear", "/help", "/review", "/deploy"]
  }
}
```

### Python

```python
import asyncio
from claude_agent_sdk import query

async def main():
    async for message in query(
        prompt="Hello",
        options={"max_turns": 1}
    ):
        if message.type == "system" and message.subtype == "init":
            print("Available commands:", message.slash_commands)

asyncio.run(main())
```

---

## Invoking Commands

Send commands as prompt strings:

### TypeScript

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// Basic invocation
for await (const message of query({
  prompt: "/review",
  options: { maxTurns: 3 }
})) {
  if (message.type === "assistant") {
    console.log("Review:", message.message);
  }
}

// With arguments
for await (const message of query({
  prompt: "/fix-issue 123",
  options: { maxTurns: 5 }
})) {
  if (message.type === "result") {
    console.log("Fixed:", message.result);
  }
}
```

### Python

```python
async def main():
    # Basic invocation
    async for message in query(
        prompt="/review",
        options={"max_turns": 3}
    ):
        if message.type == "assistant":
            print("Review:", message.message)

    # With arguments
    async for message in query(
        prompt="/fix-issue 123",
        options={"max_turns": 5}
    ):
        if message.type == "result":
            print("Fixed:", message.result)
```

---

## Enabling Filesystem Settings

By default, the SDK doesn't read filesystem settings. Enable them explicitly:

### TypeScript

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "/my-custom-command",
  options: {
    maxTurns: 3,
    settingSources: ['user', 'project', 'local']  // Enable filesystem
  }
})) {
  // Process results
}
```

### Python

```python
async for message in query(
    prompt="/my-custom-command",
    options={
        "max_turns": 3,
        "setting_sources": ["user", "project", "local"]
    }
):
    # Process results
```

**Setting Sources**:
- `user` - Personal settings (`~/.claude/`)
- `project` - Project settings (`.claude/`)
- `local` - Local overrides

---

## Built-in Commands

### /compact

Summarize conversation history to reduce context:

```typescript
for await (const message of query({
  prompt: "/compact",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "compact_boundary") {
    console.log("Compacted");
    console.log("Pre-tokens:", message.compact_metadata.pre_tokens);
  }
}
```

### /clear

Start fresh conversation:

```typescript
for await (const message of query({
  prompt: "/clear",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Cleared, new session:", message.session_id);
  }
}
```

---

## Workflow Automation

### Sequential Commands

Chain commands for multi-step workflows:

```typescript
async function developmentWorkflow(featureName: string) {
  // Step 1: Create branch
  for await (const msg of query({
    prompt: `/create-branch ${featureName}`,
    options: { maxTurns: 3 }
  })) {
    // Handle branch creation
  }

  // Step 2: Implement feature
  for await (const msg of query({
    prompt: `/implement ${featureName}`,
    options: { maxTurns: 10 }
  })) {
    // Handle implementation
  }

  // Step 3: Create PR
  for await (const msg of query({
    prompt: "/create-pr",
    options: { maxTurns: 3 }
  })) {
    // Handle PR creation
  }
}
```

### Conditional Execution

Execute commands based on results:

```typescript
async function deployIfTestsPass() {
  let testsPass = false;

  for await (const msg of query({
    prompt: "/run-tests",
    options: { maxTurns: 5 }
  })) {
    if (msg.type === "result" && msg.result.includes("All tests passed")) {
      testsPass = true;
    }
  }

  if (testsPass) {
    for await (const msg of query({
      prompt: "/deploy staging",
      options: { maxTurns: 5 }
    })) {
      // Handle deployment
    }
  }
}
```

---

## Error Handling

### Command Not Found

```typescript
for await (const msg of query({
  prompt: "/nonexistent-command",
  options: { maxTurns: 1 }
})) {
  if (msg.type === "error") {
    console.error("Command error:", msg.error);
  }
}
```

### Timeout Handling

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 60000);

try {
  for await (const msg of query({
    prompt: "/long-running-command",
    options: { maxTurns: 10 },
    signal: controller.signal
  })) {
    // Process messages
  }
} finally {
  clearTimeout(timeout);
}
```

---

## SlashCommand Tool

Claude can programmatically invoke commands via the SlashCommand tool:

### Enabling

Commands with `description` are automatically available to the SlashCommand tool.

### Disabling

Prevent automatic invocation:

```yaml
---
description: Interactive deployment (manual only)
disable-model-invocation: true
---
```

### Character Budget

Control how many command descriptions fit in context:

```bash
export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000  # Default: 15000
```

---

## Integration Patterns

### CI/CD Pipeline

```typescript
// GitHub Actions integration
async function runCodeQuality() {
  const results = [];

  for await (const msg of query({
    prompt: "/lint && /test && /security-check",
    options: { maxTurns: 10 }
  })) {
    if (msg.type === "result") {
      results.push(msg.result);
    }
  }

  return results;
}
```

### Chatbot Integration

```typescript
// Slack/Discord bot
async function handleUserCommand(userMessage: string) {
  if (userMessage.startsWith("/")) {
    for await (const msg of query({
      prompt: userMessage,
      options: { maxTurns: 5 }
    })) {
      if (msg.type === "assistant") {
        await sendToChannel(msg.message);
      }
    }
  }
}
```

### Batch Processing

```typescript
// Process multiple items
async function batchReview(files: string[]) {
  for (const file of files) {
    for await (const msg of query({
      prompt: `/review-file ${file}`,
      options: { maxTurns: 3 }
    })) {
      if (msg.type === "result") {
        await saveReview(file, msg.result);
      }
    }
  }
}
```

---

## Best Practices

### 1. Enable Settings Explicitly

Always specify which settings to load:

```typescript
options: {
  settingSources: ['user', 'project', 'local']
}
```

### 2. Handle All Message Types

Check for various response types:

```typescript
for await (const msg of query({ prompt: "/command" })) {
  switch (msg.type) {
    case "assistant":
      // Claude's response
      break;
    case "result":
      // Command result
      break;
    case "error":
      // Error occurred
      break;
    case "system":
      // System message
      break;
  }
}
```

### 3. Set Appropriate Timeouts

Long-running commands need timeout handling:

```typescript
options: {
  maxTurns: 10,
  timeout: 120000  // 2 minutes
}
```

### 4. Use maxTurns Appropriately

Simple commands need fewer turns:

```typescript
// Simple lookup
options: { maxTurns: 1 }

// Standard operation
options: { maxTurns: 3 }

// Complex workflow
options: { maxTurns: 10 }
```

---

## Resources

- [Claude Agent SDK Documentation](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Python SDK Reference](https://platform.claude.com/docs/en/agent-sdk/python)
