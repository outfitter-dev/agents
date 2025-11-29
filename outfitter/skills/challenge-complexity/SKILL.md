---
name: challenge-complexity
description: Challenges over-engineering and identifies unnecessary complexity before implementation. Use when planning features, designing architecture, choosing frameworks, evaluating patterns, or when complexity, overengineering, simpler alternatives, `--challenge-complexity`, or `--keep-it-simple` are mentioned. Helps teams avoid technical debt by validating that complexity is justified.
---

# Challenge Complexity

## Quick Start

Before implementing any non-trivial solution, run through this framework:

1. **State your proposed approach** in one sentence
2. **Apply the complexity smell test** (see Common Triggers below)
3. **Generate simpler alternatives** (at least 2)
4. **Ask constraint questions** to validate if complexity is justified
5. **Choose the simplest approach** that meets actual requirements

**Example**:
```
Proposal: "Create a Redux store with sagas for a 3-field contact form"

Smell: Framework Overkill + Premature Abstraction
Alternatives:
  1. React useState hook for form state
  2. HTML form with basic validation
Questions:
  - Will this form scale to 20+ fields?
  - Do we need time-travel debugging?
  - Is there complex async orchestration?
Decision: Use useState unless questions reveal hidden requirements
```

## The Pushback Protocol

Apply this systematic approach to every proposal:

### 1. IDENTIFY → Recognize the complexity smell

Common patterns to watch for:
- **Build vs Buy**: Custom solution when proven libraries exist
- **Indirect Solutions**: Circuitous paths vs direct approaches
- **Premature Abstraction**: Layers without clear future requirements
- **Performance Theater**: Optimizing without measurements
- **Security Shortcuts**: Disabling features vs proper configuration
- **Framework Overkill**: Heavy tools for simple tasks
- **Custom Infrastructure**: Building what cloud providers offer

### 2. ALTERNATIVE → Propose simpler solutions

Always provide **concrete, specific alternatives** with examples:

❌ Vague: "Maybe use something simpler?"
✅ Specific: "Use Zod for validation instead of building a custom validation engine. Here's how..."

Include:
- Exact library/pattern name
- Code snippet showing the simpler approach
- Why it's sufficient for actual requirements

### 3. QUESTION → Investigate constraints

Ask probing questions to uncover hidden requirements:

- "What specific requirement makes the simpler approach insufficient?"
- "What will break in 6 months if we use the standard pattern?"
- "What performance/scale problem are we solving?"
- "What security threat model requires this complexity?"
- "What team capability gap makes the standard approach unsuitable?"

### 4. DOCUMENT → Record decisions

If complexity is chosen after validation:
- Document the specific requirement that justifies it
- Add ADR (Architecture Decision Record) explaining trade-offs
- Include TODO for revisiting when requirements change
- Add comments explaining non-obvious complexity

## Escalation Levels

Adjust tone based on severity:

🤔 **Curiosity** (Minor complexity):
> "Interesting approach. Help me understand why X over the more common Y?"

🫣 **Concern** (Moderate risk):
> "This pattern often leads to [specific problems]. Are we solving for something I'm not seeing?"

🫠 **Strong Objection** (High risk):
> "This violates [principle] and will likely cause [specific issues]. I strongly recommend [alternative]. If we must proceed, we need to document the reasoning."

## Common Complexity Triggers

### Build vs Buy
**Smell**: Building custom solutions when battle-tested libraries exist

**Questions**:
- "Why not use [proven library]?"
- "Do we have the team capacity to maintain this long-term?"
- "What unique requirement makes existing solutions insufficient?"

**Examples**:
- Custom auth system → Auth0, Clerk, BetterAuth
- Custom validation → Zod, Valibot, ArkType
- Custom state management → Zustand, Jotai, Nanostores
- Custom form handling → React Hook Form, Formik

### Indirect Solutions
**Smell**: Solving problem A by first solving problems B, C, and D

**Questions**:
- "Why not solve this directly?"
- "What prevents the straightforward approach?"
- "Is the indirection hiding complexity or creating it?"

