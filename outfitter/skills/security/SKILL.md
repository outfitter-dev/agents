---
name: security
description: This skill should be used when auditing code for security issues, reviewing authentication/authorization, evaluating input validation, analyzing cryptographic usage, or reviewing dependency security. Provides OWASP patterns, CWE analysis, and threat modeling guidance.
metadata:
  version: "1.0.0"
---

# Security Engineering

Threat-aware code review. Vulnerability detection. Risk-ranked remediation.

<when_to_use>

- Security audits and code reviews
- Authentication/authorization review
- Input validation and sanitization checks
- Cryptographic implementation review
- Dependency and supply chain security
- Threat modeling for new features

NOT for: performance optimization, general code review, feature implementation

</when_to_use>

<stages>

Load the **maintain-tasks** skill for stage tracking. Each stage feeds the next.

| Stage | Trigger | activeForm |
|-------|---------|------------|
| Threat Model | Session start | "Building threat model" |
| Attack Surface | Model complete | "Mapping attack surface" |
| Vulnerability Scan | Surface mapped | "Scanning for vulnerabilities" |
| Risk Assessment | Vulns identified | "Assessing risk levels" |
| Remediation Plan | Risks assessed | "Planning remediation" |

Critical findings: add urgent remediation task immediately.

</stages>

<severity_levels>

CVSS-aligned severity for findings:

| Indicator | Severity | CVSS | Examples |
|-----------|----------|------|----------|
| **Critical** | 9.0-10.0 | RCE, auth bypass, mass data exposure, admin privesc |
| **High** | 7.0-8.9 | SQLi, stored XSS, auth weakness, sensitive data leak |
| **Medium** | 4.0-6.9 | CSRF, reflected XSS, info disclosure, weak crypto |
| **Low** | 0.1-3.9 | Misconfig, missing headers, verbose errors |

Format: "**Critical** RCE via unsanitized shell command"

</severity_levels>

<threat_modeling>

## STRIDE Framework

Systematic threat identification by category:

| Threat | Question | Check |
|--------|----------|-------|
| **S**poofing | Can attacker impersonate? | Auth mechanisms, tokens, sessions, API keys |
| **T**ampering | Can attacker modify data? | Input validation, integrity checks, DB access |
| **R**epudiation | Can actions be denied? | Audit logs, signatures, timestamps |
| **I**nfo Disclosure | Can attacker access secrets? | Encryption, access control, logging |
| **D**enial of Service | Can attacker disrupt? | Rate limits, timeouts, input size |
| **E**levation | Can attacker gain access? | Authz checks, RBAC, least privilege |

## Attack Trees

Map paths from attacker goal to entry points:

```
Goal: Steal credentials
- Attack login
  - SQLi in username
  - Brute force (no rate limit)
  - Session fixation
- Intercept traffic
  - HTTPS downgrade
  - MITM
- Exploit reset
  - Predictable token
  - No expiry
```

For each branch assess: feasibility, impact, detection, current defenses.

## Trust Boundaries

Identify where data crosses trust levels:
- Browser to server
- Server to database
- Service to third-party API
- Internal service to service

Every boundary needs validation.

</threat_modeling>

<attack_surface>

## Entry Points

**External**:
- HTTP/API endpoints (REST, GraphQL, gRPC)
- WebSocket connections
- File uploads
- OAuth/SAML flows
- Webhooks

**Data Inputs**:
- User data (forms, query params, headers)
- File content (type, size, payload)
- API payloads (JSON, XML)
- Database queries

**Auth Boundaries**:
- Public (no auth)
- Authenticated
- Admin/privileged
- Service-to-service

## Prioritize Review

1. Unauthenticated external inputs
2. Privileged operations
3. Data persistence layers
4. Third-party integrations

For each entry point document:
- Auth required? (none/user/admin)
- Input validated? (none/basic/strict)
- Rate limited?
- Logged?
- Encrypted?

</attack_surface>

<vulnerability_patterns>

## Quick Reference

| Vulnerability | Vulnerable | Secure |
|--------------|------------|--------|
| SQL Injection | String concat in query | Parameterized queries |
| XSS | innerHTML with user data | textContent or DOMPurify |
| Command Injection | exec() with user input | execFile() with array |
| Path Traversal | Direct path concat | basename + prefix check |
| Weak Password | MD5/SHA1/plain | bcrypt (12+) or argon2 |
| Predictable Token | Math.random/Date.now | crypto.randomBytes(32) |
| Broken Auth | Client-side role check | Server-side every request |
| IDOR | No ownership check | Verify user owns resource |
| Hardcoded Secret | API key in code | Environment variable |
| Info Leak | Stack trace to user | Generic error, log detail |

## Critical Checks

**Authentication**:
- Passwords: bcrypt/argon2, cost 12+
- Sessions: crypto.randomBytes(32), httpOnly, secure, sameSite
- JWT: verify signature, specify algorithm, short expiry
- Reset: random token, 1hr expiry, hash stored token

