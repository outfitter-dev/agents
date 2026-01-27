# Tool Upgrade Example: grep → ripgrep

Worked example showing the research stage triggered by slow performance.

## Scenario

User is searching a large codebase for authentication-related code. The `grep` command is taking unexpectedly long.

## Initial Context

```bash
# User's command
grep -r "authentication" .

# Observed behavior
# ... hanging for 30+ seconds
# ... eventually returns results mixed with noise from node_modules, .git, etc.
```

## Stage 1: Trigger Detection

### Performance Trigger

**Observation:**
- Command taking 30+ seconds on ~50k files
- Task size suggests this should be much faster
- User likely to repeat this search frequently

**Trigger evaluation:**

```
Performance: ◆◆ CRITICAL
- 30s for recursive text search is very slow
- Blocking workflow
- Repeated operation (common in development)

Context:
- Large codebase (50k files)
- Likely contains ignored directories (node_modules, .git)
- User needs fast iteration on searches

Decision: TRIGGER RESEARCH
```

### Surface to User

```
△ This search is taking a long time (30s). The codebase size suggests a faster tool would help significantly. Research alternatives?
```

**User response:** "Yes, please"

## Stage 2: Research

### Step 1: Search for Candidates

**Query:** "fast code search CLI tool 2024"

**Sources checked:**
1. GitHub search: `site:github.com grep alternative rust stars:>1000`
2. awesome-cli-apps: Command-line tools > Search
3. modern-unix list: Text search category

**Candidates found:**

| Tool | Language | Stars | Description |
|------|----------|-------|-------------|
| ripgrep (rg) | Rust | 40k | Fast recursive search, respects .gitignore |
| ag (the silver searcher) | C | 25k | Fast grep alternative |
| ugrep | C++ | 3k | Advanced grep with better regex |

### Step 2: Initial Evaluation

**ripgrep (rg):**
- Speed: ★★★ (Rust, parallel, optimized)
- Ergonomics: ★★★ (smart defaults, colored output)
- Maintenance: ★★★ (active, recent commits, responsive maintainer)
- Install: ★★★ (brew, apt, cargo all available)
- Adoption: ★★★ (40k stars, used by VS Code)

**ag:**
- Speed: ★★ (faster than grep, but slower than rg)
- Ergonomics: ★★ (good defaults)
- Maintenance: ★ (less active recently)
- Install: ★★★ (widely available)
- Adoption: ★★ (mature, but being superseded)

**ugrep:**
- Speed: ★★★ (comparable to rg)
- Ergonomics: ★★ (powerful but complex)
- Maintenance: ★★ (active, but smaller team)
- Install: ★★ (less widely packaged)
- Adoption: ★ (smaller community)

**Decision:** Focus on `ripgrep` - best overall scores, especially speed + maintenance + adoption.

### Step 3: Hands-On Testing

**Installation:**

```bash
brew install ripgrep
```

**Test 1: Basic search**

```bash
# Compare with current command
time grep -r "authentication" .
# Result: 28.4s real

time rg "authentication"
# Result: 0.8s real

# Performance gain: 35× faster
```

**Test 2: Output quality**

```bash
rg "authentication"
```

Output:

```
src/auth/login.ts
42:export async function authenticate(credentials: Credentials) {
45:  const result = await authService.authenticate(credentials);

src/auth/middleware.ts
12:// Authentication middleware
15:export function requireAuthentication(req: Request) {

tests/auth.test.ts
8:describe('authentication', () => {
```

**Observations:**
- Colored output with syntax highlighting ✓
- Line numbers by default ✓
- File grouping ✓
- Clean, readable format ✓
- Automatically skipped node_modules, .git ✓

**Test 3: Edge cases**

```bash
# Error handling
rg "pattern" nonexistent-directory
# Error: No files were searched (stderr)
# Clear, actionable error ✓

# Large binary files
rg "text" binary-file.bin
# Automatically skips binary files ✓

# Complex patterns
rg "auth\w+" --type ts
# Regex works, type filtering works ✓
```

**Test 4: Integration**

```bash
# Pipe to other commands
rg "TODO" --files-with-matches | wc -l
# Works in pipeline ✓

# Script compatibility
if rg "pattern" file.txt > /dev/null; then
  echo "Found"
fi
# Exit codes work correctly ✓
```

### Step 4: Compatibility Check

**Drop-in replacement viability:**

```bash
# Can we alias grep → rg?
# Mostly yes, but flags differ

# Common grep flags vs rg equivalents:
grep -r  → rg (default recursive)
grep -i  → rg -i (same)
grep -v  → rg -v (same)
grep -l  → rg -l or --files-with-matches (same concept)
grep -n  → rg -n (same, but rg shows by default)

# Verdict: Similar enough for most use cases
# May need to update some scripts with specific grep flags
```

## Stage 3: Evaluation Summary

### Performance Analysis

**Benchmark results:**

```
Task: Search 50k files for "authentication"

grep -r:     28.4s
ripgrep:      0.8s

Speed gain:  35× faster
Time saved:  27.6s per search

If user runs 10 searches/day:
  Daily savings: 4.6 minutes
  Weekly savings: 23 minutes
  Annual savings: 20 hours
```

**Conclusion:** Massive performance improvement.

### Benefits vs Trade-offs

**Benefits:**
1. **Speed**: 35× faster on this codebase
2. **Smart defaults**: Respects .gitignore (cleaner results)
3. **Better output**: Colored, grouped, line numbers
4. **Binary handling**: Automatically skips binary files
5. **Regex**: PCRE2 support (more powerful patterns)
6. **Type filtering**: `--type ts` for language-specific searches

