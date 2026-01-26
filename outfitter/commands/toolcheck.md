---
description: Check available CLI tools and get recommendations
argument-hint: [category: search|json|viewers|navigation|http]
---

# Tool Check

Detect available modern CLI tools and get recommendations for your environment.

## Quick Check

Run the detection script:

```bash
bun outfitter/skills/which-tool/scripts/index.ts
```

Filter by category:

```bash
bun outfitter/skills/which-tool/scripts/index.ts -c search
```

## Context

$ARGUMENTS

---

Load the **which-tool** skill and:

1. Run the tool detection script (with category filter if provided)
2. Report which tools are available vs missing
3. For missing tools, note install commands if user wants them
4. If selecting a tool for a task, use the selection matrix from the skill

Use modern tools when available. Fall back gracefully when not.
