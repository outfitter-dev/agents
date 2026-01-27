# Researching Tool Alternatives

Guide for discovering and evaluating modern CLI tools when current tools underperform.

## When to Research

### Performance Triggers

Research alternatives when you observe:

- **Slow execution**: Command takes >5 seconds on typical workload
- **Resource spikes**: High CPU/memory usage for simple operations
- **Blocking behavior**: Tool blocks the terminal for extended periods
- **Scale issues**: Performance degrades significantly with file count or size
- **3x+ slower than expected**: Tool taking much longer than task size suggests

### Ergonomic Triggers

Consider alternatives when:

- **Complex syntax**: Requiring frequent man page lookups for basic operations
- **Poor defaults**: Always passing the same flags to get desired behavior
- **Missing features**: Workarounds needed for common tasks
- **Error messages**: Cryptic or unhelpful output on failure
- **Repeated complex command chains**: Same multi-tool pipeline used frequently

### Maintenance Triggers

Look for replacements when:

- **Unmaintained**: No updates in 2+ years, open issues piling up
- **Deprecated**: Tool documentation marks it as legacy
- **Security issues**: Known vulnerabilities without patches
- **Compatibility**: Broken on modern OS/architecture

### User Signal Triggers

Always research when:

- Explicit request: "Is there a better way to do this?"
- Frustration indicators: "This is taking forever", "Why is this so slow?"
- Performance complaints about specific tool
- User asks about alternatives or modern equivalents

### Context Triggers

Consider research for:

- **New categories**: Task type not in current tool catalog
- **Building automation**: Tool will run frequently, performance matters
- **New environment setup**: Opportunity to establish good defaults
- **Cross-tool integration**: Multiple tools could be replaced by one

## Where to Look

### Primary Sources

#### 1. GitHub Search

**Search patterns**:

```
site:github.com {category} rust OR go language:Rust OR language:Go stars:>1000
site:github.com {category} CLI tool stars:>500
site:github.com modern {legacy-tool} alternative
```

**Examples**:

```
site:github.com file search rust language:Rust stars:>1000
site:github.com grep alternative rust language:Rust stars:>1000
site:github.com modern ls replacement stars:>500
```

**Why GitHub:**
- Active development visible (commit history)
- Star count indicates adoption and community validation
- Issues/PRs show maintenance quality
- README usually has benchmarks and comparisons

#### 2. Curated Lists

**awesome-cli-apps**: <https://github.com/agarrharr/awesome-cli-apps>
- Categorized by function
- Curated for quality
- Regularly updated

**modern-unix**: <https://github.com/ibraheemdev/modern-unix>
- Specifically Unix tool replacements
- Focus on performance and ergonomics
- Comparison with legacy tools

**awesome-tuis**: <https://github.com/rothgar/awesome-tuis>
- Terminal UI applications
- Interactive tools
- Well-maintained list

**Why curated lists:**
- Pre-filtered for quality
- Organized by category
- Community-vetted

#### 3. Language-Specific Ecosystems

**Rust CLI Working Group**:
- <https://rust-cli.github.io/book/>
- <https://lib.rs/command-line-utilities>

**Go CLI Tools**:
- <https://github.com/avelino/awesome-go#command-line>

**Why language ecosystems:**
- Rust tools often fastest (native performance, zero-cost abstractions)
- Go tools good balance (fast, easy distribution, single binary)
- Language communities maintain tool lists

### Secondary Sources

#### Hacker News

**Search patterns**:

```
site:news.ycombinator.com {tool} alternative
site:news.ycombinator.com modern {category} tools
site:news.ycombinator.com CLI productivity
```

**Why HN:**
- Real-world usage discussions
- Trade-off analysis from practitioners
- Early visibility into trending tools
- Critical perspectives, not just hype

#### Reddit Communities

**r/commandline** - Dedicated CLI tool discussions
**r/rust** - Rust-based CLI tools (often performance-focused)
**r/golang** - Go-based tools
**r/programming** - General tool discussions

**Why Reddit:**
- User reviews and experiences
- Comparison threads
- Common pain points surfaced

#### Tool Comparison Sites

**AlternativeTo**: <https://alternativeto.net>
- User ratings
- Feature comparison matrices
- Platform availability

**Why comparison sites:**
- Side-by-side feature lists
- Community ratings
- Discover tools you didn't know existed

### Research Workflow

**Query progression**:
1. `{TASK} CLI tool 2025` or `{TASK} CLI tool 2024`
2. `best {TASK} command line tool`
3. `modern alternative to {LEGACY_TOOL}`
4. `{LANGUAGE} {TASK} CLI` (try rust first, then go)

