# Detection Script Implementation

The detection script identifies available CLI tools on the system.

## Purpose

Before recommending specific tools, check what's actually installed. Prevents suggesting unavailable tools and enables graceful fallback.

## Location

```
outfitter/skills/which-tool/scripts/index.ts
```

## Expected Output Format

```json
{
  "available": {
    "find_files": ["fd", "find"],
    "search_content": ["rg", "grep"],
    "ast_search": ["sg"],
    "process_json": ["jq"],
    "view_file": ["bat", "cat"],
    "list_dir": ["eza", "ls"],
    "git_diff": ["delta", "git"],
    "navigate": ["zoxide", "cd"],
    "fuzzy_select": ["fzf"],
    "http": ["httpie", "curl"]
  },
  "missing": ["sg", "delta", "zoxide"],
  "system": {
    "os": "darwin",
    "platform": "arm64",
    "package_managers": ["brew"]
  }
}
```

## Implementation Details

The script should:

1. **Check tool availability** using `which` or `command -v`
2. **Categorize by task type** (find_files, search_content, etc.)
3. **Detect package managers** for installation suggestions
4. **Return structured JSON** for easy parsing

Example detection check:

```typescript
async function checkTool(name: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(['which', name], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const exitCode = await proc.exited;
    return exitCode === 0;
  } catch {
    return false;
  }
}
```

## Usage in Skill

```bash
# Run detection
bun /Users/mg/Developer/outfitter/agents/outfitter/skills/which-tool/scripts/index.ts

# Parse results
DETECTION_RESULTS=$(bun /path/to/script)
```

Agent parses JSON to determine:
- Which preferred tools are available
- Which tasks need fallback
- What to suggest installing for significant improvements

## Caching Strategy

Run once per session:
- First tool selection → run detection, cache results
- Subsequent selections → use cached results
- Detection refresh → only if tool installation occurs mid-session

## Tools to Check

### Core Tools (check these)

**File operations**:
- fd (preferred) / find (fallback)
- bat (preferred) / cat (fallback)
- eza (preferred) / ls (fallback)

**Search**:
- rg (preferred) / grep (fallback)
- sg (preferred for AST) / rg (fallback)

**Data processing**:
- jq (preferred) / node/python (fallback)

**Version control**:
- delta (preferred) / git diff (fallback)

**Navigation**:
- zoxide (preferred) / cd (fallback)
- fzf (no direct fallback)

**Network**:
- httpie (preferred) / curl (fallback)

### Package Managers (detect for install suggestions)

**macOS**:
- brew (primary)
- port (alternative)

**Linux**:
- apt (Debian/Ubuntu)
- dnf (Fedora/RHEL)
- pacman (Arch)
- zypper (openSUSE)

**Cross-platform**:
- cargo (Rust tools: rg, fd, bat, etc.)
- npm (JavaScript tools)
- pipx (Python tools)

## Error Handling

Script should:
- Never fail/throw — return partial results if some checks fail
- Log warnings for unexpected errors
- Provide empty arrays for unavailable categories
- Always return valid JSON

## Future Enhancements

Potential additions:
- Version checking (some tools require minimum version)
- Performance profiling (measure actual tool speed)
- Configuration detection (is tool already configured?)
- Integration checking (shell aliases, git config)
