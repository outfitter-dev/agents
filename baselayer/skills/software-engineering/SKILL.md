---
name: software-engineering
version: 1.0.0
description: Engineering judgment, decision-making principles, and code quality standards. Use when making architectural choices, evaluating trade-offs, determining implementation approaches, assessing code quality, or balancing speed vs thoroughness. Provides foundational senior engineer mindset covering when to proceed vs ask, when to refactor, security awareness, and avoiding over-engineering.
---

# Software Engineering

Engineering judgment → thoughtful decisions → quality code.

<when_to_use>

- Making architectural or design decisions
- Evaluating trade-offs between approaches
- Determining appropriate level of thoroughness
- Assessing when code needs refactoring
- Deciding when to ask vs proceed independently
- Balancing speed, quality, and maintainability

NOT for: mechanical tasks, clear-cut decisions, following explicit instructions

</when_to_use>

<principles>

Core engineering judgment framework.

**User preferences trump defaults**
`CLAUDE.md`, project rules, existing patterns always override skill suggestions. Read them first.

**Simplest thing that works**
Start with straightforward solution. Add complexity only when requirements demand it.
- Boring solutions for boring problems
- Proven libraries over custom implementations
- Progressive enhancement over big rewrites

**Read before write**
Understand existing codebase patterns before modifying.
- Check how similar features implemented
- Follow established conventions
- Maintain consistency with surrounding code

**Small, focused changes**
One idea per commit, typically 20–100 effective LOC, touching 1–5 files.
- Easy to review and understand
- Lower risk of introducing bugs
- Simpler to revert if needed
- Faster feedback cycles

**Security awareness**
Don't introduce vulnerabilities through careless implementation.
- Validate all external input
- Use parameterized queries
- Handle authentication/authorization properly
- No secrets in code or logs
- Consider attack vectors

**Know when to stop**
Ship working code, don't gold-plate.
- Implement requirements, not assumptions
- No unrequested features
- No speculative abstraction
- Refactor when needed, not preemptively

</principles>

<type_safety>

Type safety principles that apply across languages.

**Make illegal states unrepresentable**
The type system should prevent invalid data at compile time, not runtime. If a state combination is impossible, make it unexpressable in types.

**Type safety hierarchy**:
1. Correct — type-safe, no runtime type errors
2. Clear — self-documenting through types
3. Precise — exact types, not overly broad

**Parse, don't validate**
Transform untyped data into typed data at system boundaries. Once parsed into a type, trust the type throughout the codebase.

**Result types over exceptions**
Make errors explicit in function signatures. Callers should see from the type that a function can fail—don't hide failures in thrown exceptions.

**Discriminated unions for state**
Model mutually exclusive states as union types with a discriminator field. Prevents impossible state combinations (loading + error + data simultaneously).

**Branded types for domain concepts**
Wrap primitives in distinct types to prevent mixing (user IDs vs product IDs). Enforce validation at construction time.

**Runtime validation at boundaries**
External data (APIs, files, user input) enters the system untyped. Validate and parse at the boundary, then work with typed data internally.

See [type-patterns.md](references/type-patterns.md) for detailed concepts.
Load `typescript-dev/SKILL.md` for TypeScript-specific implementations.

</type_safety>

<decision_framework>

Systematic approach to engineering choices.

**Understand before deciding**
- What problem being solved?
- What constraints exist? (time, tech, team)
- What's already in codebase?
- What patterns does project use?

**Consider trade-offs**
No perfect solutions, only trade-offs:
- Speed vs robustness
- Simplicity vs flexibility
- Consistency vs optimization
- Time to implement vs time to maintain

**Recognize good-enough**
Perfect is enemy of shipped:
- Does it meet requirements?
- Is it maintainable by team?
- Is it tested adequately?
- Can it be improved incrementally?

If yes to all → ship it. Don't block on theoretical improvements.

**Document significant choices**
When making non-obvious decisions:
- Comment why, not what
- Note trade-offs considered
- Link to relevant discussions
- Flag assumptions made

Example:

```typescript
// Using simple polling instead of WebSocket because:
// - Simpler to implement and maintain
// - Acceptable for current 5-minute update interval
// - Can migrate to WebSocket if requirements tighten
```

</decision_framework>

<when_to_ask>

Balance autonomy with collaboration.

**Proceed independently when:**
- Task is clear and well-defined
- Approach follows existing patterns
- Changes are small and localized
- You understand requirements fully
- No security or data integrity risks

