---
description: Read recent trail notes
argument-hint: "[handoff|log] [--days N]"
allowed-tools: Bash
---

# Read Trail

Reading recent trail notes.

Arguments: $ARGUMENTS

```bash
!bun ${CLAUDE_PLUGIN_ROOT}/skills/trails/scripts/read.ts $ARGUMENTS --no-frontmatter
```

Use `--type handoff` for handoffs only, `--type log` for logs only.
Use `--days N` to read more history (default: 1 day).
