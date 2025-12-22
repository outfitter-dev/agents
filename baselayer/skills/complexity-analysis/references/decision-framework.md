# Decision Framework

Comprehensive checklist before committing to complex solutions.

## Requirements Check

Validate that complexity addresses real, current needs.

- [ ] **Can you state the actual requirement in one sentence?**
  - If not: Requirements are unclear, gather more context
  - If yes: Proceed to verify

- [ ] **Is this requirement validated with users/stakeholders?**
  - Source: User research, stakeholder approval, or product spec?
  - If assumption: Validate before building

- [ ] **Does the requirement exist today or "might exist someday"?**
  - Today: Proceed with validation
  - Someday: Apply YAGNI - build when needed

- [ ] **What's the cost of being wrong about this requirement?**
  - Low cost: Start simple, iterate
  - High cost: Validate thoroughly first

## Alternatives Check

Ensure you've explored simpler options.

- [ ] **Have you listed at least 2 simpler alternatives?**
  - Standard library solution
  - Proven third-party library
  - Simpler architectural pattern
  - Direct implementation without abstraction

- [ ] **Have you tried the simplest approach first?**
  - If no: Why not? Time pressure isn't sufficient justification
  - If yes: What specific limitation did you hit?

- [ ] **Can you articulate why simpler approaches fail?**
  - Vague discomfort: Not sufficient
  - "Might not scale": Measure first
  - Specific technical limitation: Document it

- [ ] **Have you checked if the problem is already solved?**
  - Search npm/crates.io/PyPI for existing solutions
  - Check framework documentation for built-in features
  - Ask: "Is this a solved problem?"

## Constraint Check

Verify constraints are real, not assumed.

- [ ] **What breaks with the simple approach?**
  - Be specific: Which requirement? Which scenario?
  - If "nothing specific": Choose simple approach

- [ ] **Is the constraint real or assumed?**
  - Real: Measured, tested, validated
  - Assumed: "Might be slow", "Could be a problem", "Best practice says"
  - Test assumptions before building for them

- [ ] **Can the constraint be changed?**
  - Technical constraints: Often negotiable
  - Business constraints: Sometimes based on outdated assumptions
  - Political constraints: Navigate carefully, but challenge when appropriate

- [ ] **Who validated this constraint?**
  - You: Verify with others
  - Stakeholder: Confirm understanding
  - Documentation: Check if still current
  - "Everyone knows": Verify, might be outdated

## Cost Check

Evaluate long-term maintenance burden.

- [ ] **What's the maintenance burden of this complexity?**
  - How many LOC?
  - How many dependencies?
  - How many edge cases?
  - How often will this need updates?

- [ ] **Do we have expertise to maintain this?**
  - Team has experience: Lower risk
  - Team learning: Higher risk, needs documentation
  - Will depend on one person: Bus factor risk

- [ ] **What's the ramp-up time for new team members?**
  - Simple/standard patterns: Days
  - Custom/complex patterns: Weeks or months
  - Is the complexity worth the onboarding cost?

- [ ] **What's the cost of being wrong?**
  - Easy to change: Low risk, can experiment
  - Hard to change: High risk, validate thoroughly
  - Irreversible: Maximum risk, need strong justification

## Reversibility Check

Prefer decisions that can be changed later.

- [ ] **Can we start simple and add complexity later?**
  - Usually: Yes - this is the preferred path
  - Sometimes: Architectural decisions harder to reverse
  - Rarely: Truly irreversible (database choice, language choice)

- [ ] **What's the cost of changing direction?**
  - Low (<1 day): Experiment freely
  - Medium (1 week): Validate first, change if needed
  - High (>1 week): Requires strong justification

- [ ] **Is this decision reversible?**
  - Reversible: Start simple, learn, iterate
  - Irreversible: Invest in thorough validation
  - Document why if choosing complex approach for reversible decision

- [ ] **What would convince us to reverse this decision?**
  - Define success/failure criteria upfront
  - Set review timeline
  - Avoid sunk cost fallacy

## Scale Check

Don't optimize for scale you don't have.

- [ ] **What's the current scale?**
  - Users: 10? 1,000? 1,000,000?
  - Requests/sec: 1? 100? 10,000?
  - Data size: KB? GB? TB?

- [ ] **What scale does this solution target?**
  - Match current scale first
  - Optimize when measurements show need

- [ ] **What's the growth timeline?**
  - Weeks: Plan for scale now
  - Months: Build for 10x current, refactor at 100x
  - Years: Build for current, refactor when needed
  - Unknown: Build for current scale

- [ ] **Have you measured the performance bottleneck?**
  - No measurement: Premature optimization
  - Measured: Optimize the actual bottleneck
  - Assumed: Test assumption first

## Security Check

Security complexity requires special validation.