**Initial filtering**:
- Published/updated within last 2 years
- Active development (commits within 6 months)
- Community traction (GitHub stars >500 for niche, >1000 for common tools)
- Clear documentation and examples
- Available in package managers

## Evaluation Criteria

Evaluate candidates across these dimensions:

### 1. Speed (Weight: High - 40%)

**Measure:**
- Benchmarks on representative workload
- Compare with legacy tool on same task
- Check scaling behavior (10 files vs 10,000 files)
- Startup time (matters for frequently-run commands)

**Thresholds:**
- **2× faster**: Consider if other benefits exist
- **5× faster**: Strong candidate, likely worth adoption
- **10× faster**: High priority upgrade, significant productivity gain

**How to benchmark:**

```bash
# Quick comparison with time
time {old-tool} args
time {new-tool} args

# Statistical benchmark with hyperfine
hyperfine '{old-tool} args' '{new-tool} args'

# Test scaling
hyperfine --parameter-scan num 10 10000 '{tool} args'
```

### 2. Ergonomics (Weight: Medium-High - 30%)

**Evaluate:**
- **Syntax simplicity**: Can you remember it without docs?
- **Defaults**: Do common operations require flags?
- **Output quality**: Readable, informative, well-formatted?
- **Error messages**: Clear, actionable, helpful suggestions?
- **Composability**: Works well in pipes and scripts?

**Good indicators:**
- Colored output by default
- Smart defaults (respects .gitignore, etc.)
- Short, memorable command names
- Built-in help that's actually helpful (`--help` is clear)
- Intuitive flag names

**Red flags:**
- Complex syntax requiring constant reference
- Poor error messages ("error" with no context)
- Unexpected default behavior
- Verbose flags only (no short forms)

### 3. Maintenance (Weight: High - 20%)

**Check repository health:**
- **Last commit**: <6 months is active, <3 months is excellent
- **Issue response time**: Maintainer engagement (check recent issues)
- **Release cadence**: Regular releases, not constant churn
- **Contributor count**: Not single-maintainer ghost projects
- **Organization backing**: Company/org-backed often more stable

**Red flags:**
- Archived repository
- 100+ open issues with no maintainer responses
- Last release >2 years ago
- Single maintainer who's gone MIA
- Major bugs unaddressed

**Green flags:**
- Active CI/CD
- Regular security updates
- Responsive to community
- Clear governance or roadmap

### 4. Installation Complexity (Weight: Medium - 10%)

**Assess ease of installation:**
- Available in major package managers (brew, apt, cargo, dnf)
- Binary releases for major platforms (Linux, macOS, Windows)
- Dependency count (fewer is better)
- Binary size (under 50MB is reasonable for most tools)

**Scoring:**
- **Excellent**: `brew install`, `apt install`, or `cargo install`
- **Good**: Binary releases on GitHub, one-liner install script
- **Acceptable**: Build from source with standard toolchain
- **Poor**: Complex build requirements, many dependencies
- **Deal-breaker**: Requires specific versions of rare dependencies

### 5. Adoption (Weight: Medium - Points to maturity)

**Indicators of healthy adoption:**
- GitHub stars (>1k is good, >5k is excellent, >10k is widely adopted)
- Used by major projects (check GitHub dependents)
- Mentioned in blog posts, tool lists, conference talks
- Active community (Discord, discussions, Stack Overflow questions)
- Production usage stories

**Why adoption matters:**
- More usage → more bugs found and fixed
- Better documentation and examples
- Higher probability of long-term maintenance
- Easier to find help when stuck

### 6. Compatibility (Weight: Medium-Low - Important for drop-in replacements)

**Check replacement viability:**
- **Drop-in replacement**: Can alias old command to new? (`alias cat=bat`)
- **POSIX compliance**: Matters for portable scripts
- **Output format**: Parseable by downstream tools?
- **Configuration**: Reads old tool's config files?
- **Flags**: Similar enough for muscle memory transfer?

**Examples:**

```bash
# Safe drop-in replacements
alias cat=bat       # Generally yes (bat mimics cat behavior)
alias ls=eza        # Yes (eza designed as ls replacement)
alias grep=rg       # Mostly (different flags, but core usage similar)

# Risky drop-ins
alias sed=sd        # No (sd is simpler, not full sed replacement)
alias awk=...       # No good modern replacement (awk is unique)
```

## Testing Workflow

### Stage 1: Quick Evaluation (5 minutes)

**Install in isolated way:**