**Authorization**:
- Server-side on every request
- Verify ownership before resource access
- Explicit allowlist for mass assignment
- No role elevation from client input

**Input Validation**:
- Type, length, format on all inputs
- Parameterized queries (never concat)
- Escape/sanitize HTML output
- Validate file uploads (type, size, content)

**Cryptography**:
- AES-256-GCM, SHA-256+
- Never MD5, SHA1, DES, ECB
- Secrets from env, never hardcoded
- crypto.randomBytes for all tokens

See [vulnerability-patterns.md](references/vulnerability-patterns.md) for code examples.

</vulnerability_patterns>

<owasp_top_10>

2021 OWASP Top 10 categories. Check each during vulnerability scan.

| # | Category | Key CWEs | Top Mitigations |
|---|----------|----------|-----------------|
| A01 | Broken Access Control | 200, 352, 639 | Server-side checks, ownership validation |
| A02 | Cryptographic Failures | 259, 327, 331 | TLS, bcrypt, no hardcoded secrets |
| A03 | Injection | 20, 79, 89 | Parameterized queries, input validation |
| A04 | Insecure Design | 209, 256, 434 | Threat modeling, rate limiting |
| A05 | Security Misconfiguration | 16, 611, 614 | Security headers, disable debug |
| A06 | Vulnerable Components | 1035, 1104 | npm audit, Dependabot |
| A07 | Auth Failures | 287, 307, 521 | Strong passwords, MFA, rate limiting |
| A08 | Integrity Failures | 502, 494 | Verify signatures, schema validation |
| A09 | Logging Failures | 117, 532, 778 | Audit logs, redact sensitive data |
| A10 | SSRF | 918 | URL allowlist, block private IPs |

See [owasp-top-10.md](references/owasp-top-10.md) for detailed breakdowns with code examples.

</owasp_top_10>

<workflow>

**Loop**: Model Threats -> Map Surface -> Scan Vulnerabilities -> Assess Risk -> Plan Remediation

1. **Threat Model**
   - STRIDE analysis for component
   - Attack trees for critical paths
   - Identify trust boundaries
   - Document threat actors

2. **Attack Surface**
   - Inventory all inputs
   - Classify by auth level
   - Map data flows across boundaries
   - Prioritize high-risk entry points

3. **Vulnerability Scan**
   - Check each entry against OWASP Top 10
   - Review auth/authz
   - Validate input handling
   - Check crypto usage
   - Scan deps: `npm audit`, `cargo audit`

4. **Risk Assessment**
   - Rate severity (Critical/High/Medium/Low)
   - Consider exploitability
   - Assess impact (CIA triad)
   - Calculate risk score

5. **Remediation Plan**
   - **Critical**: immediate action
   - **High**: fix before release
   - **Medium**: schedule in sprint
   - **Low**: backlog or accept

Update todos as you progress. Use [review-checklist.md](references/review-checklist.md) for verification.

</workflow>

<reporting>

## Finding Format

```markdown
## {SEVERITY} {VULN_NAME}

**Category**: {OWASP} | **CWE**: {ID} | **File**: {PATH}:{LINES}

### Issue
{CLEAR_EXPLANATION}

### Impact
{WHAT_ATTACKER_COULD_DO}

### Fix
{SPECIFIC_REMEDIATION_WITH_CODE}
```

## Summary Format

```markdown
# Security Audit: {SCOPE}

| Severity | Count |
|----------|-------|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |

## Key Findings
1. {TOP_CRITICAL}
2. {SECOND}
3. {THIRD}

## Recommendations
- Immediate: {CRITICAL_FIXES}
- Short-term: {HIGH_MEDIUM}
- Long-term: {HARDENING}
```

See [report-templates.md](references/report-templates.md) for full templates.

</reporting>

<rules>

ALWAYS:
- Start with threat modeling before code review
- Map complete attack surface
- Check against all OWASP Top 10 categories
- Use severity indicators consistently
- Provide specific remediation with code
- Verify fixes don't introduce new vulnerabilities
- Document security assumptions
- Update todos when transitioning stages

NEVER:
- Skip threat modeling for "simple" features
- Assume input is trustworthy
- Rely on client-side security
- Use deprecated crypto (MD5, SHA1, DES)
- Log sensitive data
- Disable security checks "temporarily"
- Mark complete without remediation plan

</rules>

<references>

**Deep dives**:
- [vulnerability-patterns.md](references/vulnerability-patterns.md) - secure vs vulnerable code examples
- [owasp-top-10.md](references/owasp-top-10.md) - detailed OWASP categories with CWE mappings
- [review-checklist.md](references/review-checklist.md) - complete security review checklist
- [report-templates.md](references/report-templates.md) - finding and audit report templates

**Related skills**:
- codebase-recon - evidence-based investigation foundation
- debugging - when security issues manifest as bugs

**External**:
- [OWASP Top 10](https://owasp.org/Top10/)
- [CWE Database](https://cwe.mitre.org/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)

</references>
