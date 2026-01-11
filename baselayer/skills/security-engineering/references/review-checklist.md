# Security Review Checklist

Complete checklist for security code review. Check each item before marking review complete.

---

## Authentication

- [ ] Passwords hashed with bcrypt/argon2 (cost >= 12)
- [ ] Session tokens cryptographically random (32+ bytes)
- [ ] Session cookies: httpOnly, secure, sameSite=strict
- [ ] Password reset tokens random + expiring (1 hour max)
- [ ] Rate limiting on login (5 attempts / 15 min)
- [ ] Account lockout after repeated failures
- [ ] MFA available for sensitive accounts
- [ ] JWT: signature verified, algorithm specified
- [ ] JWT: short expiry, refresh token rotation
- [ ] No credentials in URLs or logs

## Authorization

- [ ] All endpoints verify authentication server-side
- [ ] Resource ownership verified before access (no IDOR)
- [ ] Role checks on server, never client-only
- [ ] Principle of least privilege applied
- [ ] Admin functions require admin role server-side
- [ ] API endpoints return 403 for unauthorized, not 404
- [ ] Mass assignment prevented (explicit allowlists)
- [ ] CORS configured with explicit origins (no wildcards with credentials)

## Input Validation

- [ ] All inputs validated (type, length, format)
- [ ] SQL queries use parameterized statements
- [ ] HTML output escaped or sanitized (no raw innerHTML)
- [ ] File uploads validated (type, size, content)
- [ ] File names sanitized (path.basename)
- [ ] Path traversal prevented (prefix check after join)
- [ ] Command injection prevented (execFile, no shell)
- [ ] XML parsing disables external entities
- [ ] JSON schema validation on API inputs

## Cryptography

- [ ] No hardcoded secrets in code
- [ ] Secrets from environment variables
- [ ] Strong algorithms only (AES-256-GCM, SHA-256+)
- [ ] No MD5, SHA1, DES, ECB mode
- [ ] crypto.randomBytes for all tokens
- [ ] No Math.random for security purposes
- [ ] HTTPS enforced (no HTTP endpoints)
- [ ] TLS 1.2+ required
- [ ] Certificate validation not disabled
- [ ] Keys rotated periodically

## Data Protection

- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.2+ for data in transit
- [ ] Sensitive data not logged (passwords, tokens, PII)
- [ ] Error messages generic to users, detailed in logs
- [ ] PII handling complies with regulations (GDPR, CCPA)
- [ ] Database credentials not in code
- [ ] Backups encrypted
- [ ] Data retention policies implemented

## Dependencies

- [ ] All dependencies up to date
- [ ] npm audit / cargo audit clean
- [ ] No known CVEs in dependencies
- [ ] Dependency scanning in CI/CD
- [ ] Package lock files committed
- [ ] Minimal dependency footprint
- [ ] Source verification for dependencies
- [ ] No unused dependencies

## Logging & Monitoring

- [ ] Authentication events logged (success + failure)
- [ ] Authorization failures logged
- [ ] Sensitive operations audited (admin actions, data access)
- [ ] Log entries include timestamp, user ID, IP, action
- [ ] Logs protected from tampering
- [ ] No sensitive data in logs
- [ ] Log injection prevented (sanitize user input in logs)
- [ ] Security events trigger alerts
- [ ] Incident response plan documented

## Infrastructure

- [ ] Security headers configured (helmet or equivalent)
  - [ ] Content-Security-Policy
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] Strict-Transport-Security
  - [ ] Referrer-Policy
- [ ] Debug mode disabled in production
- [ ] Default accounts/passwords changed
- [ ] Unnecessary features/endpoints disabled
- [ ] Error pages don't reveal stack traces
- [ ] Rate limiting on all public endpoints

## SSRF Prevention

- [ ] URL inputs validated against allowlist
- [ ] Private IPs blocked (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)
- [ ] Cloud metadata endpoints blocked (169.254.169.254)
- [ ] Redirect following disabled or validated
- [ ] DNS rebinding prevented

---

## Quick Pre-Commit Checklist

Minimum checks before any commit touching security-sensitive code:

1. [ ] No hardcoded secrets
2. [ ] Inputs validated
3. [ ] SQL parameterized
4. [ ] Auth checked server-side
5. [ ] Ownership verified for resources
6. [ ] Sensitive data not logged
7. [ ] npm audit clean
