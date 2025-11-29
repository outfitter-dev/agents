# Example: Authentication System Design

**User**: "I want to add a new authentication system"

---

**[TodoWrite]** Session start — Create initial todo list:
- "Gather Context" (in_progress)
- "Synthesize Requirements" (pending)
- "Provide Deliverables" (pending)

---

**Q1**: What type of authentication are you considering?

*Why it matters — determines implementation complexity, security model, and dependencies*

* **1.** Username/password with sessions
  * Simple to implement, well-understood pattern
  * **⭐ Recommendation:** Best starting point for most apps
* **2.** OAuth 2.0 / Social login (Google, GitHub, etc.)
  * Better UX, delegates security concerns
  * Requires external provider integration
* **3.** JWT tokens with refresh mechanism
  * Stateless, scales well, good for APIs
  * More complex token management
* **4.** Combination (1 + 2)
  * Flexible, covers most use cases
  * More implementation work upfront

**User**: "2"

---

**Restatement**: You want to implement OAuth 2.0 social login, delegating authentication to providers like Google or GitHub.

**Assumptions**:
- Users will have accounts with common providers
- You're comfortable with external dependencies
- HTTPS is available for OAuth callbacks

**Confidence**: 🔴 72 — Low

**Open Questions**:
- Which OAuth providers to support?
- Do you need a fallback for users without social accounts?
- Is this for a web app, mobile app, or both?

**Decisions**:
- OAuth 2.0 social login approach

**Risks**:
- Provider outages could block login — Consider fallback strategy
- Privacy concerns if users distrust social login — May need username/password option

---

**Q2**: Which OAuth providers do you want to support?

*Why it matters — affects implementation effort and user coverage*

* **1.** Google only
  * Simplest implementation, single provider
  * Highest user coverage (billions of accounts)
  * **⭐ Recommendation:** Good starting point, can expand later
* **2.** Google + GitHub
  * Covers consumer and developer users
  * GitHub popular for developer-focused tools
* **3.** Google + GitHub + Microsoft
  * Comprehensive coverage for enterprise and consumer
  * More integration work and maintenance

**User**: "1 for now, but I want to make it easy to add more later"

---

**Restatement**: You'll start with Google OAuth only, but want the architecture to support adding additional providers easily in the future.

**Assumptions**:
- You'll use a standard OAuth library (like Passport.js or similar)
- Provider-agnostic user model (email as identifier)

**Confidence**: 🟡 78 — Medium

**Open Questions**:
- Do users need a fallback if they don't have Google accounts?
- Is this for a web app, mobile app, or both?
- Do you have Google Cloud setup or need help with that?

**Decisions**:
- OAuth 2.0 social login
- Start with Google, extensible architecture for future providers

**Risks**:
- Google-only may exclude some users — Consider fallback or quick provider additions
- OAuth library choice affects future extensibility — Pick one with good multi-provider support

---

**[TodoWrite]** Confidence reached 🟡 78 — Update todo list:
- "Gather Context" (completed)
- "Synthesize Requirements" (in_progress)
- "Provide Deliverables" (pending)

---

**Q3**: Do you need a fallback authentication method for users without Google accounts?

*Why it matters — affects user coverage and implementation scope*

* **1.** Google only, no fallback
  * Simplest implementation
  * May exclude users without/distrusting Google
* **2.** Add email/password as fallback
  * Covers all users
  * Requires password management (hashing, reset flow)
  * **⭐ Recommendation:** Best for broad user coverage
* **3.** Add "magic link" email authentication
  * No password management needed
  * Better UX than traditional passwords
  * Still requires email infrastructure

**User**: "2, I want to make sure everyone can sign up"

---

**Restatement**: You want dual authentication: Google OAuth as the primary method, with email/password as a fallback to ensure universal access.

**Assumptions**:
- Email verification required for email/password accounts
- Secure password storage (bcrypt/argon2)
- "Forgot password" flow needed

**Confidence**: 🟡 83 — Medium-High

