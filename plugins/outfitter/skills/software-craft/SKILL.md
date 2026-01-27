---
name: software-craft
description: This skill should be used when making design decisions, evaluating trade-offs, assessing code quality, or when "engineering judgment" or "code quality" are mentioned.
metadata:
  version: "1.0.0"
---

# Software Engineering

Engineering judgment - thoughtful decisions - quality code.

<when_to_use>

- Making architectural or design decisions
- Evaluating trade-offs between approaches
- Determining appropriate level of thoroughness
- Assessing when code needs refactoring
- Deciding when to ask vs proceed independently
- Balancing speed, quality, maintainability

NOT for: mechanical tasks, clear-cut decisions, following explicit instructions

</when_to_use>

<principles>

Core engineering judgment framework.

**User preferences trump defaults**
`CLAUDE.md`, project rules, existing patterns always override skill suggestions.

**Simplest thing that works**
Start simple. Add complexity only when requirements demand.
- Boring solutions for boring problems
- Proven libraries over custom implementations
- Progressive enhancement over rewrites

**Read before write**
Understand existing patterns before modifying.
- Check how similar features implemented
- Follow established conventions
- Maintain consistency

**Small, focused changes**
One idea per commit, 20-100 LOC, 1-5 files.
- Easy to review/understand
- Lower bug risk
- Simpler to revert
- Faster feedback

**Security awareness**
Don't introduce vulnerabilities.
- Validate external input
- Parameterized queries
- Handle auth properly
- No secrets in code/logs

**Know when to stop**
Ship working code, don't gold-plate.
- Implement requirements, not assumptions
- No unrequested features
- No speculative abstraction

</principles>

<type_safety>

Type safety across languages.

**Core principle**: Make illegal states unrepresentable. Type system should prevent invalid data at compile time, not runtime.

**Hierarchy**: Correct (type-safe) - Clear (self-documenting) - Precise (not overly broad)

**Key patterns**:
- **Result types** - Errors explicit in signatures, not hidden in exceptions
- **Discriminated unions** - Mutually exclusive states with discriminator field
- **Branded types** - Distinct types for domain concepts (user ID vs product ID)
- **Parse, don't validate** - Transform untyped to typed at boundaries, trust types internally

See [type-patterns.md](references/type-patterns.md) for detailed concepts.
Load `typescript-dev/SKILL.md` for TypeScript implementations.

</type_safety>

<decision_framework>

Systematic approach to engineering choices.

**Understand before deciding**
- What problem being solved?
- What constraints exist?
- What's already in codebase?
- What patterns does project use?

**Consider trade-offs**
No perfect solutions:
- Speed vs robustness
- Simplicity vs flexibility
- Consistency vs optimization
- Implement time vs maintain time

**Recognize good-enough**
Perfect is enemy of shipped:
- Meets requirements?
- Maintainable by team?
- Tested adequately?
- Can improve incrementally?

If yes to all - ship it.

**Document significant choices**
Non-obvious decisions: comment why, note trade-offs, link discussions, flag assumptions.

</decision_framework>

<when_to_ask>

Balance autonomy with collaboration.

**Proceed independently**:
- Task clear and well-defined
- Approach follows existing patterns
- Changes small and localized
- Requirements fully understood
- No security/data integrity risks

**Ask questions**:
- Requirements ambiguous
- Multiple approaches, unclear trade-offs
- Changes affect architecture
- Security/compliance implications
- Unfamiliar domain/technology

**Escalate immediately**:
- Security vulnerabilities discovered
- Data corruption/loss risk
- Breaking changes to public APIs
- Performance degradation detected

Don't guess on high-stakes decisions.

</when_to_ask>

<code_quality>

Standards separating good from professional code.

**Type safety**: Make illegal states unrepresentable via discriminated unions, branded types.

**Error handling**: Every error path needs explicit handling. No silent failures.

**Naming**: Functions=verbs (`calculateTotal`), variables=nouns (`userId`), booleans=questions (`isValid`).

**Function design**: One thing well. 10-30 lines typical, max 50. 3 params ideal, max 5. Pure when possible.

**Comments**: Explain why, not what.

See [code-quality-patterns.md](references/code-quality-patterns.md) for examples.

</code_quality>

<refactoring>

When and how to improve existing code.

**Refactor when**:
- Adding feature reveals poor structure
- Code duplicated 3+ times
- Function exceeds 50 lines
- Naming unclear/misleading
- Tests difficult to write

**Don't refactor when**:
- Code works and won't be touched
- Time-critical delivery in progress
- No test coverage to verify
- Scope creep from main task
- Just preference, no clear benefit

