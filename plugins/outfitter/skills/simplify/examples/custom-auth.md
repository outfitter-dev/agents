# Example: Challenging Custom Auth Build

## Scenario

User proposes building a custom authentication system from scratch instead of using an existing auth provider.

## Challenge Session

### IDENTIFY: Build vs Buy

**Proposal**: "I'm going to build our own authentication system. We'll need password hashing with bcrypt, JWT token generation, refresh token rotation, email verification, password reset flows, and session management."

**Complexity Smell Detected**: Build vs Buy
- Auth is security-critical with many edge cases
- Battle-tested solutions exist (Auth0, Clerk, BetterAuth, Lucia)
- Custom auth requires ongoing security maintenance
- High risk of subtle vulnerabilities

**Escalation Level**: ◆◆ Hazard

### ALTERNATIVE: Propose Simpler Solutions

**Response**:
> ◆◆ **Hazard**: Building custom authentication is high-risk. Auth has numerous security considerations: timing attacks, token expiry edge cases, secure password reset flows, account enumeration prevention, brute force protection, and more. Professional auth services employ security teams to handle these. Custom implementations frequently have vulnerabilities.
>
> I strongly recommend using a proven auth solution. Here are options by use case:

**Option 1: Clerk (Recommended for most apps)**

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}

// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs'

export default async function Dashboard() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return <div>Protected content</div>
}
```

**Benefits**:
- Setup: ~15 minutes
- Built-in UI components
- Social login, MFA, user management
- SOC 2 compliant
- Free tier for development

**Option 2: BetterAuth (Self-hosted, full control)**

```typescript
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
})

// Middleware
export async function middleware(request: Request) {
  const session = await auth.getSession(request)
  if (!session) return redirect('/login')
}
```

**Benefits**:
- Self-hosted (full data control)
- Type-safe, modern DX
- Handles security edge cases
- Active maintenance
- Open source

**Option 3: Lucia (Minimal, framework-agnostic)**

```typescript
import { Lucia } from 'lucia'
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'

const adapter = new BetterSqlite3Adapter(db)
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  }
})

// Usage
const session = await lucia.createSession(userId, {})
const sessionCookie = lucia.createSessionCookie(session.id)
```

**Benefits**:
- Lightweight core
- Framework flexibility
- Session management only (pair with password hashing library)
- Well-documented

**Comparison**:

| Approach | Setup Time | Security Maintenance | Features | Cost |
|----------|-----------|---------------------|----------|------|
| Custom Auth | 40+ hours | Ongoing, high-risk | As implemented | Developer time |
| Clerk | 15 min | None (managed) | Comprehensive | Free → $25/mo |
| BetterAuth | 2 hours | Low (library maintained) | Comprehensive | $0 (self-hosted) |
| Lucia | 4 hours | Medium (some assembly) | Core features | $0 |

### QUESTION: Investigate Constraints

**Critical questions**:
1. "What specific requirement makes existing auth solutions insufficient?"
2. "Do you have a security team to review and maintain the auth system?"
3. "Are you prepared for the ongoing maintenance burden when security vulnerabilities are discovered?"
4. "What unique auth flow do you need that can't be configured with existing providers?"
5. "Have you considered the liability if user data is compromised due to an auth vulnerability?"
6. "What's your threat model? Who are you protecting against?"

### Likely Answers & Responses

**If "We need full control over user data"**:
> "BetterAuth and Lucia are self-hosted - you maintain complete control over user data in your own database. Clerk also offers self-hosted enterprise options. Control doesn't require building from scratch."

**If "We have unique requirements for [specific flow]"**:
> "What's the specific requirement? Most auth providers support custom flows:
> - **Custom fields**: Clerk metadata, BetterAuth custom schema
> - **Custom verification**: Email/SMS hooks available
> - **Multi-tenancy**: Built into most providers
> - **Custom UI**: All providers allow custom UI with their APIs
>
> Can you describe the unique flow? Let's verify it truly requires custom auth."

**If "Auth services are too expensive"**:
> "Let's compare costs:
>
> | Solution | Monthly Cost | Developer Time Saved |
> |----------|--------------|---------------------|
> | Clerk Free | $0 (up to 10k users) | 40+ hours initial + ongoing |
> | BetterAuth | $0 (self-hosted) | 38 hours initial + reduced ongoing |
> | Custom | $0 infrastructure | 0 saved, high ongoing risk |
>
> Even at $25/month, Clerk pays for itself in saved developer time within the first week. Security vulnerabilities in custom auth can cost far more in remediation and reputation damage."

**If "I want to learn how auth works"**:
> "Learning auth internals is valuable, but production systems aren't ideal learning environments. Consider:
> 1. Build a learning project with custom auth to understand the concepts
> 2. Read auth library source code (Lucia is excellent for this)
> 3. Use a proven solution for production
>
> Auth mistakes in production can leak user data. The learning value isn't worth the security risk."

**If "We're already partially built"**:
> "How far along? If you're:
> - **Week 1-2**: Still early enough to migrate to proven solution
> - **Using bcrypt + JWT**: Most auth libraries support migration from existing password hashes
> - **In production**: Assess security posture, plan migration timeline
>
> Migration is usually worth the cost to reduce security risk."

### DOCUMENT: Record Decision

**If proceeding with custom auth** (requires strong justification):

```markdown
## ADR: Custom Authentication System

