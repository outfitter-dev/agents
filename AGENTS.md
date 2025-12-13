# Repository Guidelines

## Project Structure & Module Organization
- Root `.claude-plugin/marketplace.json` lists every published plugin; keep it in sync when adding or renaming entries.
- Plugin folders: `baselayer/`, `claude-dev/`, `guardrails/`, `gitbutler/`, `waymark/`. Each holds its own `.claude-plugin/plugin.json` plus `skills/`, `commands/`, and (where needed) `agents/` or `templates/`.
- The TypeScript package with code you can build/test today is `guardrails/` (`src/` for logic, `hooks/` for integrations, `node_modules/` vendored for reproducibility). Tests live beside sources as `*.test.ts`.
- Docs live with their plugin (e.g., `claude-dev/README.md`, `baselayer/README.md`); keep user-facing instructions close to the code that implements them.

## Build, Test, and Development Commands
- Use Bun everywhere. From a plugin directory (e.g., `guardrails/`):
  - `bun install` — restore deps (typically already vendored).
  - `bun run typecheck` — strict `tsc --noEmit` for API correctness.
  - `bun run lint` / `bun run format` — Biome lint/format for style parity.
  - `bun test` — run Bun tests; target files with `bun test src/core/*.test.ts`.
- Local plugin validation: `/plugin marketplace add .` then `/plugin install <plugin>@outfitter` to exercise changes inside Claude Code.

## Coding Style & Naming Conventions
- TypeScript, `type`/`interface` first, prefer named exports; avoid default exports.
- Formatting is Biome-driven (2-space indent, single quotes default); never hand-format—run `bun run format` before pushing.
- Files and commands use `kebab-case`; tests mirror source names with `.test.ts` suffix. Keep schemas and types in `types.ts` and re-export via package entrypoints.

## Testing Guidelines
- Add or update `*.test.ts` next to the code you change; favor fast, deterministic cases over golden snapshots.
- Cover new branches and failure modes (invalid config, missing files, CLI misuse). If you change schema validation, assert both pass and fail paths.
- Run `bun test` plus `bun run typecheck` before submitting; include the command outputs in your PR checklist.

## Commit & Pull Request Guidelines
- Trunk-based: `main` stays releasable; feature branches live <3 days and are opened as PRs immediately with feature flags guarding incomplete work.
- Branch names: `feat/<area>/<slug>` or `fix/<issue-id>`; avoid merge commits—rebase/squash only.
- Use Graphite: start with `gt log`, stage changes, `gt create -m "feat: concise title"`, then `gt submit --no-interactive` to push the stack.
- PRs: concise summary, linked issue if present, tests run (list commands), screenshots or sample CLI output when behavior changes. Lockfiles (`bun.lockb`) are regenerated, not hand-edited.

## Security & Configuration
- Never commit secrets or tokens; prefer `.env` per environment and keep them out of version control.
- Marketplace and plugin JSON are authoritative; validate updates before merging to prevent breaking installs.