**Open Questions**:
- Is this for web app, mobile app, or both?
- Do you have email sending infrastructure set up?

**Decisions**:
- OAuth 2.0 social login (Google first)
- Email/password fallback authentication
- Extensible architecture for future OAuth providers

**Risks**:
- Email infrastructure dependency for password resets — Needs reliable email service
- Dual auth methods = more code to maintain — Keep implementations modular

---

**Q4**: What platform(s) does this authentication need to support?

*Why it matters — affects token storage strategy and OAuth callback handling*

* **1.** Web app only
  * Can use httpOnly cookies for security
  * Standard OAuth redirect flow
  * **⭐ Recommendation:** Simplest if mobile isn't needed yet
* **2.** Web and mobile apps
  * Need JWT tokens for mobile
  * OAuth flow more complex on mobile
  * Consider refresh token strategy
* **3.** Web, mobile, and API access
  * Full JWT infrastructure required
  * API keys or OAuth scopes needed
  * Most comprehensive but most complex

**User**: "2, we have a React web app and a React Native mobile app"

---

**Restatement**: You need authentication for both a React web app and a React Native mobile app, requiring a cross-platform token strategy.

**Assumptions**:
- JWT tokens for cross-platform compatibility
- Secure token storage (httpOnly cookies for web, secure storage for mobile)
- Refresh token mechanism for long-lived sessions

**Confidence**: 🟢 87 — High

**Confidence threshold reached** — Ready to provide implementation plan.

---

**[TodoWrite]** Confidence reached 🟢 87 — Update todo list:
- "Gather Context" (completed)
- "Synthesize Requirements" (completed)
- "Provide Deliverables" (in_progress)

---

**Final Deliverable** (at 🟢 87):

### Authentication System Plan

**Architecture**:
1. **Dual authentication paths**:
   - OAuth 2.0 (Google) via standard flow
   - Email/password with bcrypt hashing

2. **Session management**:
   - JWT tokens for cross-platform compatibility
   - Access token (15min) + Refresh token (7 days)
   - httpOnly cookies for web security
   - Secure storage (Keychain/Keystore) for mobile

3. **User model**:
   - Email as primary identifier
   - Optional Google ID for OAuth users
   - Password hash only for email/password users
   - `authProvider` field: "google" | "email"

**Implementation steps**:
1. Set up Google OAuth app (Cloud Console)
2. Choose OAuth library (e.g., Passport.js for Node, or native OAuth for Rust)
3. Implement user registration/login flows
   - OAuth flow with PKCE for mobile
   - Email/password with bcrypt (12+ rounds)
4. Create JWT token generation and validation
   - Access token with user claims
   - Refresh token with rotation
5. Add "forgot password" flow
   - Email verification codes
   - Secure password reset tokens
6. Design unified UI for both auth methods
   - "Continue with Google" button
   - Email/password form fallback
   - Consistent across web and mobile

**Security considerations**:
- HTTPS required for all OAuth callbacks
- CSRF protection for web OAuth flow
- Rate limiting on auth endpoints
- Email verification for new accounts
- Secure password requirements (8+ chars, complexity)

**Next steps**:
1. Choose your backend framework (Node.js vs Rust based on performance needs)
2. Set up Google Cloud OAuth credentials
3. Select email service provider (SendGrid, AWS SES, etc.)
4. Start with OAuth library integration
5. Implement user model and database schema

**Technical decisions made**:
- ✅ OAuth 2.0 with Google (extensible for future providers)
- ✅ Email/password fallback for universal access
- ✅ JWT tokens for cross-platform compatibility
- ✅ React web + React Native mobile support
- ✅ Refresh token strategy for long-lived sessions

---

**[TodoWrite]** Deliverables provided — Update todo list:
- "Gather Context" (completed)
- "Synthesize Requirements" (completed)
- "Provide Deliverables" (completed)

---

**Session complete**. All requirements clarified, plan delivered with 🟢 87 confidence.
