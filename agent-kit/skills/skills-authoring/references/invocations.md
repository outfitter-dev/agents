# Skills Invocations

How each tool activates and invokes skills.

## Invocation Patterns Overview

| Tool | Pattern | Description |
| ------ | --------- | ------------- |
| Claude Code | Model-invoked | Agent autonomously decides based on request + description |
| Claude (claude.ai) | Auto + Model | Pre-built skills auto-activate; custom skills when relevant |
| GitHub Copilot | Model-invoked | Based on prompt + skill description |
| VS Code (Copilot) | Model-invoked | Auto-activates, follows progressive disclosure |
| OpenAI Codex | Explicit + Implicit | `/skills` command or `$skill` mentions, or model decides |
| Cursor | Model-invoked | Agent determines relevance automatically |
| Amp | Lazy-loaded | On-demand loading when relevant |
| Letta | Tool-based | Agent calls `Skill` tool to load into memory |
| Goose | Model-invoked | Loads skills, accesses files via file tools |
| OpenCode | Tool-based | Skills registered as dynamic tools via plugin |

## Detailed Invocation Methods

### Claude Code

**Type:** Model-invoked (autonomous)

Claude autonomously decides to use skills based on:
- Current request context
- Skill `name` and `description` from frontmatter

**Contrast with slash commands:**
- Skills = model-invoked (agent decides)
- Slash commands = user-invoked (explicit)

---

### Claude (claude.ai)

**Type:** Automatic + Model-invoked

- **Pre-built skills** (document actions): Activate automatically
- **Custom skills**: Load when model determines relevance

---

### GitHub Copilot

**Type:** Model-invoked

Copilot decides activation based on:
- User's prompt content
- Skill `description` field

When activated:
- `SKILL.md` content injected into agent context

---

### VS Code (Copilot)

**Type:** Model-invoked (auto-activation)

- No manual skill selection required
- Follows progressive disclosure pattern
- Model determines when skills are relevant

---

### OpenAI Codex

**Type:** Explicit + Implicit

**Explicit invocation:**
- `/skills` slash command — Opens skill selector
- `$<skill-name>` mention — Reference specific skill in prompt (e.g., `$plan`, `$skill-creator`)

**Implicit invocation:**
- Codex decides based on skill descriptions
- Automatic activation when task matches skill description

**Surface support:**
- CLI and IDE extensions support explicit invocation
- Web and iOS don't support explicit invocation yet (but can prompt Codex to use repo skills)

**Built-in skills:**
- `$plan` — Research and create implementation plans
- `$skill-creator` — Bootstrap new skills
- `$skill-installer` — Download skills from GitHub

---

### Cursor

**Type:** Model-invoked ("agent-decided rules")

- Agent determines relevance automatically
- No manual intervention required
- Skills applied without user selection

**Constraint:** Skills cannot be configured as "always apply" or manually invoked — agent-decided only.

---

### Amp

**Type:** Lazy-loaded

- Skills loaded on-demand when relevant
- Described as "lazy-loaded instructions"
- No explicit invocation required

---

### Letta (Letta Code)

**Type:** Tool-based

**Model invocation:**
- Agent calls the **`Skill` tool** to load skills into memory
- Agent decides when to load based on context
- Skill tool commands: `load`, `unload`, `refresh`

**Explicit invocation:**
- Prompt: "Use the testing skill..." to force specific skill
- `/skill` command: Extract new skill from recent work

**Memory integration (Two Blocks):**
- **`skills` block**: Always visible — list of available skills (names + descriptions)
- **`loaded_skills` block**: Session state — full content of currently loaded skills
- Both blocks are read-only (modified only via Skill tool)

**Alternative access:**
- Can read `.skills/<name>/SKILL.md` directly for one-time preview (without loading)

---

### Goose

**Type:** Model-invoked

- Loads skills when relevant
- Accesses supporting files via file tools
- Treats skills as filesystem resources

---

### OpenCode

**Type:** Tool-based

- `opencode-skills` plugin registers skills as **dynamic tools**
- Skills become tool-like affordances
- Agent invokes skills as it would any other tool

## Invocation Pattern Comparison

### Model-Invoked (Autonomous)

The agent decides when to use skills without explicit user action.

**Pros:**
- Seamless user experience
- Agent can combine skills as needed
- No learning curve for users

**Cons:**
- Less predictable
- May miss relevant skills
- User has less control

**Tools:** Claude Code, Claude, GitHub Copilot, VS Code, Cursor, Amp, Goose

### Explicit Invocation

User directly requests skill usage via commands or mentions.

**Pros:**
- Predictable behavior
- User maintains control
- Clear audit trail

**Cons:**
- Requires user to know available skills
- More friction
- May miss opportunities

**Tools:** OpenAI Codex (`$skill`, `/skills`)

### Tool-Based

Skills are exposed as tools the agent can call programmatically.

**Pros:**
- Fits existing tool-use patterns
- Clear invocation semantics
- Integrates with agent memory

**Cons:**
- Requires tool infrastructure
- More complex implementation

**Tools:** Letta, OpenCode

## Progressive Disclosure in Invocation

Most tools follow a staged loading pattern:

```text
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: Index                                              │
│ Load: name, description                                     │
│ When: Startup / cache refresh                               │
├─────────────────────────────────────────────────────────────┤
│ Stage 2: Activate                                           │
│ Load: Full SKILL.md body                                    │
│ When: Agent decides skill is relevant                       │
├─────────────────────────────────────────────────────────────┤
│ Stage 3: Execute                                            │
│ Load: scripts/, references/, assets/                        │
│ When: Skill instructions reference them                     │
└─────────────────────────────────────────────────────────────┘
```

This minimizes context usage while maintaining full capability access.
