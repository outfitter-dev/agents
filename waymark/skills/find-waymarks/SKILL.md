---
name: Find Waymarks
description: Search for waymarks (structured code annotations marked with `:::`) in the codebase using the `wm` CLI tool. Use when the user asks to find TODOs, search waymarks, locate code annotations, find work items, check for @agent tasks, or mentions waymarks, the `:::` sigil, work-in-progress markers (^), starred items (*), or code navigation. Supports filtering by type (todo/fix/note/tldr), tags (#perf, #security), mentions (@agent, @alice), and signals (raised/starred).
allowed-tools:
  - Bash
  - Read
  - Grep
---

# Find Waymarks

Search for waymarks in the codebase using the `wm` CLI tool.

## Description

This skill provides an interface to search for waymarks (structured code annotations) in the repository using the installed `wm` command-line tool. Waymarks use the `:::` sigil to mark important code locations with metadata like type, tags, mentions, and properties.

## Usage

When invoked, this skill will:
1. Ask what you want to search for (or accept search criteria directly)
2. Run the appropriate `wm` command with filters
3. Display the results in a readable format

## Examples

**Find all TODOs:**
```bash
wm --type todo --json
```

**Find waymarks mentioning a specific person:**
```bash
wm --mention @alice --json
```

**Find waymarks with specific tags:**
```bash
wm --tag perf --json
```

**Find raised (work-in-progress) waymarks:**
```bash
wm --raised --json
```

**Find starred (high-priority) waymarks:**
```bash
wm --starred --json
```

**Combine filters:**
```bash
wm --type todo --mention @agent --tag security --json
```

## Available Filters

- `--type <marker>`: Filter by waymark type (todo, fix, note, tldr, this, etc.)
- `--mention <actor>`: Filter by mentions (@alice, @agent, etc.)
- `--tag <tag>`: Filter by hashtags (#perf, #security, etc.)
- `--raised`: Show only raised (^) waymarks (work-in-progress)
- `--starred`: Show only starred (*) waymarks (high-priority)
- `--json`: Output as JSON for parsing
- `--jsonl`: Output as JSON Lines
- `--pretty`: Pretty-printed JSON

## Commands

### Search for waymarks
Ask the user what they want to find, then construct and run the appropriate `wm` command.

Common patterns:
- "Find all TODOs" → `wm --type todo --json`
- "Find work for @agent" → `wm --mention @agent --json`
- "Find security issues" → `wm --tag security --json`
- "Find high priority items" → `wm --starred --json`
- "Find work in progress" → `wm --raised --json`

### Show waymark map
Display a tree view of files with their TLDR summaries:
```bash
wm --map
```

### Show dependency graph
Display relationship graph between waymarks:
```bash
wm --graph --json
```

## Tips

1. Always use `--json` for programmatic parsing
2. Combine filters to narrow results (e.g., `--type todo --mention @agent`)
3. Use `--map` to get a quick overview of the codebase
4. Check for raised waymarks (`--raised`) before merging to ensure work-in-progress is cleared
5. Use `--starred` to find high-priority items that need attention

## Implementation

### Prerequisites
Verify `wm` CLI is installed:
```bash
which wm
# Should output: /usr/local/bin/wm or similar
```

If not installed, see project installation docs.

### Execution
When invoked, execute bash commands using the `wm` CLI tool.

## Waymark Syntax Reference

Waymarks use a special syntax starting with `:::`:

```
::: todo This needs to be done #priority @agent
::: fix^ Bug that needs immediate attention
::: note* Important information to remember
::: tldr Summary of what this file does
```

**Markers:**
- `todo` - Task to complete
- `fix` - Bug to fix
- `note` - Important note
- `tldr` - File/section summary
- `this` - Reference to current context

**Signals:**
- `^` (raised) - Work in progress
- `*` (starred) - High priority

**Metadata:**
- `#tag` - Categorization tags
- `@mention` - Person or agent assignment