**Guidelines**:
- Have tests first (or write them)
- One refactoring at a time
- Keep tests passing throughout
- Commit refactors separately from features
- Don't change behavior

</refactoring>

<testing>

Testing philosophy.

**Test the right things**:
- Public interfaces, not implementation
- Edge cases and error paths
- Critical business logic
- Integration points
- Security boundaries

**Don't over-test**:
- No tests for trivial getters/setters
- Don't test framework behavior
- Avoid brittle implementation-coupled tests

**Coverage targets**:
- Critical paths: 90%+
- Business logic: 80%+
- Utility functions: 80%+
- Overall: 70%+

Low coverage acceptable for: config, type definitions, framework boilerplate.

</testing>

<performance>

Balance optimization with delivery.

**Premature optimization is root of evil**
- Make it work first
- Make it right second
- Make it fast only if needed

**Optimize when**:
- Measured performance issue exists
- User experience degraded
- Resource costs excessive
- Profiler shows clear bottleneck

**Before optimizing**:
1. Measure current performance
2. Set target metrics
3. Profile to find bottleneck
4. Optimize specific bottleneck
5. Measure improvement
6. Document trade-offs

Don't optimize based on gut feeling or without measurement.

</performance>

<security>

Security mindset for all code.

**Input validation**: Validate all external input, sanitize before processing, allowlists over blocklists.

**Auth**: Never trust client-side checks, verify on server, use proven libraries, don't roll your own crypto.

**Data handling**: Never log sensitive data, hash passwords (bcrypt/argon2), parameterized queries, strict file upload validation.

**Dependencies**: Keep updated, review advisories, minimize count, audit before adding.

**Red flags to escalate**: Payment info, user credentials, health/financial data, encryption implementation, session management.

</security>

<anti_patterns>

Common mistakes to avoid.

**Over-engineering**: Building "might need" features, premature abstraction, excessive config, enterprise patterns for simple problems.
Fix: YAGNI. Build for today.

**Under-engineering**: No error handling, no input validation, ignoring edge cases, copy-paste over functions.
Fix: Basic quality isn't optional.

**Scope creep**: "While I'm here...", refactoring unrelated code, adding unrequested features.
Fix: Stay focused. File issues for unrelated work.

**Guess-and-check**: Random solutions, copying without understanding, no root cause investigation.
Fix: Systematic debugging. Understand before changing.

**Analysis paralysis**: Endless design discussions, researching every option, waiting for perfect.
Fix: Good enough + shipping > perfect + delayed.

</anti_patterns>

<communication>

Senior engineer collaboration.

**Clear issues/PRs**: Context (problem), approach (solution), trade-offs (alternatives), testing (verification), impact (risks).

**Code review**: Focus on correctness/clarity/security. Suggest, don't demand perfection. Approve when good enough.

**When blocked**: Try 30 min self-unblock, gather context, ask specific question with context, propose solutions.

**Saying no**: "That would work, but have you considered X?" / "This introduces Y risk. Can we mitigate with Z?"

Back opinions with reasoning. Stay open to being wrong.

</communication>

<workflow_integration>

Connect with other outfitter skills.

**With TDD**: Senior judgment decides what's worth testing. TDD skill provides how.

**With debugging**: Senior judgment decides if worth fixing now. Debugging skill provides systematic investigation.

**With dev-* skills**: Software engineering provides the "why" and "when". dev-* skills provide the "how" for specific technologies (typescript-dev, react-dev, hono-dev, bun-dev).

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
- Ask when uncertain on high-stakes

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

Complements other outfitter skills:

**Core Practices:**
- [tdd/SKILL.md](../tdd/SKILL.md) - TDD methodology
- [debugging/SKILL.md](../debugging/SKILL.md) - systematic debugging
- [pathfinding/SKILL.md](../pathfinding/SKILL.md) - requirements clarification

**Development Skills** (load for implementation patterns):
- [typescript-dev/SKILL.md](../typescript-dev/SKILL.md) - TypeScript, Zod, modern features
- [react-dev/SKILL.md](../react-dev/SKILL.md) - React 18-19, hooks typing
- [hono-dev/SKILL.md](../hono-dev/SKILL.md) - Hono API framework
- [bun-dev/SKILL.md](../bun-dev/SKILL.md) - Bun runtime, SQLite, testing

**Detailed Patterns:**
- [type-patterns.md](references/type-patterns.md) - language-agnostic type patterns
- [code-quality-patterns.md](references/code-quality-patterns.md) - code examples

**Standards:**

</references>
