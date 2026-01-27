# Documentation Templates

Templates for investigation logging and root cause reports.

## Investigation Log

Real-time documentation during investigation.

### Format

```
[TIMESTAMP] STAGE: Action → Result

[10:15] DISCOVERY: Gathered error logs → Found NullPointerException in UserService
[10:22] HYPOTHESIS: Suspect user object not initialized when accessed
[10:28] TEST: Added null check logging → Confirmed user is null
[10:35] EVIDENCE: Traced call path → findById returning null for valid ID
[10:42] HYPOTHESIS: Database connection issue
[10:48] TEST: Direct DB query → Returns data correctly
[10:52] HYPOTHESIS: Caching returning stale null
[10:58] TEST: Disabled cache → Issue resolved
[11:05] ROOT CAUSE: Cache not invalidated on user update
```

### Entry Types

| Prefix | Use For |
|--------|---------|
| DISCOVERY | New information gathered |
| HYPOTHESIS | New theory formed |
| TEST | Experiment executed |
| EVIDENCE | Data that supports/refutes hypothesis |
| ROOT CAUSE | Final determination |
| BLOCKED | Cannot proceed, need help |

### Benefits

- Prevents revisiting same ground
- Enables handoff to others
- Creates learning artifact
- Catches circular investigation
- Documents what was tried

## Root Cause Report

Post-investigation documentation.

### Template

```markdown
# Root Cause Analysis: {Issue Title}

## Summary
Brief description of issue and resolution in 2-3 sentences.

## Timeline
- {DATE/TIME}: Issue first observed
- {DATE/TIME}: Investigation started
- {DATE/TIME}: Root cause identified
- {DATE/TIME}: Fix deployed
- {DATE/TIME}: Issue verified resolved

## Symptoms
What users/systems experienced:
- {Observable symptom 1}
- {Observable symptom 2}

## Root Cause
**Primary cause**: {What ultimately caused the issue}

**Contributing factors**:
- {Factor that made issue worse or harder to catch}
- {Factor that enabled issue to occur}

## Evidence
How we confirmed this was the root cause:
- {Evidence 1}
- {Evidence 2}
- {Test that confirmed}

## Resolution
**Immediate fix**: {What was done to resolve}

**Code/config changes**: {Links to PRs, commits}

## Prevention
**How to prevent recurrence**:
- {Preventive measure 1}
- {Preventive measure 2}

**Detection improvements**:
- {How to catch this earlier next time}

## Lessons Learned
- {What went well in investigation}
- {What could improve}
- {Knowledge gap discovered}

## Appendix
- Investigation log
- Relevant logs/screenshots
- Related incidents
```

## Quick Incident Notes

For minor issues not requiring full RCA.

### Template

```markdown
## Incident: {Brief title}
**Date**: {When}
**Duration**: {How long}
**Impact**: {Who/what affected}

**Cause**: {One sentence}
**Fix**: {One sentence}
**Prevention**: {One sentence}
```

## Hypothesis Tracking

When testing multiple hypotheses.

### Template

```markdown
## Hypotheses

### H1: {Description}
- **Likelihood**: High/Medium/Low
- **Evidence for**: {Supporting data}
- **Evidence against**: {Contradicting data}
- **Test**: {How to verify}
- **Status**: Pending/Testing/Confirmed/Ruled Out

### H2: {Description}
...
```

### Status Flow

```
Pending → Testing → Confirmed
                 → Ruled Out
```

## Environment Snapshot

Document system state at time of issue.

### Template

```markdown
## Environment Snapshot

**System**: {Service/application name}
**Instance**: {Server/container ID}
**Time**: {Timestamp}

### Versions
- Application: {version}
- Runtime: {version}
- Key dependencies: {versions}

### Configuration
- {Relevant config values}

### State
- Memory: {usage}
- CPU: {usage}
- Connections: {counts}
- Queue depth: {if applicable}

### Recent Changes
- {Deploy/config change within last 24-48h}
```

## Postmortem Meeting Notes

For team discussions.

### Agenda Template

```markdown
## Postmortem: {Incident}
**Date**: {Meeting date}
**Attendees**: {Names}

### Summary (5 min)
{Owner presents incident summary}

### Timeline Review (10 min)
{Walk through what happened when}

### Root Cause Discussion (15 min)
- Confirmed root cause
- Contributing factors
- Why wasn't this caught earlier?

### Action Items (15 min)
| Action | Owner | Due Date |
|--------|-------|----------|
| {Preventive measure} | {Name} | {Date} |

### Follow-up
- Next review: {Date if needed}
- Documentation: {Where RCA will be stored}
```

## Checklist: Documentation Quality

Before closing investigation:

- [ ] Root cause clearly stated
- [ ] Evidence documented
- [ ] Alternative hypotheses addressed
- [ ] Resolution steps recorded
- [ ] Prevention measures identified
- [ ] Learning captured
- [ ] Stakeholders informed