**Examples**:
- Compiling TS→JS then using JS → Use TS directly in build tool
- Reading file, transforming, writing back → Use stream processing
- Storing in DB to pass between functions → Pass data directly

### Premature Abstraction
**Smell**: Adding layers "for flexibility" without concrete future requirements

**Questions**:
- "What specific future requirement needs this abstraction?"
- "Can we add this when we actually need it?"
- "Does YAGNI (You Aren't Gonna Need It) apply here?"

**Examples**:
- Plugin systems for 1 use case
- Factories for single implementations
- Dependency injection for stateless functions
- Generic repositories for 1 data source

### Performance Theater
**Smell**: Optimizing without measurements or clear bottlenecks

**Questions**:
- "What is the current measured performance?"
- "What is the performance requirement?"
- "Have we profiled to identify bottlenecks?"

**Examples**:
- Caching before measuring load
- Debouncing without user complaints
- Worker threads for CPU-light tasks
- Memoization of cheap calculations

### Security Shortcuts
**Smell**: Disabling security features instead of configuring properly

**Questions**:
- "What specific use case requires disabling this?"
- "What attack vector does this create?"
- "How do we configure this securely instead?"

**Examples**:
- `CORS: *` → Configure specific origins
- `any` types for external data → Runtime validation with Zod
- Disabling SSL verification → Fix certificate chain
- Storing secrets in code → Environment variables + vault

### Framework Overkill
**Smell**: Heavy frameworks for simple tasks

**Questions**:
- "What framework features do we actually need?"
- "Can we use a lighter alternative?"
- "What's the simplest tool that solves this?"

**Examples**:
- React for static content → HTML + CSS
- Redux for local UI state → useState
- GraphQL for simple CRUD → REST
- Microservices for small apps → Monolith first

### Custom Infrastructure
**Smell**: Building platform features that cloud providers offer

**Questions**:
- "Does [cloud provider] offer this?"
- "What unique requirement justifies custom build?"
- "Do we have ops expertise to maintain this?"

**Examples**:
- Custom logging → CloudWatch, Datadog
- Custom metrics → Prometheus, Grafana
- Custom secrets → AWS Secrets Manager, Vault
- Custom CI/CD → GitHub Actions, CircleCI

## Rationalization Red Flags

Watch for these common justifications for complexity:

❌ "We might need it later"
✅ "What specific requirement do we have now?"

❌ "It's more flexible"
✅ "What flexibility do we need that the simple approach doesn't provide?"

❌ "It's best practice"
✅ "Best practice for what context? Does that context match ours?"

❌ "It's faster"
✅ "Have you measured? What's the performance requirement?"

❌ "Everyone does it this way"
✅ "For problems of this scale? Do they have our constraints?"

❌ "It's more enterprise-ready"
✅ "What enterprise requirement are we meeting?"

❌ "I read about it on Hacker News"
✅ "Does their problem match ours?"

## Decision Framework

Use this checklist before committing to complex solutions:

### Requirements Check
- [ ] Can you state the actual requirement in one sentence?
- [ ] Is this requirement validated with users/stakeholders?
- [ ] Does the requirement exist today or "might exist someday"?

### Alternatives Check
- [ ] Have you listed at least 2 simpler alternatives?
- [ ] Have you tried the simplest approach first?
- [ ] Can you articulate why simpler approaches fail?

### Constraint Check
- [ ] What breaks with the simple approach?
- [ ] Is the constraint real or assumed?
- [ ] Can the constraint be changed?

### Cost Check
- [ ] What's the maintenance burden of this complexity?
- [ ] Do we have expertise to maintain this?
- [ ] What's the ramp-up time for new team members?

### Reversibility Check
- [ ] Can we start simple and add complexity later?
- [ ] What's the cost of changing direction?
- [ ] Is this decision reversible?

## Guiding Toward Simpler Alternatives

### Pattern: Feature Flags
**Instead of**: Complex plugin architecture for configurability
**Try**: Feature flags + conditional logic

