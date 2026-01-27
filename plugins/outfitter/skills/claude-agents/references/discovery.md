# Agent Discovery & Loading

How Claude finds and loads agents.

## Loading Order

1. **Scan directories:**
   - Plugin agents: `<plugin>/agents/*.md`
   - Project agents: `<project>/agents/*.md`
   - Personal agents: `~/.claude/agents/*.md`

2. **Parse frontmatter:**
   - Validate YAML syntax
   - Extract description, tools
   - Build agent registry

3. **Priority resolution:**
   - Personal > Project > Plugin
   - Same name: higher priority wins

## Discovery Process

**How Claude matches agents to requests:**

1. **Parse user intent** — identify task type, extract keywords
2. **Match descriptions** — compare request with agent descriptions
3. **Rank by relevance** — score matches, consider tool requirements
4. **Select best match** — invoke via Task tool

## Naming for Discovery

Good descriptions contain keywords users naturally say:

```yaml
# ✅ Good: Keywords + examples
description: |
  React testing specialist using Jest and React Testing Library.
  Triggers on component testing, Jest test creation, or RTL usage.

  <example>
  Context: User wants to test a React component
  user: "Write tests for the UserProfile component"
  assistant: "I'll use the react-tester agent to create tests."
  </example>

# Keywords: react, testing, jest, react testing library
# Triggers: "test react component", "jest tests", "RTL"

# ❌ Bad: Vague, no examples
description: Testing helper
```

## Trigger Keywords

Include terms users naturally say:

- **Action verbs:** review, check, audit, analyze, test, build, fix
- **Domain terms:** security, performance, auth, API, database
- **Technologies:** GraphQL, JWT, PostgreSQL, React, TypeScript

## Debug Discovery

```bash
# Enable debug mode
claude --debug

# Look for:
# "Loading agent: security-reviewer"
# "Agent match score: X"
# "Invoking agent: security-reviewer"
```

## Reload Agents

```bash
# Changes detected automatically
# Force reload:
/clear

# Or restart Claude Code
```

## Common Issues

**Agent not being invoked:**
- Check file location: `agents/agent-name.md`
- Validate YAML frontmatter syntax
- Make description more specific with trigger keywords
- Add example conversations

**Wrong agent invoked:**
- Make description more distinct
- Add specific trigger keywords
- Include negative examples (what NOT to use it for)