- [ ] **What's the threat model?**
  - Who are you protecting against?
  - What assets are at risk?
  - What's the impact of compromise?

- [ ] **Does this security measure address a real threat?**
  - Real: Documented, likely, high-impact
  - Theoretical: Low priority
  - Paranoia: Probably unnecessary

- [ ] **Is this a solved problem in security?**
  - Auth, crypto, secrets management: Use proven libraries
  - Custom security: Requires security expert review

- [ ] **What's the cost of getting security wrong?**
  - User data exposure: Use proven solutions
  - Low risk: Can be more experimental
  - Regulatory: Consult compliance expert

## Team Check

Complexity affects team velocity and morale.

- [ ] **Does the team understand this solution?**
  - Yes: Lower risk
  - Partially: Needs documentation
  - No: Training required or consider simpler approach

- [ ] **Is this pattern used elsewhere in the codebase?**
  - Yes: Consistency is valuable
  - No: Inconsistency has a cost, needs justification

- [ ] **Will the team thank you or curse you in 6 months?**
  - Thank you: Clear, maintainable, appropriate
  - Curse you: Clever, complex, hard to modify

- [ ] **What happens if the expert leaves?**
  - Well-documented: Manageable
  - Tribal knowledge: Bus factor risk
  - Documented externally (framework): Lower risk

## Integration Check

Consider ecosystem and dependencies.

- [ ] **How many dependencies does this add?**
  - 0-1: Low risk
  - 2-5: Medium, evaluate maintenance
  - 6+: High, consider consolidation

- [ ] **Are dependencies actively maintained?**
  - Check last commit, issue response time
  - Consider: Age, popularity, team size
  - Unmaintained: Risk or opportunity to fork

- [ ] **What's the total dependency tree size?**
  - Use `npm ls` or equivalent
  - Large trees = more security surface, slower installs
  - Consider: Tree-shakeable alternatives

- [ ] **Does this lock us into a specific ecosystem?**
  - Framework-specific: Consider portability cost
  - Standard/portable: Easier to migrate later
  - Vendor lock-in: Requires strong business justification

## Documentation Check

Complex solutions need clear documentation.

- [ ] **Can you explain why in 2 sentences?**
  - Yes: Good sign
  - No: May be too complex or poorly understood

- [ ] **Is there a simpler explanation you're avoiding?**
  - "It's just better": Not sufficient
  - "Best practice": For what context?
  - "More flexible": For what use case?

- [ ] **What will you document?**
  - Why this approach (most important)
  - How it works
  - When to modify/extend
  - When to replace

- [ ] **Who will maintain the documentation?**
  - Plan for keeping docs current
  - Outdated docs worse than no docs

## The Ultimate Question

- [ ] **If you had to maintain this code for the next 5 years, would you still choose this approach?**

If the answer is "no" or "I'm not sure", reconsider.

## Quick Decision Matrix

Use this matrix for fast assessment:

| Complexity | Justification Required |
|-----------|----------------------|
| **Low**: Standard library, proven pattern | None - proceed |
| **Medium**: Well-known framework, common pattern | Brief rationale in code comment |
| **High**: Custom abstraction, novel pattern | ADR with alternatives considered |
| **Very High**: Custom infrastructure, security-critical | ADR + external review + approval |

## When in Doubt

Default answers for common questions:

- **"Should we build or buy?"** → Buy (unless unique requirement validated)
- **"Should we abstract this?"** → Not yet (wait for 3rd use case)
- **"Should we optimize this?"** → Measure first (might not be bottleneck)
- **"Should we use this new technology?"** → Not for production (try in side project first)
- **"Should we make this configurable?"** → No (YAGNI - add when needed)

## Review Triggers

Set calendar reminders to review complex decisions:

- **1 month**: Quick check - still appropriate?
- **3 months**: Did we use the "flexibility" we built for?
- **6 months**: Is this paying off or causing pain?
- **12 months**: Keep, simplify, or replace?

## Red Flags

Stop and reconsider if you hear:

- "We might need it later"
- "It's more flexible"
- "It's best practice"
- "Everyone does it this way"
- "It's enterprise-ready"
- "I read about it on Hacker News"
- "It's the latest trend"
- "It looks good on my resume"

These are rationalization, not requirements.

## Green Flags

Complexity may be justified if:

- Measured performance bottleneck
- Proven scale requirement with timeline
- Regulatory compliance (validated with legal)
- Security threat model (validated with security team)
- Integration contract (external system requirement)
- Team expertise (already fluent, not learning)

Even then, choose the simplest solution that meets the requirement.

## Remember

**The best code is no code.**
**The second best code is boring code.**
**The worst code is clever code.**

Choose boring, simple, proven solutions until you have concrete evidence otherwise.
