# Tool Checker Scripts

Checks for modern CLI tools and provides installation guidance.

## Usage

```bash
# Check all tools (text output)
bun scripts/index.ts

# Check specific category
bun scripts/index.ts --category search
bun scripts/index.ts -c viewers

# JSON output
bun scripts/index.ts --format json
bun scripts/index.ts -f json

# Combine options
bun scripts/index.ts -c navigation -f json
```

## Categories

- `search` - fd, ripgrep, ast-grep
- `json` - jq
- `viewers` - bat, eza, delta
- `navigation` - zoxide, fzf
- `http` - httpie

## Output Formats

### Text (default)

```
◆ Available Tools

  search
    ✓ fd 10.2.0 — Fast file finder (replaces find)
    ✓ rg 14.1.0 — Fast code search (replaces grep)
    ✗ sg — AST-aware code search and refactoring
      → brew install ast-grep

◇ Summary: 2/3 tools available
```

### JSON

```json
{
  "search": [
    {
      "name": "fd",
      "command": "fd",
      "category": "search",
      "available": true,
      "version": "fd 10.2.0",
      "replaces": "find",
      "description": "Fast file finder",
      "install": {
        "brew": "brew install fd",
        "cargo": "cargo install fd-find",
        "apt": "apt install fd-find",
        "url": "https://github.com/sharkdp/fd"
      }
    }
  ]
}
```

## Architecture

```
scripts/
├── index.ts              # Entry point - CLI arg parsing and orchestration
├── types.ts              # Shared TypeScript types
├── utils.ts              # Tool detection utilities
└── checkers/
    ├── search.ts         # fd, rg, sg
    ├── json.ts           # jq
    ├── viewers.ts        # bat, eza, delta
    ├── navigation.ts     # z, fzf
    └── http.ts           # http (httpie)
```

Each checker module exports a function that returns `Promise<ToolCheckResult[]>`.

## Adding New Tools

1. Add tool definition to appropriate checker module:

```typescript
{
  name: "tool-name",
  command: "actual-command",
  category: "category",
  replaces: "legacy-tool", // optional
  description: "One-line description",
  install: {
    brew: "brew install tool-name",
    cargo: "cargo install tool-name", // optional
    apt: "apt install tool-name", // optional
    url: "https://github.com/org/repo",
  },
}
```

2. Tool is automatically checked and included in results.

## Adding New Categories

1. Add category to `types.ts`:

```typescript
export type Category = "search" | "json" | "viewers" | "navigation" | "http" | "new-category";
```

2. Create checker module `checkers/new-category.ts`:

```typescript
import type { ToolCheckResult } from "../types.ts";
import { checkTool } from "../utils.ts";

export async function checkNewCategoryTools(): Promise<ToolCheckResult[]> {
  // ... implementation
}
```

3. Import and register in `index.ts`:

```typescript
import { checkNewCategoryTools } from "./checkers/new-category.ts";

const CHECKERS: Record<Category, CheckerFunction> = {
  // ...
  "new-category": checkNewCategoryTools,
};
```
