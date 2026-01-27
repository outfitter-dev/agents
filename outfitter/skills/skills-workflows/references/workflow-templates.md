# Workflow Templates

Copy/paste templates for common multi-skill workflows. Each workflow uses the shared conventions pattern from the main skill.

## Table of Contents

- [Triage → Plan → Implement → Test → Review → Ship](#triage--plan--implement--test--review--ship)
- [Spec Gate → Implement → Security Review → Merge](#spec-gate--implement--security-review--merge)
- [PR Summary → Review Notes → Update PR](#pr-summary--review-notes--update-pr)
- [Repo Bootstrap → Conventions → First Task](#repo-bootstrap--conventions--first-task)
- [Incident Triage → Evidence → Hypothesis → Fix → Postmortem](#incident-triage--evidence--hypothesis--fix--postmortem)
- [Data Report → Visualize → Publish](#data-report--visualize--publish)
- [Council Review → Decision → Implementation](#council-review--decision--implementation)
- [Safe Refactor Loop](#safe-refactor-loop)
- [Doc-Driven Development](#doc-driven-development)
- [Release Workflow](#release-workflow)

---

## Triage → Plan → Implement → Test → Review → Ship

The canonical development workflow. Use for feature work, bug fixes, and improvements.

### Structure

```text
.claude/skills/
  triage/SKILL.md
  plan/SKILL.md
  implement/SKILL.md
  test/SKILL.md
  review/SKILL.md
  ship/SKILL.md
artifacts/
  triage.md
  plan.md
  test-report.md
  review-notes.md
```

### triage/SKILL.md

```markdown
---
name: triage
description: Turn incoming task into problem statement + acceptance criteria.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Write
---

Triage $ARGUMENTS.

Write artifacts/triage.md:
- Problem statement
- Suspected scope (files/modules)
- Acceptance criteria
- Risks + unknowns
```

### plan/SKILL.md

```markdown
---
name: plan
description: Convert triage into implementation plan with checkpoints and rollback.
disable-model-invocation: true
---

Read artifacts/triage.md and constraints.md.

Write artifacts/plan.md:
- Approach (1-2 options)
- Chosen option + rationale
- Task breakdown
- Test plan
- Rollback plan
```

### implement/SKILL.md

```markdown
---
name: implement
description: Implement the planned changes following artifacts/plan.md.
disable-model-invocation: true
---

Follow artifacts/plan.md.
- Make minimal diffs
- Update context.md with decisions
- Prefer small commits
```

### test/SKILL.md

```markdown
---
name: test
description: Run test plan and summarize failures deterministically.
disable-model-invocation: true
allowed-tools: Read, Bash, Write
---

Run commands from artifacts/plan.md "Test plan".

Write artifacts/test-report.md:
- Commands run
- Output summary
- Failures and fixes
```

### review/SKILL.md

```markdown
---
name: review
description: Self-review like a strict PR reviewer. Propose follow-ups.
context: fork
agent: Plan
allowed-tools: Read, Grep, Glob, Write
---

Review diffs and artifacts.

Write artifacts/review-notes.md:
- Risks
- Edge cases
- Refactor opportunities
```

### ship/SKILL.md

```markdown
---
name: ship
description: Finalize and ship. Only when explicitly invoked.
disable-model-invocation: true
---

Checklist:
- tests green
- artifacts complete
- review notes addressed

Then perform ship steps appropriate to this repo.
```

### State Flow

```text
/triage → artifacts/triage.md
    ↓
/plan reads triage.md → artifacts/plan.md
    ↓
/implement reads plan.md → code changes + context.md
    ↓
/test reads plan.md → artifacts/test-report.md
    ↓
/review reads all → artifacts/review-notes.md
    ↓ (gates /ship)
/ship reads review-notes.md → commit/PR/deploy
```

---

## Spec Gate → Implement → Security Review → Merge

Adds adversarial security review before merge. Use for security-sensitive features.

### Structure

```text
.claude/skills/
  spec-gate/SKILL.md
  implement/SKILL.md
  adversarial-review/SKILL.md
  merge/SKILL.md
artifacts/
  spec.md
  security-review.md
```

### spec-gate/SKILL.md

```markdown
---
name: spec-gate
description: Write spec and detect prompt-injection/scope ambiguity before coding.
context: fork
agent: Plan
allowed-tools: Read, Grep, Glob, Write
---

Write artifacts/spec.md:
- Goals / non-goals
- Constraints
- Acceptance criteria
- Threat model (where could data leak?)
```

### adversarial-review/SKILL.md

```markdown
---
name: adversarial-review
description: Adversarial review against prompt injection and unsafe tool use.
context: fork
agent: Plan
allowed-tools: Read, Grep, Glob, Write
---

Review diff and artifacts/spec.md.

Write artifacts/security-review.md:
- Suspicious instructions
- Risky tool calls
- Recommended restrictions (allowed-tools / hooks)
```

---

## PR Summary → Review Notes → Update PR

Live PR workflow using `gh` CLI preprocessing.

### pr-summary/SKILL.md

```markdown
---
name: pr-summary
description: Summarize current PR using live gh CLI output.
context: fork
agent: Explore
allowed-tools: Read, Bash(gh:*), Write
---

## Pull Request Context

- **Diff**: !`gh pr diff`
- **Comments**: !`gh pr view --comments`

Summarize changes and risks in artifacts/pr-summary.md.
```

### review-notes/SKILL.md

```markdown
---
name: review-notes
description: Generate review notes from PR summary.
context: fork
agent: Plan
allowed-tools: Read, Write
---

Read artifacts/pr-summary.md.

Write artifacts/review-notes.md:
- Key changes
- Concerns
- Questions for author
```

### update-pr/SKILL.md

```markdown
---
name: update-pr
description: Update PR description with generated summary.
disable-model-invocation: true
allowed-tools: Read, Bash(gh:*)
---

Read artifacts/pr-summary.md.
Update PR body using gh pr edit.
```

---

## Repo Bootstrap → Conventions → First Task

Onboarding workflow for new projects.

### bootstrap-repo/SKILL.md

```markdown
---
name: bootstrap-repo
description: Initialize .claude/ structure for new project.
disable-model-invocation: true
---

Create skeleton:
- .claude/skills/_shared/context.md
- .claude/skills/_shared/constraints.md
- artifacts/ directory

Populate constraints.md with project defaults.
```

### conventions/SKILL.md

```markdown
---
name: conventions
description: Fill in repo-specific conventions after bootstrap.
---

Read existing codebase patterns.
Update constraints.md with:
- Style conventions
- Testing requirements
- Security policies
```

---

## Incident Triage → Evidence → Hypothesis → Fix → Postmortem

Incident response workflow with deterministic evidence gathering.

### incident-triage/SKILL.md

```markdown
---
name: incident-triage
description: Initial incident assessment and severity classification.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Write
---

Assess:
- Symptoms
- Affected systems
- Severity level
- Initial timeline

Write artifacts/incident-triage.md.
```

### gather-evidence/SKILL.md

```markdown
---
name: gather-evidence
description: Collect logs and metrics deterministically.
context: fork
agent: Explore
allowed-tools: Read, Bash(grep:*), Bash(tail:*), Write
---

## Current State

- **Recent logs**: !`tail -100 /var/log/app.log`
- **Error count**: !`grep -c ERROR /var/log/app.log`

Write artifacts/evidence.md with findings.
```

### hypothesize/SKILL.md

```markdown
---
name: hypothesize
description: Form and rank hypotheses from evidence.
context: fork
agent: Plan
allowed-tools: Read, Write
---

Read artifacts/evidence.md.

Write artifacts/hypothesis.md:
- Hypotheses ranked by likelihood
- Evidence supporting each
- Investigation steps to confirm/reject
```

### postmortem/SKILL.md

```markdown
---
name: postmortem
description: Generate postmortem from incident artifacts.
context: fork
agent: Plan
allowed-tools: Read, Write
---

Read all incident artifacts.

Write artifacts/postmortem.md:
- Timeline
- Root cause
- Contributing factors
- Action items
- Lessons learned
```

---

## Data Report → Visualize → Publish

Reporting workflow with artifact generation.

### data-report/SKILL.md

```markdown
---
name: data-report
description: Gather and analyze data for report.
context: fork
agent: Explore
allowed-tools: Read, Bash(*), Write
---

Gather data per $ARGUMENTS.
Write artifacts/data-report.md with analysis.
```

### visualize/SKILL.md

```markdown
---
name: visualize
description: Generate visualizations from report data.
allowed-tools: Read, Bash(*), Write
---

Read artifacts/data-report.md.
Generate charts/diagrams in artifacts/visuals/.
```

### publish-report/SKILL.md

```markdown
---
name: publish-report
description: Compile final report for publishing.
disable-model-invocation: true
---

Combine artifacts/data-report.md and artifacts/visuals/.
Output final report to artifacts/final-report.md or HTML.
```

---

## Council Review → Decision → Implementation

Multi-perspective review pattern. Forces diverse failure modes.

### council-review/SKILL.md

```markdown
---
name: council-review
description: Gather multiple perspectives on a decision.
context: fork
agent: Plan
allowed-tools: Read, Grep, Glob, Write
---

Review $ARGUMENTS from perspectives:
- Security reviewer
- Performance reviewer
- UX/Product reviewer
- Maintainability reviewer

Write artifacts/council-review.md with each perspective.
```

### decision/SKILL.md

```markdown
---
name: decision
description: Synthesize council review into decision.
---

Read artifacts/council-review.md.

Write artifacts/decision.md:
- Chosen approach
- Rationale
- Dissenting views acknowledged
- Mitigations for concerns
```

---

## Safe Refactor Loop

Read-only exploration before any changes.

### explore-safe/SKILL.md

```markdown
---
name: explore-safe
description: Read-only codebase exploration.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Write
---

Explore $ARGUMENTS without making changes.
Write artifacts/exploration.md with findings.
```

### refactor-plan/SKILL.md

```markdown
---
name: refactor-plan
description: Plan refactoring from exploration findings.
context: fork
agent: Plan
allowed-tools: Read, Write
---

Read artifacts/exploration.md.

Write artifacts/refactor-plan.md:
- Changes needed
- Order of operations
- Test coverage requirements
- Rollback strategy
```

### refactor-execute/SKILL.md

```markdown
---
name: refactor-execute
description: Execute refactoring plan.
disable-model-invocation: true
---

Follow artifacts/refactor-plan.md exactly.
Run tests after each step.
```

---

## Doc-Driven Development

Outline → Spec → Code → Docs Sync

### outline/SKILL.md

```markdown
---
name: outline
description: Create high-level outline before specifying.
context: fork
agent: Plan
allowed-tools: Read, Write
---

Write artifacts/outline.md with structure and goals.
```

### spec/SKILL.md

```markdown
---
name: spec
description: Detailed specification from outline.
---

Read artifacts/outline.md.
Write artifacts/spec.md with full specification.
```

### docs-sync/SKILL.md

```markdown
---
name: docs-sync
description: Sync documentation with implementation.
---

Compare code to artifacts/spec.md.
Update documentation to match implementation.
```

---

## Release Workflow

Preflight → Build → Deploy (manual) → Verify → Announce

### preflight/SKILL.md

```markdown
---
name: preflight
description: Pre-release validation checklist.
allowed-tools: Read, Bash(*), Write
---

Run preflight checks:
- Tests pass
- Lint clean
- No security warnings
- Changelog updated

Write artifacts/preflight.md with results.
Block if any checks fail.
```

### deploy/SKILL.md

```markdown
---
name: deploy
description: Deploy to environment. Manual invocation only.
disable-model-invocation: true
allowed-tools: Read, Bash(*)
---

Read artifacts/preflight.md (must exist and pass).
Deploy to $ARGUMENTS environment.
```

### verify/SKILL.md

```markdown
---
name: verify
description: Post-deploy verification.
allowed-tools: Read, Bash(*), Write
---

Verify deployment health:
- Health endpoints responding
- Key flows working
- No error spikes

Write artifacts/verify.md with results.
```

### announce/SKILL.md

```markdown
---
name: announce
description: Announce release. Manual invocation only.
disable-model-invocation: true
---

Read artifacts/verify.md (must pass).
Generate release announcement.
```

---

## Pattern Summary

| Workflow | Key Insight |
|----------|-------------|
| Triage→Ship | Full development lifecycle with gates |
| Spec Gate | Adversarial security review before merge |
| PR Summary | Preprocessing with `!gh` for live context |
| Bootstrap | Onboarding pattern for new projects |
| Incident | Evidence-first debugging with postmortem |
| Data Report | Artifact generation with visualization |
| Council | Multi-perspective review forces diverse analysis |
| Safe Refactor | Read-only exploration before changes |
| Doc-Driven | Spec precedes code |
| Release | Manual gates for deploy/announce |

The "secret sauce" isn't the step names—it's the **state handoff discipline** via artifacts.