```bash
# Prefer cargo for isolated testing (doesn't require sudo)
cargo install {tool}

# Or homebrew
brew install {tool}
```

**Basic functionality check:**

```bash
# Check help output
{tool} --help

# Test basic operation
{tool} {simple-task}

# Quick benchmark
hyperfine '{old-tool} args' '{new-tool} args'
```

**Decision point:** If not obviously better (2×+ speed or significantly better UX), stop here.

### Stage 2: Real-World Testing (15 minutes)

**Test on actual project workloads:**

```bash
# Test on current project
cd ~/Developer/current-project
{new-tool} {typical-task}

# Test on large directory
cd ~/Developer  # or another large directory tree
{new-tool} {typical-task}

# Test common variations
{new-tool} {variant-1}
{new-tool} {variant-2}
{new-tool} {variant-3}

# Test error handling
{new-tool} nonexistent-file
{new-tool} --invalid-flag
{new-tool} {edge-case}
```

**Evaluate results:**
- Does output format work for your needs?
- Are error messages helpful?
- Any surprising behavior?
- Performance consistent across different inputs?

**Decision point:** If issues found, check GitHub issues. If widespread problems or dealbreaker bugs, stop.

### Stage 3: Integration Testing (10 minutes)

**Check fit with existing workflow:**

```bash
# Pipe compatibility
{new-tool} args | other-command
other-command | {new-tool} args

# Script compatibility
# - Create small test script using new tool
# - Verify behavior matches expectations

# Shell integration
# - Tab completion working?
# - Any shell-specific issues? (zsh vs bash)
# - Works from different directories?

# Alias trial
alias {old}={new}
# Use normally for a few minutes
# Pay attention to muscle memory friction
```

**Decision point:** Integration issues are often deal-breakers for drop-in replacements. If tool doesn't fit workflow smoothly, consider fallback strategy or skip.

### Testing Checklist

- [ ] Installs cleanly
- [ ] Help text is clear
- [ ] Basic operation works as expected
- [ ] Performance is measurably better (if speed is goal)
- [ ] Output format is acceptable
- [ ] Error messages are helpful
- [ ] Works in pipes/scripts
- [ ] No showstopper bugs on current project
- [ ] Integrates smoothly with existing workflow
- [ ] Documentation is adequate

## Recommendation Format

When presenting tool findings to user:

### Template

```
Found: {TOOL_NAME} — {one-line description}

Performance:
- {benchmark result, e.g., "8× faster than find on this codebase"}
- {specific improvement, e.g., "searched 10k files in 0.2s vs 2.1s"}

Benefits:
- {key advantage 1}
- {key advantage 2}
- {key advantage 3}

Installation:
```bash
{install command}
```

Trade-offs:
- {any downsides, or "None identified"}

Confidence: {HIGH/MEDIUM/LOW}
- HIGH: Widely adopted, clear win, drop-in replacement
- MEDIUM: Good but niche, or requires workflow changes
- LOW: Bleeding edge, or significant compatibility concerns

Recommend: {INSTALL/TRY/SKIP}

```

### Example

```

Found: ripgrep (rg) — Fast line-oriented search tool

Performance:
- 15× faster than grep on this codebase
- Searched 50k files in 0.3s vs 4.5s with grep -r

Benefits:
- Respects .gitignore by default (no node_modules noise)
- Colored output with line numbers
- Better regex support (PCRE2)
- Automatic binary file detection

Installation:

```bash
brew install ripgrep
```

Trade-offs:
- Different flags than grep (muscle memory adjustment)
- Recursive by default (explicit -r not needed)

Confidence: HIGH
- 40k+ GitHub stars
- Used by major projects (VS Code search backend)
- Drop-in for most grep use cases

Recommend: INSTALL

```

## When to Recommend Installation

### Recommend: INSTALL

User should install when ALL of these are true:

- **Clear performance win** (5×+ faster) OR **significantly better ergonomics**
- **No significant downsides** (compatible, well-maintained)
- **Easy installation** (brew/apt/cargo available)
- **High confidence** in quality (mature, adopted, maintained)

**Action:**
- Include install command in response
- Offer to add shell alias if appropriate
- Provide example usage for current task

### Recommend: TRY

User might try when:

- **Moderate improvement** (2-5× faster or notable UX improvement)
- **Specialized use case** (benefits specific workflows)
- **Learning curve exists** (different paradigm or syntax)
- **Medium confidence** (newer tool, smaller community, or niche)

**Action:**
- Explain benefits clearly
- Provide test command to evaluate
- Let user decide based on their priorities
- Offer to help with adoption if they choose to try

