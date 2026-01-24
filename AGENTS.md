# Repository Guidelines

## Project Structure & Module Organization

- Root `.claude-plugin/marketplace.json` lists every published plugin; keep it in sync when adding or renaming entries.
- Plugin folders: `outfitter/`, `but/`, `gt/`, `cli-dev/`. Each holds its own `.claude-plugin/plugin.json` plus `skills/`, `commands/`, and (where needed) `agents/` or `templates/`.
- The TypeScript package with code you can build/test today is `outfitter/` (`scripts/` for utilities, `templates/` for scaffolding). Tests live beside sources as `*.test.ts`.
- Docs live with their plugin (e.g., `outfitter/README.md`, `but/README.md`); keep user-facing instructions close to the code that implements them.

## Build, Test, and Development Commands

Run from a plugin directory (e.g., `outfitter/`). Use Bun everywhere.

| Command | Purpose |
|---------|---------|
| `bun install` | Restore deps (typically vendored) |
| `bun run typecheck` | Strict `tsc --noEmit` for API correctness |
| `bun run lint` | Biome lint check |
| `bun run format` | Biome format |
| `bun test` | Run Bun tests |
| `bun test src/core/*.test.ts` | Target specific test files |

**Local plugin validation:**
```bash
/plugin marketplace add .              # Add local marketplace
/plugin install <plugin>@outfitter     # Install and test plugin
```

## Coding Style & Naming Conventions

| Element | Convention |
|---------|------------|
| Language | TypeScript, strict mode |
| Exports | Named exports only; avoid `default` |
| Types | `type`/`interface` first |
| Files | `kebab-case.ts` |
| Tests | `{source}.test.ts` beside source |
| Schemas | `types.ts`, re-export via entrypoints |

**Formatting**: Biome-driven (2-space indent, single quotes). Run `bun run format` before pushing — never hand-format.

## Testing Guidelines

| Rule | Details |
|------|---------|
| Location | `*.test.ts` next to source |
| Style | Fast, deterministic; avoid golden snapshots |
| Coverage | New branches, failure modes (invalid config, missing files, CLI misuse) |
| Schema changes | Assert both pass and fail paths |
| Pre-submit | Run `bun test` + `bun run typecheck`; include output in PR |

## Commit & Pull Request Guidelines

| Aspect | Convention |
|--------|------------|
| Strategy | Trunk-based; `main` stays releasable |
| Branch lifespan | <3 days; open PRs immediately |
| Branch naming | `feat/<area>/<slug>` or `fix/<issue-id>` |
| Merge strategy | Rebase/squash only; no merge commits |
| Lockfiles | Regenerate `bun.lockb`; never hand-edit |

**Graphite workflow:**
```bash
gt log                                 # View stack
gt create -m "feat: concise title"     # Create branch + commit
gt submit --no-interactive             # Push stack
```

**PR checklist:** Concise summary, linked issue, test output, screenshots for UI/CLI changes.

## Security & Configuration

- Never commit secrets or tokens; prefer `.env` per environment and keep them out of version control.
- Marketplace and plugin JSON are authoritative; validate updates before merging to prevent breaking installs.
