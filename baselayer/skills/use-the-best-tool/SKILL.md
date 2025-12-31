---
name: Use the Best Tool
version: 1.0.0
description: Detect available CLI tools, select optimal tool for tasks, research alternatives when tools underperform. Use when choosing between CLI tools, tool seems slow or limited, need to search/view/process files, checking available tooling.
triggers:
  - choosing between CLI tools
  - tool seems slow or limited
  - need to search or process files
  - checking available tooling
  - researching alternatives
---

# Use the Best Tool

Select optimal CLI tools → graceful fallback → research when needed.

<when_to_use>

- Choosing which tool for file search, content search, JSON processing
- Tool taking unexpectedly long for task size
- User expresses frustration with current tool
- Task could be done more elegantly
- Need to verify tool availability before recommending

NOT for: tasks where tool choice is predetermined, simple one-line commands

</when_to_use>

<detection>

Run detection script before selecting tools:

```bash
bun /Users/mg/Developer/outfitter/agents/baselayer/skills/use-the-best-tool/scripts/index.ts
```

Parse output to determine:
- Available modern tools
- Missing tools that could enhance workflow
- System context (OS, package managers)

Cache results per session — no need to re-run unless tool availability changes.

</detection>

<selection>

Map task to best available tool:

| Task | Preferred | Fallback | Legacy | Notes |
|------|-----------|----------|--------|-------|
| Find files by name | `fd` | - | `find` | fd: faster, better defaults |
| Search file contents | `rg` | - | `grep` | rg: respects .gitignore, faster |
| AST-aware code search | `sg` | `rg` | `grep` | sg: structure-aware queries |
| Process JSON | `jq` | - | `python`/`node` | jq: domain-specific language |
| View file with syntax | `bat` | - | `cat` | bat: syntax highlighting, git diff |
| List directory | `eza` | - | `ls` | eza: modern output, icons |
| View git diff | `delta` | - | `git diff` | delta: side-by-side, syntax highlighting |
| Navigate directories | `zoxide` | - | `cd` | zoxide: frecency-based jumping |
| Fuzzy select | `fzf` | - | - | fzf: interactive filtering |
| HTTP requests | `httpie` | - | `curl` | httpie: human-friendly syntax |

Selection algorithm:
1. Check detection results for preferred tool
2. If available → use with optimal flags
3. If unavailable → check fallback column
4. If no fallback → use legacy with best-effort flags
5. Note gap if preferred tool would significantly improve workflow

</selection>

<fallback>

When preferred tool unavailable:

**Minor improvement** (preferred 10–30% better):
- Use next best option silently
- Don't interrupt workflow

**Significant improvement** (preferred 2x+ better):
- Use fallback
- Surface suggestion: `◇ Alternative: {TOOL} would be {BENEFIT} — install with {COMMAND}`
- Continue without blocking

**Critical gap** (task extremely tedious with fallback):
- Surface suggestion: `◆ Caution: {TOOL} recommended for this task — {FALLBACK} will be slow/limited`
- Offer choice: install now, proceed anyway, defer task

Never block on missing tools — graceful degradation always.

</fallback>

<research>

Trigger research when:
- Tool taking 3x+ longer than expected for task size
- User explicitly asks for better approach
- Task seems like it should have specialized tool
- Current tool missing critical feature
- New tool category needed (not in selection table)

Research workflow:
1. Search for `{TASK} CLI tool 2025` or `{TASK} CLI tool 2024`
2. Check GitHub trending in relevant category
3. Evaluate candidates:
   - Speed: benchmarks vs existing tools
   - Ergonomics: default behavior, output format
   - Maintenance: last commit, issue response time
   - Install: complexity, dependencies
   - Compatibility: OS support, integration

Present findings:
- Tool name + one-line description
- Key advantages over current approach
- Installation command
- Usage example for current task
- Trade-offs or caveats

If research yields strong candidate → add to selection table for future reference.

</research>

<workflow>

Standard flow:

1. **Receive task** → categorize task type (find files, search content, process data)
2. **Check detection** → run script if not yet run this session
3. **Select tool** → use selection table + detection results
4. **Execute** → run command with optimal flags
5. **Evaluate** → if slow/frustrating → trigger research

Research flow:

1. **Trigger identified** → surface to user with `△ This seems slow — research alternatives?`
2. **User confirms** → web search for modern tools
3. **Evaluate candidates** → speed, ergonomics, maintenance
4. **Present findings** → tool + advantages + install + example
5. **Update knowledge** → add to selection table if strong fit

</workflow>

<examples>

**Scenario: Search for authentication code**

Task: Find all files containing "authentication"
Detection: rg available
Selection: Use `rg` over `grep`

```bash
rg "authentication" --type ts --type js
```

**Scenario: Find config files**

Task: Find all YAML files in project
Detection: fd available
Selection: Use `fd` over `find`

```bash
fd -e yaml -e yml
```

**Scenario: Process API response**

Task: Extract specific fields from JSON
Detection: jq unavailable
Fallback: Use node/python
Suggestion: `◇ Alternative: jq would simplify this — install with brew install jq`

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).field)"
```

</examples>

<rules>

ALWAYS:
- Run detection script before recommending specific tools
- Use selection table to map task to best available tool
- Provide fallback when suggesting tools that might not be installed
- Surface suggestions for significant improvements (2x+ better)
- Trigger research when tool underperforms expectations

NEVER:
- Assume a tool is installed without checking detection results
- Block workflow on missing non-essential tools
- Recommend abandonware or unmaintained tools
- Use legacy tools when modern alternatives are available
- Skip fallback strategy when preferred tool missing

</rules>

<references>

- [tool-catalog.md](references/tool-catalog.md) — comprehensive tool documentation
- [alternatives.md](references/alternatives.md) — how to research new tools
- [detection-script.md](references/detection-script.md) — detection script implementation

</references>