### Recommend: SKIP

Don't recommend when ANY of these are true:

- **Marginal improvement** (<2× faster, minimal UX gain)
- **Installation complexity** (build from source, many dependencies)
- **Maintenance concerns** (abandoned, single maintainer MIA, security issues)
- **Low confidence** (alpha quality, breaking changes, major bugs)
- **User constraints** (no install access, strict portability requirements)

**Action:**
- Use fallback tool without mentioning limitation
- Or briefly note why skipping: "Evaluated {TOOL} but marginal improvement doesn't justify installation"
- Document finding for future reference if tool matures

## Fallback Strategy

Always maintain fallback support in scripts and automation:

### Pattern 1: Check-then-run

```bash
if command -v rg &> /dev/null; then
  rg pattern
else
  grep -r pattern .
fi
```

### Pattern 2: Function Wrapper

```bash
search() {
  if command -v rg &> /dev/null; then
    rg "$@"
  else
    grep -r "$@" .
  fi
}
```

### Pattern 3: Conditional Alias

```bash
# In shell config (.zshrc, .bashrc)
if command -v bat &> /dev/null; then
  alias cat='bat --style=plain --paging=never'
fi

if command -v eza &> /dev/null; then
  alias ls='eza'
  alias l='eza -l'
  alias la='eza -la'
fi
```

**Why fallback matters:**

- Scripts work on systems without modern tools installed
- Shared code doesn't break for other developers
- Graceful degradation in CI/CD environments
- Portable across different environments

## Example Research Session

**Trigger**: User searching large codebase, `grep` taking 30+ seconds

**Search query**: "fast code search CLI tool 2024"

**Candidates found**:
1. ripgrep (rg) — Rust-based, 10-100x faster than grep
2. The Silver Searcher (ag) — C-based, 3-5x faster than grep
3. ugrep — C++ with advanced regex, similar speed to rg

**Initial evaluation**:

| Tool | Speed | Ergonomics | Maintenance | Install |
|------|-------|------------|-------------|---------|
| rg | ★★★ | ★★★ | ★★★ | ★★★ |
| ag | ★★ | ★★ | ★ | ★★★ |
| ugrep | ★★★ | ★★ | ★★ | ★★ |

**Hands-on test**:

```bash
brew install ripgrep

# Current: grep -r "pattern" . (30s)
time grep -r "authentication" .
# Result: 28.4s

# New: rg "pattern" (default recursive)
time rg "authentication"
# Result: 0.8s

# Edge case: large binary files
rg "pattern"  # Automatically skips binaries
grep -r "pattern" .  # Hangs on binaries unless -I flag
```

**Findings**:

```
Found: ripgrep (rg) — Recursive line-oriented search tool

Advantages:
- 35x faster than grep on this codebase (0.8s vs 28s)
- Respects .gitignore automatically (fewer false matches)
- Colorized output with line numbers by default
- Automatically skips binary files

Install:
brew install ripgrep

Example (current task):
rg "authentication" --type ts

Trade-offs:
- Different flag syntax than grep (learning curve)
- Regex flavor differs slightly (PCRE2 vs POSIX)

Recommendation: ★ ADOPT — 35x speedup justifies one-time learning cost
```

## Tool Discovery Resources

### Curated Lists

- [awesome-cli-apps](https://github.com/agarrharr/awesome-cli-apps)
- [modern-unix](https://github.com/ibraheemdev/modern-unix)
- [Rust CLI tools](https://lib.rs/command-line-utilities)
- [Go CLI tools](https://github.com/avelino/awesome-go#command-line)

### Communities

- r/commandline — CLI tool discussions
- r/rust — Rust-based tools (often fastest)
- r/golang — Go-based tools (good balance)
- Lobsters CLI tag — <https://lobste.rs/t/cli>

### Benchmarking Tools

When comparing performance:

```bash
# hyperfine - statistical benchmarking
brew install hyperfine
hyperfine '{COMMAND_1}' '{COMMAND_2}'

# time - quick comparison
time {COMMAND}

# perf - detailed profiling (Linux)
perf stat {COMMAND}
```

## Updating Tool Catalog

When research yields strong candidate:

1. Add to main selection table in SKILL.md
2. Document in tool-catalog.md with:
   - Purpose
   - Key features
   - Installation
   - Common usage
   - Performance notes
3. Update detection script to check for new tool
4. Add to any relevant workflow examples

Keep tool catalog current — revisit every 6 months to prune abandoned tools and add emerging ones.
