---
description: Check open PR status, review comments, and CI status
argument-hint: [--repo org/repo]
---

# PR Check

Display status of open pull requests including draft state, CI checks, review status, and unresolved comments.

## Usage

```
/pr:check              # Check current repo
/pr:check --repo org/repo  # Check specific repo
```

## Output

- Number of open PRs
- PR number, title, author
- Draft vs ready status
- CI check status (passing/failing/pending)
- Review decision (approved/changes requested/pending)
- Count of unresolved review threads
- Preview of unresolved comments

---

Run the PR status script:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/commands/pr/scripts/pr-status.ts $ARGUMENTS
```

Present the output to the user. If there are unresolved review comments, offer to help address them.
