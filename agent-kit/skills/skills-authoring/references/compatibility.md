# Skills Compatibility

This document tracks which tools have adopted the Agent Skills standard and their supported skill paths.

## Adopting Tools

| Tool | Vendor | Status | Notes |
| ------ | -------- | -------- | ------- |
| Claude Code | Anthropic | Stable | Origin of the `.claude/skills` convention |
| Claude (claude.ai) | Anthropic | Stable | Custom skills via zip upload |
| Claude API | Anthropic | Stable | Skills API endpoints |
| GitHub Copilot | GitHub/Microsoft | Stable | Repo-level; org/enterprise coming soon |
| VS Code (Copilot) | Microsoft | Preview | Behind `chat.useAgentSkills` in Insiders |
| OpenAI Codex | OpenAI | Stable | Full precedence hierarchy |
| Cursor | Cursor | Nightly | Agent-decided only (no manual invocation) |
| Amp | Sourcegraph | Stable | Lazy-loaded; conflicting user path docs |
| Letta | Letta | Stable | Two memory blocks (`skills` + `loaded_skills`) |
| Goose | Block | Stable | Explicit Claude compatibility |
| OpenCode | Community | Plugin | Requires `opencode-skills` third-party plugin |

## Path Compatibility Matrix

Which skill paths each tool reads:

| Tool | `.claude/skills/` | `.github/skills/` | Tool-specific path | User-level path |
| ------ | :-----------------: | :-----------------: | :------------------: | :---------------: |
| **Claude Code** | ✅ Primary | — | — | `~/.claude/skills/` |
| **GitHub Copilot** | ✅ Compat | ✅ Primary | — | — |
| **VS Code (Copilot)** | ✅ Legacy | ✅ Primary | — | — |
| **OpenAI Codex** | — | — | `.codex/skills/` | `~/.codex/skills/` |
| **Cursor** | — | — | (not documented) | — |
| **Amp** | ✅ Compat | — | `.agents/skills/` | `~/.config/amp/skills/` ⚠️ |
| **Letta** | — | — | `.skills/` | (via `--skills` flag) |
| **Goose** | ✅ Compat | — | `.goose/skills/` | `~/.config/goose/skills/` |
| **OpenCode** | — | — | `.opencode/skills/` | `~/.opencode/skills/` |

⚠️ Amp has conflicting docs: manual says `~/.config/amp/skills/`, announcement says `~/.config/agents/skills/`

**Legend:**
- ✅ Primary = Recommended/default path
- ✅ Compat = Supported for compatibility
- ✅ Legacy = Supported but deprecated
- — = Not supported

## Interoperability Patterns

### The `.claude/skills` Bridge

The `.claude/skills` convention originated with Anthropic's Claude Code and has become a de facto compatibility layer:

- **GitHub, VS Code, Amp, Goose** all read `.claude/skills` for backward compatibility
- This makes `.claude/skills` the most portable choice for cross-tool skills

### The `.github/skills` Convention

GitHub/Microsoft are pushing `.github/skills` as the repo-native convention:

- Primary for GitHub Copilot and VS Code Copilot
- Still supports `.claude/skills` as legacy fallback

### Tool-Specific Conventions

Other ecosystems maintain their own scoped conventions while often reading `.claude/skills`:

| Convention | Tools |
| ------------ | ------- |
| `.codex/skills` | OpenAI Codex |
| `.agents/skills` | Amp |
| `.skills` | Letta |
| `.goose/skills` | Goose |
| `.opencode/skills` | OpenCode |

## Choosing a Path Convention

| Goal | Recommended Path |
| ------ | ------------------ |
| Maximum portability | `.claude/skills/` |
| GitHub/VS Code native | `.github/skills/` |
| Tool-specific optimization | Use tool's primary path |
| Multi-tool project | Use both `.claude/skills/` and tool-specific |

## User-Level Skills Paths

For personal skills shared across projects:

| Tool | User Path |
| ------ | ----------- |
| Claude Code | `~/.claude/skills/` |
| OpenAI Codex | `~/.codex/skills/` (via `$CODEX_HOME/skills`) |
| Amp | `~/.config/amp/skills/` (per manual) |
| Goose | `~/.config/goose/skills/` |
| Letta | Custom via `--skills` flag |
| OpenCode* | `~/.opencode/skills/` or `~/.config/opencode/skills/` |

*OpenCode requires the `opencode-skills` third-party plugin.

## Admin/System-Level Skills

Some tools support organization-wide or system-level skills:

| Tool | Admin Path | Notes |
| ------ | ------------ | ------- |
| OpenAI Codex | `/etc/codex/skills` | System-wide |
| Claude API | Org-wide via API | Skills API endpoints |
| GitHub Copilot | — | Org/enterprise coming soon |