```typescript
// Complex
interface Plugin { transform(data: Data): Data }
const plugins = loadPlugins()
let result = data
for (const plugin of plugins) { result = plugin.transform(result) }

// Simple
const features = getFeatureFlags()
let result = data
if (features.transformA) { result = transformA(result) }
if (features.transformB) { result = transformB(result) }
```

### Pattern: Direct Over Generic
**Instead of**: Generic abstraction layer
**Try**: Direct implementation, extract when needed

```typescript
// Complex (premature abstraction)
interface DataStore<T> { get(id: string): Promise<T> }
class PostgresStore<T> implements DataStore<T> { /* ... */ }
const users = new PostgresStore<User>({ /* config */ })

// Simple (direct, refactor later if needed)
async function getUser(id: string): Promise<User> {
  return await db.query('SELECT * FROM users WHERE id = $1', [id])
}
```

### Pattern: Standard Library Over Framework
**Instead of**: Framework for simple operations
**Try**: Language/runtime standard library

```typescript
// Complex
import _ from 'lodash'
const unique = _.uniq(array)
const mapped = _.map(array, fn)

// Simple
const unique = [...new Set(array)]
const mapped = array.map(fn)
```

### Pattern: Composition Over Configuration
**Instead of**: Complex configuration DSL
**Try**: Simple function composition

```typescript
// Complex
const pipeline = new Pipeline({
  steps: [
    { type: 'validate', rules: [...] },
    { type: 'transform', fn: 'normalize' },
    { type: 'save', destination: 'db' }
  ]
})

// Simple
const result = pipe(
  data,
  validate,
  normalize,
  save
)
```

## When Complexity Is Justified

Complexity is appropriate when:

1. **Measured Performance Need**: Profiling shows bottleneck, optimization addresses it
2. **Proven Scale Requirement**: Current scale breaking, specific metric to meet
3. **Regulatory Compliance**: Legal requirement for specific implementation
4. **Security Threat Model**: Documented threat that simpler approach doesn't address
5. **Integration Contract**: External system requires specific approach
6. **Team Expertise**: Team has deep expertise in complex pattern but not simple one

Even then:
- Document why in ADR
- Add TODO to revisit when constraints change
- Isolate complexity to smallest possible scope
- Provide escape hatches

## Integration with Brainstorming

For complex decision-making about alternatives:

Use `superpowers:brainstorming` or `brainstorming` skill to:
- Systematically explore solution space
- Build confidence through structured Q&A
- Validate assumptions before implementation
- Document decision rationale

**Pattern**: Challenge complexity first → Brainstorm if alternatives aren't obvious → Implement simplest validated approach

## Anti-Patterns to Watch

### The Résumé-Driven Development
**Smell**: "Let's use [new shiny tech] because it's cool"
**Fix**: Choose boring, proven technology for boring problems

### The Consultant Special
**Smell**: Complexity that creates job security
**Fix**: Value clarity and simplicity over job protection

### The Premature Optimization
**Smell**: "This might be slow in production"
**Fix**: Measure first, optimize if needed

### The Framework Fever
**Smell**: Multiple frameworks for overlapping concerns
**Fix**: Consolidate or eliminate unnecessary frameworks

### The Abstraction Astronaut
**Smell**: Layers upon layers "for future flexibility"
**Fix**: Solve today's problem today, refactor when tomorrow arrives

## Remember

**Boring is beautiful**: The best code is often the most boring
**Simple ≠ Easy**: Simple solutions take thought, complex ones are easy to stumble into
**YAGNI is real**: You Aren't Gonna Need It (until you actually do)
**Deletion is king**: The best code is deleted code
**Future-you will thank present-you**: For choosing clarity over cleverness

## Quick Reference Card

Before adding complexity, ask:

1. What's the **simplest thing** that could work?
2. What **specific requirement** makes the simple approach fail?
3. Can we **measure** the problem we're solving?
4. Can we **add complexity later** when actually needed?
5. Will **future maintainers** thank us or curse us?

**Default answer**: Choose the boring, simple, proven approach until you have concrete evidence otherwise.
