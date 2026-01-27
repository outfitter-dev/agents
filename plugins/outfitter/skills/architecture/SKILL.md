---
name: architecture
description: This skill should be used when designing systems, evaluating architectures, making technology decisions, or planning for scale. Provides technology selection frameworks, scalability planning, and architectural tradeoff analysis.
metadata:
  version: "2.1.0"
---

# Software Architecture

Design question → options with tradeoffs → documented decision.

<when_to_use>

- Designing new systems or major features
- Evaluating architectural approaches
- Making technology stack decisions
- Planning for scale and performance
- Analyzing design tradeoffs

NOT for: trivial tech choices, premature optimization, undocumented requirements

</when_to_use>

<stages>

Load the **maintain-tasks** skill for stage tracking. Stages advance only, never regress.

| Stage | Trigger | activeForm |
|-------|---------|------------|
| Discovery | Session start | "Gathering requirements" |
| Codebase Analysis | Requirements clear | "Analyzing codebase" |
| Constraint Evaluation | Codebase understood | "Evaluating constraints" |
| Solution Design | Constraints mapped | "Designing solutions" |
| Documentation | Design selected | "Documenting architecture" |

Situational (insert before Documentation when triggered):
- Review & Refinement → feedback cycles on complex designs

Edge cases:
- Small questions: skip to Solution Design
- Greenfield: skip Codebase Analysis
- No ADR needed: skip Documentation
- Iteration: Review & Refinement may repeat

Task format:

```text
- Discovery { problem domain }
- Analyze { codebase area }
- Evaluate { constraint type }
- Design { solution approach }
- Document { decision type }
```

