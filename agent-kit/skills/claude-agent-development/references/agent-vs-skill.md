# Agent vs Skill

Critical distinction—agents and skills serve different purposes.

## Comparison

| Aspect | Agents | Skills |
|--------|--------|--------|
| **Location** | `agents/*.md` | `skills/*/SKILL.md` |
| **Structure** | Single markdown file | Directory with resources |
| **Invocation** | Explicit via Task tool | Automatic via context |
| **Parameter** | `subagent_type` in Task | N/A |
| **Scope** | Narrow, specialized | Broad capability |
| **Trigger** | "Use X agent to..." | Automatic on keywords |
| **Context** | Separate conversation | Main conversation |

## When to Use Agents

- Specialized expertise for specific task types
- Task requires separate context/conversation thread
- Compartmentalized work (security review, testing)
- Narrow specialization that shouldn't pollute main context
- Clear handoff between roles (review → implement → test)

## When to Use Skills

- Capabilities available throughout conversation
- Expertise applies to many task types
- Claude autonomously decides when to use it
- Capability is a tool/technique, not a role
- Resources (scripts, templates) need bundling

## Combined Usage

Use both together for layered capability:

```
# Skill: code-review (capability)
skills/code-review/SKILL.md
- Provides review techniques
- Available in all conversations
- Claude uses when reviewing

# Agent: security-reviewer (specialized role)
agents/security-reviewer.md
- Uses review techniques from skill
- Focused exclusively on security
- Invoked for security-specific reviews
```

## Quick Decision

```
Need specialized expertise for one task type?  → Agent
Need capability across many task types?        → Skill
Need both focused role AND broad technique?    → Both
```