**Ask questions when:**
- Requirements ambiguous or incomplete
- Multiple approaches with unclear trade-offs
- Changes affect system architecture
- Security or compliance implications
- Unfamiliar domain or technology
- Conflicting information or constraints

**Escalate immediately when:**
- Security vulnerabilities discovered
- Data corruption or loss risk
- Breaking changes to public APIs
- Performance degradation detected
- Compliance violations possible

Don't guess on high-stakes decisions. Ask.

</when_to_ask>

<code_quality>

Standards that separate good from professional code.

**Type safety**
Make illegal states unrepresentable:

```typescript
// Bad: stringly-typed state
type Status = string;

// Good: discriminated union
type Status = 'pending' | 'approved' | 'rejected';

// Better: type-safe with data
type Request =
  | { status: 'pending' }
  | { status: 'approved'; by: User; at: Date }
  | { status: 'rejected'; reason: string };
```

**Error handling**
Every error path needs handling:

```typescript
// Bad: ignoring errors
await saveUser(user);

// Good: explicit handling
const result = await saveUser(user);
if (result.type === 'error') {
  logger.error('Failed to save user', result.error);
  return { type: 'error', message: 'Could not save user' };
}
```

**Naming**
Names reveal intent:
- Functions: verbs describing action (`calculateTotal`, `validateEmail`)
- Variables: nouns describing data (`userId`, `orderTotal`)
- Booleans: questions (`isValid`, `hasPermission`)
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase

**Function design**
Single responsibility, focused scope:
- Do one thing well
- 10–30 lines typical, max 50
- 3 parameters ideal, max 5
- Pure when possible (same input → same output)

**Comments**
Explain why, not what:

```typescript
// Bad
// Set user active to true
user.active = true;

// Good
// Mark user active to enable login after email verification
user.active = true;
```

</code_quality>

<refactoring>

When and how to improve existing code.

**Refactor when:**
- Adding new feature reveals poor structure
- Code duplicated 3+ times
- Function exceeds 50 lines
- Naming unclear or misleading
- Tests difficult to write
- Bug pattern repeating

**Don't refactor when:**
- Code works and won't be touched again
- Time-critical delivery in progress
- No test coverage to verify behavior
- Scope creep from main task
- Just personal preference, no clear benefit

**Refactoring guidelines:**
- Have tests first (or write them)
- One refactoring at a time
- Keep tests passing throughout
- Commit refactors separately from features
- Don't change behavior

Separate commits:

```bash
# Good: refactor separate from feature
git commit -m "refactor: extract user validation logic"
git commit -m "feat: add email verification"

# Bad: mixed changes
git commit -m "feat: add email verification and refactor validation"
```

</refactoring>

<testing>

Testing philosophy for senior engineers.

**Test the right things:**
- Public interfaces, not implementation
- Edge cases and error paths
- Critical business logic
- Integration points
- Security boundaries

**Don't over-test:**
- No tests for trivial getters/setters
- Don't test framework behavior
- Avoid brittle tests coupled to implementation

**Coverage targets:**
- Critical paths: 90%+
- Business logic: 80%+
- Utility functions: 80%+
- Overall project: 70%+

Low coverage acceptable for:
- Simple configuration
- Type definitions
- Framework boilerplate

</testing>

<performance>

Balance optimization with delivery.

**Premature optimization is root of all evil**
- Make it work first
- Make it right second
- Make it fast only if needed

**Optimize when:**
- Measured performance issue exists
- User experience degraded
- Resource costs excessive
- Profiler shows clear bottleneck

**Before optimizing:**
1. Measure current performance
2. Set target metrics
3. Profile to find bottleneck
4. Optimize specific bottleneck
5. Measure improvement
6. Document trade-offs

Don't optimize:
- "This might be slow someday"
- Based on gut feeling
- Without measurement
- Micro-optimizations that obscure code

</performance>

<security>

Security mindset for all code.

**Input validation:**
- Validate all external input
- Sanitize before processing
- Use allowlists, not blocklists
- Assume all user input malicious

**Authentication/Authorization:**
- Never trust client-side checks
- Verify permissions on server
- Use proven libraries (OAuth, JWT)
- Don't roll your own crypto

**Data handling:**
- Never log sensitive data
- Hash passwords with bcrypt/argon2
- Use parameterized queries (prevent SQL injection)
- Validate file uploads strictly