**Decision**: Build custom authentication system

**Context**:
- Requirement: [SPECIFIC UNIQUE REQUIREMENT THAT CANNOT BE MET BY EXISTING SOLUTIONS]
- Constraints: [e.g., Regulatory requirement for specific implementation, air-gapped environment]
- Team: Security expert [NAME] will review and maintain

**Security Measures**:
- [ ] Security audit by external firm before production
- [ ] Penetration testing quarterly
- [ ] Automated security scanning in CI/CD
- [ ] Threat model documented
- [ ] Incident response plan prepared
- [ ] Rate limiting on all auth endpoints
- [ ] Account enumeration prevention
- [ ] Timing attack mitigation
- [ ] Secure password reset flow
- [ ] Session fixation prevention
- [ ] CSRF protection
- [ ] Brute force protection

**Alternatives Considered**:
- Clerk: Rejected because [specific reason]
- BetterAuth: Rejected because [specific reason]
- Lucia: Rejected because [specific reason]

**Consequences**:
- **Pros**: [specific benefits that justify the risk]
- **Cons**: High maintenance burden, security liability, slower feature velocity
- **Mitigation**: Dedicated security resources, regular audits

**Review**: Security review required every 6 months or after any auth-related changes.

**TODO**: Revisit if [specific constraint] is resolved - migrate to managed solution.
```

**If proceeding with BetterAuth** (likely outcome):

```typescript
// lib/auth.ts
// Using BetterAuth for security-critical authentication.
// Self-hosted for data control, but leverages battle-tested library to avoid
// common auth vulnerabilities (timing attacks, token management, password reset flows).
//
// Migration from custom auth: BetterAuth supports importing existing bcrypt password hashes.
// Review security: https://better-auth.com/docs/security

import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database: db,
  // ... configuration
})
```

## Outcome

**Result**: User agrees to use BetterAuth for self-hosted auth with data control.

**Time saved**: 40+ hours initial implementation, countless hours of future security maintenance

**Security risk avoided**: High - custom auth implementations frequently have vulnerabilities

**Cost avoided**: Potential security breach, user data compromise, reputation damage

## Key Lessons

1. **Security-critical features favor proven solutions**: Auth, crypto, payments - use libraries
2. **"Control" doesn't require "custom"**: Self-hosted solutions provide control without risk
3. **Developer time is expensive**: Even "free" custom solutions have high hidden costs
4. **Future liability matters**: Auth breaches can be company-ending events
5. **Learning environments ≠ production**: Explore concepts in side projects, use proven solutions for users

## Red Flags That Triggered Escalation

- Security-critical system (◆◆ Hazard level)
- Many edge cases requiring expertise
- Proven alternatives exist
- High ongoing maintenance burden
- Potential for catastrophic failure
- User data at risk

## When Custom Auth Might Be Justified

Rare scenarios where custom auth is appropriate:
- Air-gapped military/government systems
- Regulatory requirement for specific implementation (must verify with legal)
- Integration with legacy enterprise auth system with no standard protocol
- Research on authentication methods (non-production)

Even then, build on top of secure primitives (Argon2, proven JWT libraries) rather than from scratch.
