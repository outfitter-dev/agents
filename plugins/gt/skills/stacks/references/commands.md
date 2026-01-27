# Graphite Command Reference

Quick reference organized by task.

## Creating Branches

| Command | Purpose |
| ------- | ------- |
| `gt create 'name'` | Create branch (explicit name) |
| `gt create -m "msg"` | Create branch (name from message) |
| `gt create 'name' -am "msg"` | Create + stage all + commit |
| `gt create 'name' --insert -am "msg"` | Insert between current and child |

## Modifying Branches

| Command | Purpose |
| ------- | ------- |
| `gt modify` | Amend with staged changes |
| `gt modify -a` | Stage all + amend |
| `gt modify -acm "msg"` | Stage all + new commit (same branch) |
| `gt modify --into branch -m "msg"` | Commit staged to different branch |

## Absorbing Changes

| Command | Purpose |
| ------- | ------- |
| `gt absorb` | Route staged changes to appropriate branch |
| `gt absorb -a` | Stage all + route to appropriate branches |

Use from top of stack when addressing multi-PR feedback.

## Stack Reorganization

| Command | Purpose |
| ------- | ------- |
| `gt move --onto target` | Move current branch to new parent |
| `gt move --source src --onto target` | Move specific branch |
| `gt restack` | Rebase all branches onto updated parents |
| `gt split` | Split multi-commit branch into stack |

## Stack Visualization

| Command | Purpose |
| ------- | ------- |
| `gt status` | JSON with parent relationships (scripting) |
| `gt ls` | Visual tree of stack |
| `gt log` | Stack history |

## Submitting

| Command | Purpose |
| ------- | ------- |
| `gt submit` | Submit current + downstack |
| `gt submit --stack` | Submit entire stack |
| `gt submit --no-interactive` | Non-interactive (automation) |

## Sync and Maintenance

| Command | Purpose |
| ------- | ------- |
| `gt sync` | Pull trunk, rebase, clean merged |
| `gt restack` | Rebase branches onto updated parents |
| `gt undo` | Undo last gt operation |

## Metadata Management

| Command | Purpose |
| ------- | ------- |
| `gt track branch` | Add branch to Graphite tracking |
| `gt untrack branch` | Remove from Graphite tracking |
| `gt repo fix` | Attempt automatic repair |

## Flags

Common flags across commands:

| Flag | Meaning |
| ---- | ------- |
| `-a` | Stage all changes |
| `-m "msg"` | Commit message |
| `-am "msg"` | Stage all + commit message |
| `--insert` / `-i` | Insert between current and child |
| `--no-interactive` | Skip prompts (automation) |
| `--stack` | Apply to entire stack |