**Dependencies:**
- Keep dependencies updated
- Review security advisories
- Minimize dependency count
- Audit before adding new dependency

Red flags to escalate:
- Handling payment information
- Storing user credentials
- Processing health/financial data
- Implementing encryption
- Authentication/session management

</security>

<anti_patterns>

Common mistakes to avoid.

**Over-engineering:**
- Building features "we might need"
- Premature abstraction
- Excessive configuration
- "Enterprise" patterns for simple problems

Fix: YAGNI (You Aren't Gonna Need It). Build for today's requirements.

**Under-engineering:**
- No error handling
- No input validation
- Ignoring edge cases
- Copy-paste instead of function

Fix: Basic quality standards aren't optional. Handle errors, validate inputs.

**Scope creep:**
- "While I'm here, let me also..."
- Refactoring unrelated code
- Adding unrequested features
- Fixing unrelated issues

Fix: Stay focused. File issues for unrelated improvements.

**Guess-and-check:**
- Trying random solutions
- Copying without understanding
- No investigation of root cause

Fix: Use systematic debugging. Understand before changing.

**Analysis paralysis:**
- Endless design discussions
- Researching every option
- Waiting for perfect solution

Fix: Good enough + shipping > perfect + delayed. Iterate.

</anti_patterns>

<communication>

How senior engineers collaborate.

**Writing clear issues/PRs:**
- Context: What problem being solved?
- Approach: How solved it?
- Trade-offs: What alternatives considered?
- Testing: How verified?
- Impact: What could break?

**Code review:**
- Focus on correctness, clarity, security
- Suggest improvements, don't demand perfection
- Ask questions to understand reasoning
- Approve when good enough, note nice-to-haves separately

**When blocked:**
1. Try to unblock yourself (30 min)
2. Gather context (what tried, what failed)
3. Ask specific question with context
4. Propose potential solutions

**Saying no:**
- "That would work, but have you considered X?"
- "This introduces Y risk. Can we mitigate with Z?"
- "I recommend against this because..."

Back opinions with reasoning, stay open to being wrong.

</communication>

<workflow_integration>

Connect with other baselayer skills.

**With TDD:**
- Senior judgment: Is this worth testing?
- TDD skill: How to test it effectively

**With debugging:**
- Senior judgment: Is this worth fixing now?
- Debugging skill: How to investigate systematically

**With dev-* skills:**
- Senior judgment: What level of type safety appropriate? What patterns fit?
- typescript-dev: TypeScript implementation patterns
- react-dev: React component patterns
- hono-dev: API framework patterns
- bun-dev: Runtime-specific patterns

Software engineering skill provides the "why" and "when".
dev-* skills provide the "how" for specific technologies.

</workflow_integration>

<rules>

ALWAYS:
- Read `CLAUDE.md` and project rules first
- Follow existing codebase patterns
- Make small, focused changes
- Validate external input
- Handle errors explicitly
- Test critical paths
- Document non-obvious decisions
- Ask when uncertain on high-stakes issues

NEVER:
- Add features not in requirements
- Ignore error handling
- Skip input validation
- Commit secrets or credentials
- Guess on security decisions
- Refactor without tests
- Optimize without measuring
- Over-engineer simple solutions

</rules>

<references>

Complements other baselayer skills:

**Core Practices:**
- [test-driven-development/SKILL.md](../test-driven-development/SKILL.md) — test-driven development
- [debugging-and-diagnosis/SKILL.md](../debugging-and-diagnosis/SKILL.md) — systematic debugging
- [pathfinding/SKILL.md](../pathfinding/SKILL.md) — requirements clarification

**Development Skills** (load `dev-*/SKILL.md` for implementation patterns):
- [typescript-dev/SKILL.md](../typescript-dev/SKILL.md) — TypeScript patterns, Zod, modern features
- [react-dev/SKILL.md](../react-dev/SKILL.md) — React 18-19 patterns, hooks typing
- [hono-dev/SKILL.md](../hono-dev/SKILL.md) — Hono API framework patterns
- [bun-dev/SKILL.md](../bun-dev/SKILL.md) — Bun runtime APIs, SQLite, testing

**Type Safety Concepts:**
- [type-patterns.md](references/type-patterns.md) — language-agnostic type patterns

**Standards:**
- [FORMATTING.md](../../shared/`rules/`FORMATTING.md) — formatting conventions

</references>