**Trade-offs:**
1. **Different flags**: Some grep flags have different names
2. **Muscle memory**: Need to learn rg-specific options
3. **POSIX compatibility**: Regex flavor differs from POSIX grep

**Verdict:** Benefits massively outweigh trade-offs.

### Confidence Assessment

**Adoption:** ✓ HIGH
- 40k+ GitHub stars
- Used by major projects (VS Code, GitHub search)
- Active community and development

**Maintenance:** ✓ HIGH
- Last commit: 2 weeks ago
- Responsive maintainer (burntsushi)
- Clear roadmap and changelog

**Installation:** ✓ HIGH
- `brew install ripgrep` works
- Also available via apt, cargo, chocolatey
- Binary releases for all platforms

**Quality:** ✓ HIGH
- Extensive test suite
- Well-documented
- Proven in production

**Overall Confidence:** HIGH

## Stage 4: Recommendation

### Presentation to User

```
Found: ripgrep (rg) — Fast line-oriented recursive search tool

Performance:
- 35× faster than grep on this codebase
- Searched 50k files in 0.8s vs 28.4s with grep -r
- Saves ~4 minutes per day with typical search patterns

Benefits:
- Respects .gitignore automatically (no node_modules noise)
- Colored output with syntax highlighting
- Line numbers and file grouping by default
- Automatic binary file detection
- Advanced regex support (PCRE2)
- Type filtering (--type ts, --type rust, etc.)

Installation:
```bash
brew install ripgrep
```

Example (replaces your current command):

```bash
# Instead of: grep -r "authentication" .
rg "authentication"

# With type filtering
rg "authentication" --type ts

# Case insensitive
rg -i "authentication"
```

Trade-offs:
- Some flag differences from grep (e.g., -r is default, not needed)
- Different regex flavor (PCRE2 vs POSIX) - rarely an issue

Confidence: HIGH
- 40k+ GitHub stars, widely adopted
- Used as search backend in VS Code and GitHub
- Active maintenance by respected developer
- Drop-in for 95% of grep use cases

Recommend: INSTALL

Want me to also add a shell alias to ease transition?

```

### User Response Options

**Option 1: User accepts immediately**
```

User: "Yes, install it and set up the alias"

Agent:

```bash
# Verify installation
command -v rg
# /opt/homebrew/bin/rg ✓

# Add to ~/.zshrc
echo "alias grep='rg'" >> ~/.zshrc
source ~/.zshrc

# Test
grep "authentication"
# Works! Using ripgrep now.
```

Done. You're now using ripgrep when you type `grep`.
The original grep is still available as `command grep` if needed.

```

**Option 2: User wants to try first**
```

User: "Let me try it for a while before aliasing"

Agent: Great approach. Try these commands:

```bash
# Your current search
rg "authentication"

# Limit to TypeScript files
rg "authentication" --type ts

# Show context (3 lines before/after)
rg "authentication" -C 3

# List files with matches only
rg "authentication" --files-with-matches
```

After a few days, if you like it, run:

```bash
echo "alias grep='rg'" >> ~/.zshrc
```

```

**Option 3: User declines**
```

User: "I'll stick with grep for now"

Agent: Understood. I'll note that ripgrep is available if you
change your mind. For now, I'll continue using grep.

[Internal note: rg available but user prefers grep - respect preference]

```

## Stage 5: Outcome

### Result: INSTALL accepted

```bash
# Installation confirmed
rg --version
# ripgrep 14.1.0

# Updated shell config with alias
grep --version
# ripgrep 14.1.0 (aliased)

# User runs same search
grep "authentication"
# 0.8s (was 28.4s)

# Success metrics
Speed improvement: 35×
User satisfaction: High (immediate feedback: "Wow, much faster!")
Workflow impact: Positive (cleaner output, faster iteration)
```

### Follow-up Actions

1. **Update tool catalog**: Added rg to preferred tools list
2. **Detection script**: Ensure script checks for rg availability
3. **Future searches**: Use rg by default on this system
4. **User education**: Mentioned --type flag for language-specific searches

### Lessons Learned

**What worked:**
- Clear performance measurement (28.4s → 0.8s)
- Real-world testing on user's actual codebase
- Showing immediate benefit (cleaner results, no node_modules noise)
- Offering trial period option

**What could improve:**
- Could have shown advanced features (--stats, --json output)
- Could have mentioned integration with fzf for interactive search
- Could have demonstrated multi-line search patterns

### Long-term Impact

**2 weeks later:**
- User now using rg for all searches
- Discovered `--stats` flag, using for codebase metrics
- Shared rg with team, 3 other developers adopted it
- User asks about other modern tools (triggered tool-catalog review)

**Conclusion:** Successful upgrade with measurable productivity gain.

---

## Key Takeaways

This example demonstrates:

1. **Clear trigger identification**: Performance >3× worse than expected
2. **Structured research**: GitHub search → evaluation → hands-on testing
3. **Quantified benefits**: 35× speedup, concrete time savings
4. **Confidence assessment**: Multiple factors (adoption, maintenance, quality)
5. **Flexible recommendation**: Offer installation with fallback options
6. **User respect**: Allow trial period, respect if declined
7. **Measurable outcome**: Confirm improvement, track adoption

**Pattern for future tool upgrades:**

```
Trigger → Research → Evaluate → Test → Recommend → Install → Verify → Follow-up
```
