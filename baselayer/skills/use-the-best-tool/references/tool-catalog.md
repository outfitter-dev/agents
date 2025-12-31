# Tool Catalog

Recommended modern CLI tools organized by category. Each entry includes usage, installation, and rationale.

## Search Tools

### fd

**Category:** search
**Replaces:** find
**Description:** Fast, user-friendly file finder with smart defaults

#### Why upgrade?

- 8× faster than find on large directories
- Ignores `.gitignore` and hidden files by default
- Colored output with syntax highlighting
- Simpler, more intuitive syntax
- Parallel directory traversal

#### Typical usage

```bash
fd pattern                    # Find files matching pattern
fd -e ts                      # Find all .ts files
fd -e ts -x wc -l            # Count lines in each .ts file
fd -H config                  # Include hidden files
fd -I node_modules           # Include ignored files
fd pattern src/              # Search in specific directory
fd '^test.*\.ts$'            # Regex pattern
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install fd` |
| Cargo | `cargo install fd-find` |
| apt | `apt install fd-find` |
| dnf | `dnf install fd-find` |

[GitHub](https://github.com/sharkdp/fd)

---

### ripgrep (rg)

**Category:** search
**Replaces:** grep, ack, ag (the silver searcher)
**Description:** Line-oriented search tool that recursively searches the current directory

#### Why upgrade?

- 10–100× faster than grep/ack/ag
- Respects `.gitignore` by default
- Automatic binary file detection
- Better defaults (recursive, colored, line numbers)
- Supports .ignore files for custom exclusions
- Fast PCRE2 regex engine

#### Typical usage

```bash
rg pattern                    # Search current directory
rg -i pattern                # Case-insensitive search
rg -t ts pattern             # Search only TypeScript files
rg -T tests pattern          # Exclude tests directory
rg 'fn \w+' -r 'function $0' # Search and replace preview
rg pattern --files-with-matches  # Show only filenames
rg -C 3 pattern              # Show 3 lines of context
rg --hidden pattern          # Include hidden files
rg --no-ignore pattern       # Include ignored files
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install ripgrep` |
| Cargo | `cargo install ripgrep` |
| apt | `apt install ripgrep` |
| dnf | `dnf install ripgrep` |

[GitHub](https://github.com/BurntSushi/ripgrep)

---

### ast-grep (sg)

**Category:** search
**Replaces:** (no direct legacy equivalent)
**Description:** Code structural search and rewrite tool using AST patterns

#### Why use it?

- Language-aware pattern matching (not just text)
- Understands code structure and semantics
- Prevents false positives from string matches
- Supports 20+ languages
- Fast native performance (Rust)
- Pattern-based refactoring capabilities

#### Typical usage

```bash
sg -p 'console.log($$$)'     # Find all console.log calls
sg -p 'if ($A) { $B }' --lang ts  # Find if statements
sg scan                       # Run configured rules
sg --pattern '$A == null' --rewrite '$A === null'  # Refactor
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install ast-grep` |
| Cargo | `cargo install ast-grep` |
| npm | `npm install -g @ast-grep/cli` |

[GitHub](https://github.com/ast-grep/ast-grep) | [Docs](https://ast-grep.github.io/)

---

## JSON Tools

### jq

**Category:** json
**Replaces:** (no direct legacy equivalent)
**Description:** Command-line JSON processor with query language

#### Why use it?

- Parse, filter, and transform JSON from CLI
- Powerful query syntax
- Handles streaming JSON
- Colored output
- Widely adopted standard

#### Typical usage

```bash
cat data.json | jq '.'       # Pretty-print JSON
jq '.items[] | .name'        # Extract all names from items array
jq 'select(.status == "active")'  # Filter objects
jq '.[] | {name, email}'     # Transform shape
jq -r '.token'               # Raw output (no quotes)
curl api.com/data | jq '.results[0]'  # Parse API response
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install jq` |
| apt | `apt install jq` |
| dnf | `dnf install jq` |

[GitHub](https://github.com/jqlang/jq) | [Docs](https://jqlang.github.io/jq/)

---

## File Viewers

### bat

**Category:** viewers
**Replaces:** cat
**Description:** Cat clone with syntax highlighting and git integration

#### Why upgrade?

- Syntax highlighting for 200+ languages
- Git gutter showing changes
- Automatic paging for long files
- Line numbers by default
- Non-printable character visualization
- Integrates with other tools (fzf, rg)

#### Typical usage

```bash
bat README.md                 # View file with syntax highlighting
bat -n file.ts               # Show line numbers
bat --style=plain file.txt   # Disable decorations
bat -A file.sh               # Show non-printable characters
bat -d file.js               # Show git diff
bat file1.ts file2.ts        # View multiple files
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install bat` |
| Cargo | `cargo install bat` |
| apt | `apt install bat` |
| dnf | `dnf install bat` |

[GitHub](https://github.com/sharkdp/bat)

---

### eza

**Category:** viewers
**Replaces:** ls, exa
**Description:** Modern ls replacement with better defaults and git awareness

#### Why upgrade?

- Colored output by default
- Git status integration
- Tree view built-in
- Icons support (with nerdfont)
- Better permission display
- Maintained fork of unmaintained exa

#### Typical usage

```bash
eza                          # List files (colored)
eza -l                       # Long format
eza -la                      # Include hidden files
eza -T                       # Tree view
eza -lh --git                # Show git status
eza --sort=modified          # Sort by modification time
eza --icons                  # Show file icons
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install eza` |
| Cargo | `cargo install eza` |
| apt | `apt install eza` |
| dnf | `dnf install eza` |

[GitHub](https://github.com/eza-community/eza)

---

### git-delta

**Category:** viewers
**Replaces:** git diff
**Description:** Syntax-highlighting pager for git, diff, and grep output

#### Why upgrade?

- Side-by-side diff view
- Syntax highlighting in diffs
- Line numbers
- Better moved code detection
- Integrates with bat themes
- Works with git, diff output, and grep

#### Typical usage

```bash
# Configure git to use delta
git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"

# Then use git normally
git diff                     # Now uses delta
git show                     # Syntax-highlighted commits
git log -p                   # Beautiful patch logs
git blame                    # Enhanced blame view

# Direct usage
diff -u file1 file2 | delta
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install git-delta` |
| Cargo | `cargo install git-delta` |
| apt | `apt install git-delta` |
| dnf | `dnf install git-delta` |

[GitHub](https://github.com/dandavison/delta)

---

## Navigation Tools

### zoxide

**Category:** navigation
**Replaces:** cd with manual path typing
**Description:** Smarter cd command that learns your habits

#### Why upgrade?

- Jump to frequently used directories with partial names
- Frecency algorithm (frequency + recency)
- Works across all shells
- Interactive selection with fzf integration
- No manual bookmarking needed

#### Typical usage

```bash
# After installation, use 'z' instead of 'cd'
z proj                       # Jump to ~/Developer/projects
z doc agents                 # Jump to ~/Documents/agents
zi                           # Interactive directory selection
z -                          # Go to previous directory
zoxide query proj            # Query without jumping
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install zoxide` |
| Cargo | `cargo install zoxide` |
| apt | `apt install zoxide` |

**Post-install:** Add to shell config:

```bash
# ~/.zshrc or ~/.bashrc
eval "$(zoxide init zsh)"    # for zsh
eval "$(zoxide init bash)"   # for bash
```

[GitHub](https://github.com/ajeetdsouza/zoxide)

---

### fzf

**Category:** navigation
**Replaces:** manual history search, manual file selection
**Description:** General-purpose fuzzy finder for command-line

#### Why use it?

- Interactive fuzzy search for any list
- Fast C implementation
- Integrates with shell history, files, git
- Pipe any command output to fzf
- Preview window support
- Used by many other tools

#### Typical usage

```bash
# Basic fuzzy finding
fzf                          # Search files in current dir
history | fzf                # Search command history

# With preview
fzf --preview 'bat {}'       # Preview files with bat

# Shell integration (after install)
Ctrl-R                       # Search command history
Ctrl-T                       # Search files
Alt-C                        # Change directory

# Pipe integration
git branch | fzf | xargs git checkout  # Interactive branch checkout
ps aux | fzf | awk '{print $2}' | xargs kill  # Interactive process kill

# With other tools
rg pattern | fzf             # Fuzzy search through grep results
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install fzf` |
| apt | `apt install fzf` |
| dnf | `dnf install fzf` |

**Post-install:** Enable key bindings:

```bash
# macOS with Homebrew
$(brew --prefix)/opt/fzf/install
```

[GitHub](https://github.com/junegunn/fzf)

---

## HTTP Tools

### httpie

**Category:** http
**Replaces:** curl (for API testing)
**Description:** Human-friendly HTTP client for testing APIs

#### Why upgrade?

- Simpler syntax than curl
- JSON support by default
- Syntax highlighting
- Formatted output
- Session support
- File upload support
- Better error messages

#### Typical usage

```bash
# GET request
http GET api.example.com/users

# POST JSON (automatic content-type)
http POST api.example.com/users name=John email=john@example.com

# Headers
http GET api.example.com/users Authorization:"Bearer token"

# Download file
http --download example.com/file.zip

# Upload file
http POST api.example.com/upload < file.json

# Form data
http --form POST api.example.com/form name=John file@photo.jpg

# Sessions (save auth)
http --session=user1 POST api.example.com/login username=user1
http --session=user1 GET api.example.com/profile  # Reuses auth
```

#### Installation

| Method | Command |
|--------|---------|
| Homebrew | `brew install httpie` |
| pip | `pip install httpie` |
| apt | `apt install httpie` |
| dnf | `dnf install httpie` |

[GitHub](https://github.com/httpie/cli) | [Docs](https://httpie.io/docs/cli)

---

## Tool Comparison Matrix

Quick reference for choosing between tools:

| Task | Legacy | Modern | Speed Gain |
|------|--------|--------|------------|
| Find files | find | fd | 8× |
| Search text | grep | ripgrep | 10–100× |
| Search code structure | - | ast-grep | N/A |
| Parse JSON | - | jq | N/A |
| View files | cat | bat | Similar |
| List files | ls | eza | Similar |
| Git diffs | git diff | git-delta | Similar |
| Navigate dirs | cd | zoxide | 10× fewer keystrokes |
| Fuzzy search | - | fzf | N/A |
| HTTP requests | curl | httpie | Similar |

**Speed Gain:** Approximate performance improvement or ergonomic benefit

---

## Installation Bundles

Install all recommended tools at once:

### Homebrew (macOS/Linux)

```bash
brew install \
  fd \
  ripgrep \
  ast-grep \
  jq \
  bat \
  eza \
  git-delta \
  zoxide \
  fzf \
  httpie

# Post-install configuration
eval "$(zoxide init zsh)"
$(brew --prefix)/opt/fzf/install
git config --global core.pager delta
```

### Cargo (Cross-platform)

```bash
cargo install \
  fd-find \
  ripgrep \
  bat \
  eza \
  git-delta \
  zoxide \
  ast-grep

# jq, fzf, httpie still need system package manager
```

### apt (Debian/Ubuntu)

```bash
sudo apt install \
  fd-find \
  ripgrep \
  bat \
  eza \
  git-delta \
  zoxide \
  fzf \
  jq \
  httpie

# ast-grep may need cargo or npm
```

---

## Shell Aliases

Recommended aliases to maintain muscle memory:

```bash
# ~/.zshrc or ~/.bashrc

# Optional: alias old commands to new ones
alias cat='bat'
alias ls='eza'
alias find='fd'
alias grep='rg'

# Or: keep old names, add shortcuts for new tools
alias l='eza -l'
alias la='eza -la'
alias lt='eza -T'
alias rg='rg --hidden'
```

**Recommendation:** Start with shortcuts, not full aliases. Keeps old commands working on systems without these tools.

---

## Integration Examples

### fzf + ripgrep + bat

Interactive search with preview:

```bash
rg --files | fzf --preview 'bat --color=always {}'
```

### fd + fzf

Find and preview files:

```bash
fd -t f | fzf --preview 'bat --color=always {}'
```

### httpie + jq

API testing with formatted output:

```bash
http GET api.example.com/users | jq '.[] | {name, email}'
```

### zoxide + eza

Quick navigation with listing:

```bash
z() {
  cd "$(zoxide query "$@")" && eza -la
}
```

---

## When to Fall Back

Use legacy tools when:

- Working on systems where installation requires admin access
- Scripting for maximum portability (POSIX compliance)
- Tool-specific features not available in modern equivalent
- Embedded/minimal environments without package manager

In automation/scripts:

```bash
# Check if modern tool exists, fall back gracefully
if command -v fd &> /dev/null; then
  fd pattern
else
  find . -name "*pattern*"
fi
```
