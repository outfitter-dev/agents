---
name: complexity-analysis
version: 1.0.0
description: Challenges over-engineering and identifies unnecessary complexity before implementation. Use when planning features, designing architecture, choosing frameworks, evaluating patterns, or when complexity, overengineering, simpler alternatives, `--complexity-analysis`, or `--keep-it-simple` are mentioned. Helps teams avoid technical debt by validating that complexity is justified.
---

# Challenge Complexity

Systematic pushback against over-engineering → justified simplicity.

<when_to_use>

- Planning features or architecture
- Choosing frameworks, libraries, patterns
- Evaluating proposed solutions
- Detecting premature optimization or abstraction
- Build vs buy decisions

NOT for: trivial tasks, clear requirements with validated complexity, regulatory/compliance-mandated approaches

</when_to_use>

<phases>

Track with TodoWrite when applying framework to non-trivial proposals:

| Phase | Trigger | activeForm |
|-------|---------|------------|
| Identify | Complexity smell detected | "Identifying complexity smell" |
| Alternative | Generating simpler options | "Proposing simpler alternatives" |
| Question | Probing constraints | "Questioning constraints" |
| Document | Recording decision | "Documenting decision" |

TodoWrite format:

```text
- Identify { complexity type } smell
- Propose alternatives to { specific approach }
- Question { constraint/requirement }
- Document { decision/rationale }
```

Workflow:
- Start: Create Identify `in_progress` when smell detected
- Transition: Mark current `completed`, add next `in_progress`
- Skip to Document if complexity validated immediately
- Optional phases: skip Alternative if obvious, skip Question if constraints clear

</phases>

<escalation>

Adjust tone based on severity:

◇ **Alternative** (Minor complexity):
> "Interesting approach. Help me understand why X over the more common Y?"

◆ **Caution** (Moderate risk):
> "This pattern often leads to [specific problems]. Are we solving for something I'm not seeing?"

◆◆ **Hazard** (High risk):
> "This violates [principle] and will likely cause [specific issues]. I strongly recommend [alternative]. If we must proceed, we need to document the reasoning."

</escalation>

<triggers>

Common complexity smells to watch for:

**Build vs Buy**: Custom solution when proven libraries exist
- Custom auth system → Auth0, Clerk, BetterAuth
- Custom validation → Zod, Valibot, ArkType
- Custom state management → Zustand, Jotai, Nanostores
- Custom form handling → React Hook Form, Formik

**Indirect Solutions**: Solving problem A by first solving problems B, C, D
- Compiling TS→JS then using JS → Use TS directly in build tool
- Reading file, transforming, writing back → Use stream processing
- Storing in DB to pass between functions → Pass data directly

**Premature Abstraction**: Layers "for flexibility" without concrete future requirements
- Plugin systems for 1 use case
- Factories for single implementations
- Dependency injection for stateless functions
- Generic repositories for 1 data source

**Performance Theater**: Optimizing without measurements or clear bottlenecks
- Caching before measuring load
- Debouncing without user complaints
- Worker threads for CPU-light tasks
- Memoization of cheap calculations

**Security Shortcuts**: Disabling security features instead of configuring properly
- `CORS: *` → Configure specific origins
- `any` types for external data → Runtime validation with Zod
- Disabling SSL verification → Fix certificate chain
- Storing secrets in code → Environment variables + vault

**Framework Overkill**: Heavy frameworks for simple tasks
- React for static content → HTML + CSS
- Redux for local UI state → useState
- GraphQL for simple CRUD → REST
- Microservices for small apps → Monolith first

**Custom Infrastructure**: Building platform features that cloud providers offer
- Custom logging → CloudWatch, Datadog
- Custom metrics → Prometheus, Grafana
- Custom secrets → AWS Secrets Manager, Vault
- Custom CI/CD → GitHub Actions, CircleCI

</triggers>

<red_flags>

Watch for these justifications — reframe with specific questions:

"We might need it later"
→ "What specific requirement do we have now?"

"It's more flexible"
→ "What flexibility do we need that the simple approach doesn't provide?"

"It's best practice"
→ "Best practice for what context? Does that context match ours?"

"It's faster"
→ "Have you measured? What's the performance requirement?"

"Everyone does it this way"
→ "For problems of this scale? Do they have our constraints?"

"It's more enterprise-ready"
→ "What enterprise requirement are we meeting?"

"I read about it on Hacker News"
→ "Does their problem match ours?"

</red_flags>

<patterns>

Guide toward simpler alternatives with concrete examples:

**Feature Flags over Plugin Architecture**

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

**Direct over Generic**

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

**Standard Library over Framework**

```typescript
// Complex
import _ from 'lodash'
const unique = _.uniq(array)
const mapped = _.map(array, fn)

// Simple
const unique = [...new Set(array)]
const mapped = array.map(fn)
```

**Composition over Configuration**

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

</patterns>

<justified>

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

</justified>

<workflow>

Apply this protocol systematically:

### 1. IDENTIFY → Recognize complexity smell

Scan proposal for common triggers:
- Build vs Buy
- Indirect Solutions
- Premature Abstraction
- Performance Theater
- Security Shortcuts
- Framework Overkill
- Custom Infrastructure

### 2. ALTERNATIVE → Propose simpler solutions

Always provide **concrete, specific alternatives** with examples:

❌ Vague: "Maybe use something simpler?"
✅ Specific: "Use Zod for validation instead of building a custom validation engine. Here's how..."

Include:
- Exact library/pattern name
- Code snippet showing simpler approach
- Why it's sufficient for actual requirements

### 3. QUESTION → Investigate constraints

Ask probing questions to uncover hidden requirements:
- "What specific requirement makes the simpler approach insufficient?"
- "What will break in 6 months if we use the standard pattern?"
- "What performance/scale problem are we solving?"
- "What security threat model requires this complexity?"
- "What team capability gap makes the standard approach unsuitable?"

### 4. DOCUMENT → Record decisions

If complexity chosen after validation:
- Document specific requirement that justifies it
- Add ADR (Architecture Decision Record) explaining trade-offs
- Include TODO for revisiting when requirements change
- Add comments explaining non-obvious complexity

</workflow>

<rules>

ALWAYS:
- Apply pushback protocol to non-trivial proposals
- Provide concrete alternatives with code examples
- Ask specific questions about constraints
- Match escalation level to severity (◇/◆/◆◆)
- Document justified complexity decisions

NEVER:
- Accept "might need it later" without concrete timeline
- Allow security shortcuts without threat model
- Skip questioning performance claims without measurements
- Proceed with indirection without clear justification
- Accept complexity without documenting why

</rules>

<references>

- [decision-framework.md](references/decision-framework.md) — full decision checklist
- [redux-overkill.md](examples/redux-overkill.md) — challenging Redux for simple form
- [custom-auth.md](examples/custom-auth.md) — challenging custom auth build

</references>
