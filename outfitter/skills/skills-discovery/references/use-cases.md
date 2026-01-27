# Use Case Catalog

Condensed catalog of skill and plugin patterns for inspiration. Categories reflect common community implementations.

## Workflow Automation

### PR & Code Review

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| PR Summary | Preprocessing with `gh` for live context | `!gh pr diff` injects changes before analysis |
| Review Notes | Forked context for clean analysis | `context: fork` prevents history pollution |
| Commit Message | Arguments drive behavior | `$ARGUMENTS` for issue number or description |

**Stealable idea**: Deterministic preprocessing replaces tool calls with cached-at-invoke snapshots.

### Issue Pipelines

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Triage → Plan → Implement | Artifact-based state handoff | Each step reads previous, writes own artifact |
| Acceptance criteria | Gates between steps | Next step requires previous artifact exists |
| Rollback plans | Plan artifacts include undo | Always document how to revert |

**Stealable idea**: State lives in files, not conversation. Survives compaction.

### Release Automation

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Preflight gates | Hooks enforce tests | PreToolUse blocks deploy if tests red |
| Manual deploy | User-invoked only | `disable-model-invocation: true` |
| Post-deploy verify | Deterministic checks | Health endpoints, error counts |

**Stealable idea**: "Guardrails sandwich" — hooks before, checks after, agent in middle.

## Code Quality

### Spec Gates

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Write spec first | Forked deliberation | `context: fork`, `agent: Plan` |
| Threat model | Security in spec stage | Include "where could data leak?" |
| Scope detection | Catch prompt injection | Check for scope creep in spec |

**Stealable idea**: Institutionalize paranoia before code stage, not after.

### Safe Refactoring

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Read-only first | Explore before mutate | `allowed-tools: Read, Grep, Glob` |
| Refactor plan | Document changes before making | Artifact gates execution |
| Tests as gates | No refactor without green tests | Hook enforcement |

**Stealable idea**: Separate exploration from execution. Cheaper to plan wrong than code wrong.

### Adversarial Review

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Multiple perspectives | Council pattern | Run security + perf + UX reviewers |
| Merge reviews | Single decision artifact | Synthesize diverse findings |
| Dissent tracking | Document disagreements | Review notes include opposing views |

**Stealable idea**: Force diverse failure modes. One perspective misses things.

## Domain Skills

### Framework-Specific

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Rails conventions | Package per framework | Skills encode framework idioms |
| React patterns | Component helpers | Stack-specific best practices |
| Nested discovery | Package-local skills | `.claude/skills` in each package |

**Stealable idea**: Skills encode "how we do X here" as executable documentation.

### DB-Aware

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Schema injection | Preprocessing with psql | `!psql -c "\\d table"` |
| Query validation | Explain before execute | Read-only analysis of queries |
| Migration planning | Document before alter | Artifact for migration spec |

**Stealable idea**: Inject schema deterministically so every query is structure-aware.

### Platform Integrations

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Jira/Linear | Issue context injection | Preprocessing or MCP |
| GitHub | `gh` CLI preprocessing | `!gh` for live state |
| Pinecone/search | MCP for external index | Offload heavy operations |

**Stealable idea**: Use preprocessing for read operations, MCP for stateful services.

## Safety & Guardrails

### Safety Nets

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Dangerous command block | PreToolUse hooks | Exit code 2 blocks tool |
| Irreversible detection | Regex on commands | Match `rm -rf`, `push --force` |
| File protection | Path-based blocking | Prevent writes to sensitive dirs |

**Stealable idea**: Guardrails outside the LLM, not inside prompts.

### Test Gates

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Commit requires tests | Hook blocks git commit | PreToolUse on `Bash(git commit)` |
| File flag pattern | Tests create flag file | Hook checks for flag existence |
| CI/CD integration | Status checks | Query CI status before merge |

**Stealable idea**: "Run tests" as mechanical enforcement, not polite suggestion.

### Human Acknowledgment

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Hardstop before deploy | Explicit invocation | `disable-model-invocation: true` |
| Checkpoint artifacts | Review before proceed | Artifacts serve as gates |
| Decision logging | Document what was approved | Append decisions to context.md |

**Stealable idea**: High-stakes actions require explicit human trigger.

## Context Management

### Memory Plugins

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Cross-session state | MCP-backed storage | Store/retrieve outside context window |
| Selective loading | Query for relevant memories | Only load what current task needs |
| Structured memory | Typed storage schemas | Not just blobs, queryable facts |

**Stealable idea**: Memory belongs in persistent store, loaded selectively.

### Context Ledgers

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Rolling state files | Hooks update on changes | PostToolUse updates context.md |
| Decision logs | Append-only history | Never delete, only append |
| Minimal constraints | Small always-loaded file | constraints.md with invariants |

**Stealable idea**: Small files that always load, volatile state in artifacts.

### Preprocessing for Context

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Git state | `!git status` | Snapshot at skill load |
| Environment info | `!node --version` | Runtime context |
| Schema dumps | `!psql -c "\\d"` | Structure without tool calls |

**Stealable idea**: Deterministic context injection is cheaper than tool calls.

## Multi-Agent Orchestration

### Subagent Patterns

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Explore → implement | Read-only then mutate | Different agent per stage |
| Parallel analysis | Concurrent forked skills | Multiple `context: fork` runs |
| Result merging | Synthesis skill | Merge multiple artifact outputs |

**Stealable idea**: Split work by capability, not just by step.

### Council Pattern

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Diverse reviewers | Security + perf + UX | Each in forked context |
| Forced disagreement | Different failure modes | Reviewers can't see each other |
| Unified decision | Merge with conflicts noted | Decision artifact acknowledges dissent |

**Stealable idea**: Force diverse perspectives by running separate analyses.

### Dispatcher Pattern

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Task routing | Match task to specialist | Orchestrator skill selects agent |
| Capability matching | Agent per domain | DB agent, frontend agent, etc. |
| Handoff artifacts | Standard interface | All agents write to artifacts/ |

**Stealable idea**: Orchestrator stays lean, specialists do heavy work.

## Debugging & Incidents

### Evidence Gathering

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Deterministic capture | Preprocessing logs | `!tail -100 /var/log/app.log` |
| State snapshot | Git + system state | Multiple preprocessing commands |
| Timeline construction | Chronological evidence | Artifact structures timeline |

**Stealable idea**: Gather evidence deterministically before forming hypotheses.

### Hypothesis Testing

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Ranked hypotheses | Likelihood ordering | Artifact lists hypotheses by probability |
| Evidence mapping | What supports/refutes | Link evidence to hypotheses |
| Investigation steps | Falsifiable tests | Clear next steps to confirm/reject |

**Stealable idea**: Systematic debugging beats guessing. Evidence first.

### Postmortems

| Pattern | Key Insight | Implementation |
|---------|-------------|----------------|
| Artifact-driven | All incidents leave trail | Read all incident artifacts |
| Action items | Tracked in artifact | Postmortem includes todos |
| Pattern extraction | Learn for next time | Codify if pattern repeats |

**Stealable idea**: Incidents produce artifacts that inform future prevention.

## Key Patterns Summary

| Pattern | One-Line Summary |
|---------|------------------|
| Preprocessing | Shell commands inject context before model thinks |
| Artifacts | Files pass state between skills |
| Fork vs Inherit | Analysis forks, implementation inherits |
| Gates | Artifacts as prerequisites for next step |
| Side-effect protection | `disable-model-invocation: true` |
| Tool restriction | `allowed-tools` minimal per skill |
| Council | Multiple perspectives in parallel forks |
| Guardrails sandwich | Hooks before + after, agent in middle |
