# Security Report Templates

Templates for documenting security findings and audit reports.

---

## Individual Finding Template

```markdown
## {SEVERITY} {VULNERABILITY_NAME}

**Category**: {OWASP_CATEGORY}
**CWE**: {CWE_IDS}
**Severity**: Critical/High/Medium/Low

### Location
- File: {FILE_PATH}
- Lines: {LINE_RANGE}
- Function: {FUNCTION_NAME}

### Description
{CLEAR_EXPLANATION}

### Impact
{WHAT_ATTACKER_COULD_DO}

### Proof of Concept
{CODE_OR_STEPS_TO_EXPLOIT}

### Remediation
{SPECIFIC_FIX_WITH_CODE}

### References
- OWASP: {URL}
- CWE: {URL}
```

### Severity Indicators

Use these indicators in finding titles:

- **Critical**: Remote code execution, auth bypass, mass data exposure, admin privilege escalation
- **High**: SQL injection, stored XSS, auth weaknesses, sensitive data leaks
- **Medium**: CSRF, reflected XSS, information disclosure, weak crypto
- **Low**: Misconfigurations, missing headers, verbose errors, minor info leaks

---

## Audit Report Template

```markdown
# Security Audit Report

**Date**: {DATE}
**Scope**: {COMPONENTS_REVIEWED}
**Reviewer**: {NAME}
**Version**: {APP_VERSION}

## Executive Summary

{1-2 PARAGRAPH HIGH-LEVEL OVERVIEW}

Overall security posture: {STRONG/ADEQUATE/NEEDS_IMPROVEMENT/CRITICAL}

## Risk Summary

| Severity | Count |
|----------|-------|
| Critical | {N}   |
| High     | {N}   |
| Medium   | {N}   |
| Low      | {N}   |

## Key Findings

### 1. {MOST_CRITICAL_FINDING}
Brief description and impact.

### 2. {SECOND_FINDING}
Brief description and impact.

### 3. {THIRD_FINDING}
Brief description and impact.

## Detailed Findings

{FULL_LIST_USING_INDIVIDUAL_FINDING_TEMPLATE}

## Recommendations

### Immediate (Critical/High)
1. {ACTION_ITEM}
2. {ACTION_ITEM}

### Short-term (Medium)
1. {ACTION_ITEM}

### Long-term (Low / Hardening)
1. {ACTION_ITEM}

## Scope & Methodology

### In Scope
- {COMPONENT_1}
- {COMPONENT_2}

### Out of Scope
- {EXCLUDED_ITEM}

### Methodology
- Threat modeling (STRIDE)
- Code review
- Dependency scanning
- {OTHER_METHODS}

## Conclusion

{OVERALL_ASSESSMENT_AND_NEXT_STEPS}
```

---

## Quick Finding Format

For inline documentation or PR comments:

```
[SEVERITY] VULN_TYPE in FILE:LINE
- Issue: {brief description}
- Impact: {what attacker could do}
- Fix: {one-line remediation}
```

Example:

```
[HIGH] SQL Injection in src/api/users.ts:45
- Issue: User email concatenated into query string
- Impact: Attacker can extract/modify database
- Fix: Use parameterized query with db.execute(sql, [email])
```

---

## Risk Matrix

Use for prioritization:

```
              IMPACT
              Low    Med    High
         Low   Low    Low    Med
LIKELIHOOD Med  Low    Med    High
         High  Med    High   Crit
```

Factors affecting likelihood:
- Skill required to exploit
- Access required (unauth vs auth vs admin)
- Attack complexity
- User interaction needed

Factors affecting impact:
- Confidentiality (data exposure)
- Integrity (data modification)
- Availability (service disruption)
- Scope (single user vs all users vs system)
