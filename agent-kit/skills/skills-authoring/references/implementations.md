# Skills Implementations

Per-product implementation details for Agent Skills support.

## Claude Products

### Claude Code

The origin of the `.claude/skills` convention.

**Storage Paths:**

| Scope | Path |
| ----- | ---- |
| Personal | `~/.claude/skills/` |
| Project | `.claude/skills/` |
| Plugin | Bundled with installed plugins |

**Precedence:** Not officially documented. Skills are "automatically discovered" from all sources.

**Special Features:**
- `allowed-tools` frontmatter to restrict tool access (Claude Code only, not SDK/API)
- Skills are model-invoked (vs user-invoked slash commands)

**SDK Note:** By default, the SDK does not load skills from filesystem. Must explicitly set `settingSources: ['user', 'project']`.

**Reference:** [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)

---

### Claude (claude.ai)

**Storage:**
- Custom skills uploaded as **zip files** via Settings
- Per-user (not admin-managed)
- Does not sync to API or other surfaces

**Pre-built Skills:**
- Document actions (automatic activation)

**Reference:** [Claude Skills Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

---

### Claude API

**Storage:**
- Pre-built skills referenced by stable IDs (`pptx`, `xlsx`, `docx`, `pdf`)
- Custom skills uploaded via Skills API endpoints
- Stored **org-wide** (separate from claude.ai uploads)

**Integration:**
- Reference `skill_id` in code execution container

**Reference:** [Claude API Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

---

## GitHub Copilot

**Storage Paths:**

| Scope | Path |
| ----- | ---- |
| Primary | `./.github/skills/<skill>/SKILL.md` |
| Compatibility | `./.claude/skills/` |

**Notes:**
- Currently repo-level only
- Org/enterprise-level skills "coming soon"
- `SKILL.md` injected into agent context when used

---

## VS Code (Copilot)

**Storage Paths:**

| Scope | Path |
| ----- | ---- |
| Recommended | `./.github/skills/` |
| Legacy | `./.claude/skills/` |

**Availability:**
- Preview in **VS Code Insiders**
- Enable via `chat.useAgentSkills` setting

**Reference:** [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

---

## OpenAI Codex

**Storage Paths (with precedence, highest overrides lowest):**

| Priority | Scope | Path | Use Case |
| -------- | ----- | ---- | -------- |
| 1 (highest) | Repo (CWD) | `$CWD/.codex/skills` | Skills for specific folder/microservice |
| 2 | Repo (parent) | `$CWD/../.codex/skills` | Shared skills in parent folder |
| 3 | Repo (root) | `$REPO_ROOT/.codex/skills` | Repository-wide skills |
| 4 | User | `$CODEX_HOME/skills` (`~/.codex/skills`) | Personal skills across all repos |
| 5 | Admin | `/etc/codex/skills` | SDK scripts, automation, admin defaults |
| 6 (lowest) | System | Bundled with Codex | Built-in skills (`$plan`, `$skill-creator`) |

**Note:** Skills with the same name are overwritten by higher-precedence scopes.

**Built-in skills:** `$plan`, `$skill-creator`, `$skill-installer`

**Reference:** [Codex Skills](https://developers.openai.com/codex/skills/)

---

## Cursor

**Storage:**
- File-based and repo-trackable
- Can install via GitHub repository links
- Exact default paths not publicly documented

**Availability:**
- Agent Skills only on **Nightly** update channel
- Enable via Settings > Rules > Import Settings > Agent Skills
- Switch channel: Cursor Settings (`Cmd+Shift+J`/`Ctrl+Shift+J`) > Beta > Nightly

**Constraints:**
- Skills are agent-decided only — cannot be configured as "always apply" or manually invoked

**Reference:** [Cursor Skills Docs](https://cursor.com/docs/context/skills)

---

## Amp

**Storage Paths:**

| Scope | Path |
| ----- | ---- |
| Workspace (default) | `.agents/skills/` |
| User-level | `~/.config/amp/skills/` (per manual) |
| User-level (alt) | `~/.config/agents/skills/` (per announcement) |
| Compatibility | `.claude/skills/`, `~/.claude/skills/` |

**Note:** Official docs have conflicting user paths — manual says `~/.config/amp/skills/`, announcement says `~/.config/agents/skills/`.

**Behavior:**
- Skills are lazy-loaded instructions (on-demand)

**Reference:** [Amp Owner's Manual](https://ampcode.com/manual#agent-skills)

---

## Letta (Letta Code)

**Storage Path:**
- Project root: `.skills/`
- Custom location: `letta --skills ~/my-global-skills`
- Each skill is a subdirectory with `SKILL.md`, optional `references/`, `scripts/`, `examples/`, `assets/`

**Internal Persistence (Two Memory Blocks):**
- **`skills` block** (always visible, read-only): List of available skills with names + descriptions
- **`loaded_skills` block** (session, read-only): Full content of currently loaded skills

**Token Optimization:**
- Only loaded skills consume context tokens
- Can have 50 available skills but only 2 loaded

**Special Commands:**
- `/skill` — Extract a new reusable skill from recent work (agent reflects on recent messages)

**Reference:** [Letta Code Skills Docs](https://docs.letta.com/letta-code/skills)

---

## Goose

**Storage Paths (with precedence, highest first):**

| Priority | Path |
| -------- | ---- |
| 1 (highest) | `./.goose/skills/` |
| 2 | `./.claude/skills/` |
| 3 | `~/.config/goose/skills/` |
| 4 (lowest) | `~/.claude/skills/` |

**Compatibility:**
- Explicitly supports "Claude Desktop" skill sharing
- Treats `.claude/skills/` as compatibility layer

---

## OpenCode

**Important:** Skills are NOT native to OpenCode. Requires the third-party **`opencode-skills`** community plugin.

**Installation:**

```json
{
  "plugin": ["opencode-skills"]
}
```

Requires OpenCode SDK ≥ 1.0.126.

**Storage Paths (precedence, highest first):**

| Priority | Scope | Path |
| -------- | ----- | ---- |
| 1 (highest) | Project | `.opencode/skills/` |
| 2 | Custom | `$OPENCODE_CONFIG_DIR/skills/` |
| 3 | Global | `~/.opencode/skills/` |
| 4 (lowest) | XDG | `~/.config/opencode/skills/` |

**Integration:**
- Plugin discovers skills at startup (cached, no hot reload)
- Skills registered as dynamic tools: `skills_{name}` (hyphens → underscores)
- Example: `brand-guidelines/` → `skills_brand_guidelines`

**Operational Notes:**
- Adding/modifying skills requires restarting OpenCode
- Duplicate skill names: project version takes precedence (with warning)

**References:**
- [opencode-skills Plugin](https://github.com/malhashemi/opencode-skills)
- [Superpowers for OpenCode](https://blog.fsck.com/2025/11/24/Superpowers-for-OpenCode/)