Workflow:
- Start: Create Discovery as `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- High start: skip to Solution Design for clear problems
- Optional end: Documentation skippable if ADR not needed

</stages>

<principles>

## Proven over Novel

Favor battle-tested over bleeding-edge without strong justification.

Checklist:
- 3+ years production at scale?
- Strong community + active maintenance?
- Available experienced practitioners?
- Total cost of ownership (learning, tooling, hiring)?

Red flags: "Early adopters" without time budget, "Written in X" without benchmarks, "Everyone's talking" without case studies.

## Complexity Budget

Each abstraction must provide 10x value.

Questions:
- What specific problem does this solve?
- Can we solve with existing tools/patterns?
- Maintenance burden (docs, onboarding, debugging)?
- Impact on incident response?

## Unix Philosophy

Small, focused modules with clear contracts, single responsibilities.

Checklist:
- Single, well-defined purpose?
- Describe in one sentence without "and"?
- Dependencies explicit and minimal?
- Testable in isolation?
- Clean, stable interface?

## Observability First

No system ships without metrics, tracing, alerting.

Required every service:
- Metrics: RED (Rate, Errors, Duration) for all endpoints
- Tracing: distributed traces with correlation IDs
- Logging: structured logs with context
- Alerts: SLO-based with runbooks
- Dashboards: at-a-glance health

## Modern by Default

Use contemporary proven patterns for greenfield, respect legacy constraints.

Patterns (2025):
- TypeScript strict mode for type safety
- Rust for performance-critical services
- Container deployment (Docker, K8s)
- Infrastructure as Code (Terraform, Pulumi)
- Distributed tracing (OpenTelemetry)
- Event-driven architectures

Legacy respect: document why legacy exists, plan incremental migration, don't rewrite what works.

## Evolutionary

Design for change with clear upgrade paths.

Practices:
- Version all APIs with deprecation policies
- Feature flags for gradual rollouts
- Design with migration paths in mind
- Deployment independent from release
- Automated compatibility testing

</principles>

<technology_selection_summary>

Load [technology-selection.md](references/technology-selection.md) for detailed guidance.

**Database**: Match data model to use case. PostgreSQL for ACID + complex queries. DynamoDB for flexibility + horizontal scaling. Redis for caching + pub/sub.

**Framework (TS)**: Hono for modern/serverless, Express for proven ecosystem, Fastify for speed, NestJS for enterprise.

**Framework (Rust)**: Axum for type-safe modern, Actix-web for raw performance.

**Frontend**: React + TanStack Router for complex apps, Solid for perf-critical, Next.js for SSR/SSG.

**Infrastructure**: Serverless for low-traffic/prototypes, K8s/ECS for multi-service at scale, PaaS for MVPs.

Selection criteria: team expertise, performance needs, ecosystem, type safety, deployment target.

</technology_selection_summary>

<design_patterns_summary>

Load [design-patterns.md](references/design-patterns.md) for detailed guidance.

**Service Decomposition**

Monolith first. Extract when hitting specific pain:
- Different scaling needs
- Different deployment cadences
- Team boundaries
- Technology constraints

Microservices: yes for 10+ engineers, clear domains, independent scaling. No for small teams, unclear domains.

**Communication**

| Pattern | Use when | Tradeoffs |
|---------|----------|-----------|
| Sync (REST, gRPC) | Immediate response needed | Tight coupling, cascading failures |
| Async (queues, streams) | Eventual consistency OK | Complexity, ordering challenges |
| Event-driven | Decoupling, audit trail | Event versioning, consistency |

**Data Management**

- Database per service: each service owns its data
- CQRS: separate read/write when patterns differ
- Event sourcing: when audit trail critical

</design_patterns_summary>

<scalability_summary>

Load [scalability.md](references/scalability.md) for detailed guidance.

**Key Metrics**: Latency (p50/p95/p99), throughput (RPS), utilization (CPU/mem/net/disk), error rates, saturation (queues, pools).

**Capacity Planning**: Baseline → load test → find limits → model growth → plan 30-50% headroom.

**Bottleneck Solutions**:

| Resource | Solutions |
|----------|-----------|
| Database | Indexing, read replicas, caching, sharding |
| CPU | Horizontal scale, algorithm optimization, async |
| Memory | Profiling, streaming, data structure optimization |
| Network | Compression, CDN, HTTP/2, gRPC |
| I/O | SSD, batching, async I/O, caching |

**Scaling Strategies**: Vertical (simple, limited), horizontal (stateless required), caching layers (L1/L2/L3), database scaling (replicas, sharding, pooling).

</scalability_summary>

<rust_summary>

Load [rust-architecture.md](references/rust-architecture.md) for detailed guidance.

**Choose Rust when**: Performance-critical, resource-constrained, memory safety critical, concurrent processing.

**Skip Rust when**: Prototype/MVP, small team without experience, standard CRUD, missing ecosystem libs.

**Stack**: tokio (runtime), axum/actix-web (framework), sqlx/diesel (database), serde (serialization), tracing (observability), thiserror/anyhow (errors).

**vs TypeScript**: Rust is 2-10x faster, 5-10x lower memory, compile-time bug detection, no GC. TS has faster iteration, massive ecosystem, easier hiring.

</rust_summary>

<common_patterns_summary>

Load [common-patterns.md](references/common-patterns.md) for detailed guidance.

| Pattern | Purpose |
|---------|---------|
| API Gateway | Single entry, routing, auth, rate limiting |
| BFF | Per-client backends with optimized data shapes |
| Circuit Breaker | Fail fast when downstream unhealthy |
| Saga | Distributed transactions across services |
| Strangler Fig | Gradual legacy migration via proxy |

</common_patterns_summary>

<implementation_summary>

Load [implementation-guidance.md](references/implementation-guidance.md) for detailed guidance.

**Phased Delivery**:
- MVP (2-4 wks): Core workflow, simplest architecture, validate problem-solution fit
- Beta (4-8 wks): Key features, monitoring, automated deploy, validate product-market fit
- Production (8-12 wks): Full features, reliability, auto-scaling, DR
- Optimization (ongoing): Performance tuning, cost optimization

**Critical Path**: Identify blocking dependencies, parallel workstreams, resource constraints, risk areas, decision points.

**Observability**: Metrics (RED), logging (structured + correlation IDs), tracing (OpenTelemetry), alerting (SLO-based + runbooks).

</implementation_summary>

<adr_summary>

Load [adr-template.md](references/adr-template.md) for the full template.

ADR structure:
- Status, Date, Deciders, Context
- Decision
- Alternatives Considered (with pros/cons/why not)
- Consequences (positive, negative, neutral)
- Implementation Notes
- Success Metrics
- Review Date

</adr_summary>

<questions_summary>

Load [questions-checklist.md](references/questions-checklist.md) for the full checklist.

**Requirements**: Core workflows, data storage, integrations, critical vs nice-to-have.

**Non-functional**: Users (now + 1-2 yrs), latency targets, availability (99.9%? 99.99%?), consistency, compliance.

**Constraints**: Existing systems, current tech, team expertise, deployment env, budget, timeline, acceptable debt.

**Technology Selection**: Why this over alternatives? Production experience? Operational complexity? Lock-in risk? Hiring?

**Risk**: Blast radius? Rollback strategy? Detection? Contingency? Assumptions? Cost of being wrong?

</questions_summary>

<workflow>

Use `EnterPlanMode` when presenting options — enables keyboard navigation.

Structure:
- Prose above tool: context, reasoning, recommendation
- Inside tool: 2-3 options with tradeoffs + "Something else"
- User selects: number, modifications, or combo

After user choice:
- Restate decision
- List implications
- Surface concerns if any
- Ask clarifying questions if gaps remain

Before documenting:
- Verify all options considered
- Confirm rationale is clear
- Check success metrics defined
- Validate migration path if applicable

At Documentation stage:
- Create ADR if architectural decision
- Skip if simple tech choice
- Mark stage complete after delivery

</workflow>

<rules>

ALWAYS:
- Create Discovery todo at session start
- Update todos at stage transitions
- Ask clarifying questions about requirements and constraints before proposing
- Present 2-3 viable options with clear tradeoffs
- Document decisions with rationale (ADR when appropriate)
- Consider immediate needs and future scale
- Evaluate team expertise and operational capacity
- Account for budget and timeline constraints

NEVER:
- Recommend bleeding-edge tech without strong justification
- Over-engineer solutions for current scale
- Skip constraint analysis (budget, timeline, team, existing systems)
- Propose architectures the team can't operate
- Ignore operational complexity in technology selection
- Proceed without understanding non-functional requirements
- Skip stage transitions when moving through workflow

</rules>

<references>

**Core**:

**Deep Dives**:
- [technology-selection.md](references/technology-selection.md) — database, framework, infrastructure selection
- [design-patterns.md](references/design-patterns.md) — service decomposition, communication, data management
- [scalability.md](references/scalability.md) — performance modeling, bottlenecks, scaling strategies
- [rust-architecture.md](references/rust-architecture.md) — when to use Rust, stack recommendations
- [common-patterns.md](references/common-patterns.md) — API Gateway, BFF, Circuit Breaker, Saga, Strangler
- [implementation-guidance.md](references/implementation-guidance.md) — phased delivery, observability
- [adr-template.md](references/adr-template.md) — Architecture Decision Record template
- [questions-checklist.md](references/questions-checklist.md) — requirements and risk questions

</references>
