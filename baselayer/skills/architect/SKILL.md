---
name: Architect
version: 2.0.0
description: System design guidance with technology selection frameworks and scalability planning. Use when designing systems, evaluating architectures, making technology decisions, planning for scale, analyzing tradeoffs, or when architecture, system design, tech stack, scalability, microservices, or `--architect` are mentioned.
---

# Architect

Design question → options with tradeoffs → documented decision.

<when_to_use>
- Designing new systems or major features
- Evaluating architectural approaches
- Making technology stack decisions
- Planning for scale and performance
- Analyzing design tradeoffs

NOT for: trivial tech choices, premature optimization, undocumented requirements
</when_to_use>

<phases>
Track with TodoWrite. Advance only, never regress.

| Phase | Trigger | activeForm |
|-------|---------|------------|
| Discovery | Session start | "Gathering requirements" |
| Codebase Analysis | Requirements clear | "Analyzing codebase" |
| Constraint Evaluation | Codebase understood | "Evaluating constraints" |
| Solution Design | Constraints mapped | "Designing solutions" |
| Documentation | Design selected | "Documenting architecture" |

Situational (insert before Documentation when triggered):
- Review & Refinement → feedback cycles on complex designs

Edge cases:
- Small questions: skip directly to Solution Design
- Greenfield: skip Codebase Analysis
- No ADR needed: skip Documentation phase
- Iteration: Review & Refinement may repeat

TodoWrite format:
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
</phases>

<principles>
Proven over Novel — favor battle-tested over bleeding-edge without strong justification.

Framework:
- 3+ years production at scale?
- Strong community + active maintenance?
- Available experienced practitioners?
- Total cost of ownership (learning, tooling, hiring)?

Red flags:
- "Early adopters" without time budget
- "Written in X" without benchmarks
- "Everyone's talking" without case studies

Complexity Budget — each abstraction must provide 10x value.

Questions:
- What specific problem does this solve?
- Can we solve with existing tools/patterns?
- Maintenance burden (docs, onboarding, debugging)?
- Impact on debugging and incident response?

Unix Philosophy — small, focused modules with clear contracts, single responsibilities.

Checklist:
- Single, well-defined purpose?
- Describe in one sentence without "and"?
- Dependencies explicit and minimal?
- Testable in isolation?
- Clean, stable interface?

Observability First — no system ships without metrics, tracing, alerting.

Required every service:
- Metrics: RED (Rate, Errors, Duration) for all endpoints
- Tracing: distributed traces with correlation IDs
- Logging: structured logs with context
- Alerts: SLO-based with runbooks
- Dashboards: at-a-glance health

Modern by Default — use contemporary proven patterns for greenfield, respect legacy constraints.

Patterns (2025):
- TypeScript strict mode for type safety
- Rust for performance-critical services
- Container deployment (Docker, K8s)
- Infrastructure as Code (Terraform, Pulumi)
- Distributed tracing (OpenTelemetry)
- Event-driven architectures

Legacy respect:
- Document why legacy exists
- Plan incremental migration
- Don't rewrite what works reliably

Evolutionary — design for change with clear upgrade paths.

Practices:
- Version all APIs with deprecation policies
- Feature flags for gradual rollouts
- Design with migration paths in mind
- Deployment independent from release
- Automated compatibility testing
</principles>

<technology_selection>
Database Selection

Decision factors:

1. Data model fit
   - Relational (structured, ACID, complex queries) → PostgreSQL, MySQL
   - Document (flexible schema, nested data) → MongoDB, DynamoDB
   - Graph (relationship-heavy) → Neo4j, DGraph
   - Time-series (metrics, events) → TimescaleDB, InfluxDB
   - Key-value (simple lookups, cache) → Redis, DynamoDB

2. Consistency requirements
   - Strong consistency → PostgreSQL, CockroachDB
   - Eventual consistency acceptable → DynamoDB, Cassandra
   - Hybrid needs → MongoDB, Cosmos DB

3. Scale characteristics
   - Read-heavy → read replicas, caching
   - Write-heavy → sharding, write-optimized DB
   - Both → consider CQRS pattern

4. Operational complexity
   - Managed service available? Use it unless special needs
   - Self-hosted required? Factor operational overhead
   - Multi-region? Consider distributed databases

Decision matrix:
```
ACID + complex queries + proven? → PostgreSQL
Flexibility + horizontal scaling + managed? → DynamoDB
Document model + rich queries + open source? → MongoDB
High write throughput + wide column? → Cassandra
Caching + pub/sub + simple data? → Redis
```

Framework Selection

Backend (TypeScript/JavaScript):
- Hono (modern, fast, edge) — best for new projects, serverless
- Express (proven, massive ecosystem) — best for teams with Express experience
- Fastify (performance-focused) — best when raw speed matters
- NestJS (structured, enterprise) — best for large teams, complex domains

Backend (Rust):
- Axum (modern, tokio-based) — best for new projects, type-safe routing
- Actix-web (mature, fast) — best when raw performance critical
- Rocket (ergonomic, batteries-included) — best for rapid development

Decision criteria:
- Team expertise and learning curve
- Performance requirements (most apps don't need Rust speed)
- Ecosystem and library availability
- Type safety and developer experience
- Deployment target (serverless, containers, bare metal)

Frontend:
- React + TanStack Router — complex state, large ecosystem
- Solid — performance-critical UIs
- Svelte — small teams, simple apps
- Next.js — SSR/SSG needs, full-stack React

Infrastructure

Serverless (Vercel, Cloudflare Workers, AWS Lambda):
- ✓ Zero ops, auto-scaling, pay-per-use
- ✗ Cold starts, vendor lock-in, harder debugging
- Best for: low-traffic apps, edge functions, prototypes

Container orchestration (Kubernetes, ECS):
- ✓ Portability, fine control, proven at scale
- ✗ Operational complexity, learning curve
- Best for: medium-large apps, multi-service systems

Platform-as-a-Service (Heroku, Render, Railway):
- ✓ Simple deploys, managed infrastructure
- ✗ Higher cost, less control, scaling limits
- Best for: startups, MVPs, small teams

Bare metal / VMs:
- ✓ Full control, cost-effective at scale
- ✗ High operational burden
- Best for: special requirements, very large scale
</technology_selection>

<design_patterns>
Service Decomposition

Monolith first, then extract:
1. Start with well-organized monolith
2. Identify bounded contexts as you learn domain
3. Extract when hitting specific pain:
   - Different scaling needs (one service needs 10x instances)
   - Different deployment cadences (ML model updates vs API)
   - Team boundaries (separate teams, separate services)
   - Technology constraints (need Rust for one component)

When to use microservices:
- ✓ Large team (10+ engineers)
- ✓ Clear domain boundaries
- ✓ Independent scaling needs
- ✓ Polyglot requirements
- ✗ Small team (<5 engineers)
- ✗ Unclear domain
- ✗ Premature optimization

Communication Patterns

Synchronous (REST, GraphQL, gRPC):
- Use when: immediate response needed, simple request-response
- Tradeoffs: tight coupling, cascading failures, latency compounds
- Mitigation: circuit breakers, timeouts, retries with backoff

Asynchronous (message queues, event streams):
- Use when: eventual consistency acceptable, high volume, decoupling needed
- Tradeoffs: complexity, harder debugging, ordering challenges
- Patterns: message queues (RabbitMQ, SQS), event streams (Kafka, Kinesis)

Event-driven architecture:
- Core: services publish events, others subscribe
- Benefits: loose coupling, easy to add consumers, audit trail
- Challenges: eventual consistency, event versioning, ordering
- Best practices:
  - Schema registry for event contracts
  - Include correlation IDs for tracing
  - Design idempotent consumers
  - Plan for out-of-order delivery

Data Management

Database per service:
- Each service owns its data
- No direct database access across services
- Communication via APIs or events
- Tradeoff: data consistency challenges, no joins across services

Shared database (anti-pattern for microservices):
- Multiple services access same database
- Only acceptable: transitioning from monolith
- Migration path: add service layer, restrict direct access

CQRS (Command Query Responsibility Segregation):
- Separate write model from read model
- Use when: read/write patterns very different, complex queries needed
- Implementation: write to normalized DB, project to read-optimized views

Event Sourcing:
- Store events, not current state
- Rebuild state by replaying events
- Use when: audit trail critical, temporal queries needed
- Challenges: migration complexity, eventual consistency
</design_patterns>

<scalability>
Performance Modeling

Key metrics:
- Latency: p50, p95, p99 response times
- Throughput: requests per second
- Resource utilization: CPU, memory, network, disk I/O
- Error rates: 4xx, 5xx responses
- Saturation: queue depths, connection pools

Capacity planning:
1. Baseline: measure current performance under normal load
2. Load test: use realistic traffic patterns (gradual ramp, spike, sustained)
3. Find limits: identify bottlenecks (CPU? DB? Network?)
4. Model growth: project based on business metrics (users, transactions)
5. Plan headroom: maintain 30–50% capacity buffer

Bottleneck Identification

Database:
- Symptoms: high query latency, connection pool exhaustion
- Solutions: indexing, query optimization, read replicas, caching, sharding

CPU:
- Symptoms: high CPU utilization, slow processing
- Solutions: horizontal scaling, algorithm optimization, caching, async processing

Memory:
- Symptoms: OOM errors, high GC pressure
- Solutions: memory profiling, data structure optimization, streaming processing

Network:
- Symptoms: high bandwidth usage, slow transfers
- Solutions: compression, CDN, protocol optimization (HTTP/2, gRPC)

I/O:
- Symptoms: disk queue depth, slow reads/writes
- Solutions: SSD, batching, async I/O, caching

Scaling Strategies

Vertical scaling (bigger machines):
- ✓ Simple, no code changes
- ✗ Expensive, hard limits, single point of failure
- Use when: quick fix needed, not yet optimized

Horizontal scaling (more machines):
- ✓ Cost-effective, no hard limits, fault tolerant
- ✗ Requires stateless design, load balancing complexity
- Requirements: stateless services, shared state in DB/cache

Caching layers:
- L1 (Application): in-memory, fastest, stale risk
- L2 (Distributed): Redis, Memcached, shared across instances
- L3 (CDN): CloudFlare, CloudFront, edge caching
- Strategy: cache-aside, write-through, write-behind based on needs

Database scaling:
- Read replicas: route reads to replicas, writes to primary
- Sharding: partition data across databases (customer, geography, hash)
- Connection pooling: PgBouncer, connection reuse
- Query optimization: indexes, query tuning, explain plans
</scalability>

<rust_architecture>
When to Choose Rust

Strong fit:
- Performance-critical services (compute-heavy, low-latency)
- Resource-constrained environments
- Systems programming needs
- Memory safety critical (no GC pauses)
- Concurrent processing with correctness guarantees

May not be worth it:
- Prototype/MVP phase (slower iteration)
- Small team without Rust experience
- Standard CRUD API (TS faster to develop)
- Heavy dependency on ecosystem libraries only in other languages

Stack Recommendations

Web services:
- Runtime: `tokio` (async runtime, de facto standard)
- Web framework: `axum` (modern, type-safe) or `actix-web` (mature, fast)
- Database: `sqlx` (compile-time checked queries), `diesel` (full ORM)
- Serialization: `serde` with `serde_json`, `bincode` for binary
- Observability: `tracing` + `tracing-subscriber` for structured logging
- Error handling: `thiserror` for libraries, `anyhow` for applications

Project structure:
```
my-service/
├── Cargo.toml          # Workspace manifest
├── crates/
│   ├── api/            # HTTP handlers, routing
│   ├── domain/         # Business logic, pure Rust
│   ├── persistence/    # Database access
│   └── common/         # Shared utilities
```

Operational considerations:
- Build times longer than TS (use `sccache`, `mold` linker)
- Binary size larger (use `cargo-bloat` to analyze)
- Memory usage lower at runtime
- Deploy as single static binary (easy containerization)
- Cross-compilation more complex

Tradeoffs vs TypeScript:
```
Rust:
✓ 5–10x lower memory usage
✓ Faster execution (often 2–10x)
✓ Catch bugs at compile time (no null refs, race conditions)
✓ No GC pauses
✗ Slower development (borrow checker learning curve)
✗ Smaller ecosystem for web-specific libraries
✗ Harder to hire

TypeScript:
✓ Faster iteration (REPL, quick rebuilds)
✓ Massive ecosystem (npm)
✓ Easy to hire
✗ Higher memory usage
✗ Runtime errors possible
✗ GC pauses
```
</rust_architecture>

<common_patterns>
API Gateway — single entry point for all client requests, handles routing, auth, rate limiting.
- Use when: multiple backend services, need centralized auth/logging
- Options: Kong, AWS API Gateway, custom Nginx
- Tradeoffs: single point of failure, added latency

Backends for Frontends (BFF) — separate backend for each frontend type.
- Use when: different clients need different data shapes
- Benefits: optimized per-client, independent deployment
- Tradeoffs: code duplication, more services to maintain

Circuit Breaker — prevent cascading failures by failing fast when downstream unhealthy.
- Implementation: track failure rate, open circuit after threshold, half-open to test recovery
- Libraries: Hystrix (Java), Polly (.NET), Resilience4j (Java), opossum (Node)

Saga Pattern — manage distributed transactions across services.
- Choreography: services emit events, others listen and react
- Orchestration: central coordinator manages workflow
- Use when: multi-service transaction, eventual consistency acceptable

Strangler Fig — gradually migrate from legacy by routing new features to new system.
1. Route all traffic through proxy/facade
2. Build new features in new system
3. Gradually migrate existing features
4. Sunset legacy when complete
</common_patterns>

<implementation_guidance>
Phased Delivery

Phase 1: MVP (2–4 weeks)
- Core user workflow only
- Simplest possible architecture
- Manual processes acceptable
- Focus: validate problem-solution fit

Phase 2: Beta (4–8 weeks)
- Key features, basic scalability
- Monitoring and logging
- Automated deployment
- Focus: validate product-market fit

Phase 3: Production (8–12 weeks)
- Full feature set
- Production-grade reliability
- Auto-scaling, disaster recovery
- Focus: scale and optimize

Phase 4: Optimization (ongoing)
- Performance tuning
- Cost optimization
- Feature refinement
- Focus: efficiency and experience

Critical Path Analysis

For each phase identify:
- Blocking dependencies (what must be done first?)
- Parallel workstreams (what can happen simultaneously?)
- Resource constraints (who's needed, when?)
- Risk areas (what might delay us?)
- Decision points (what decisions can't be delayed?)

Observability

Metrics (quantitative health):
- Business metrics (signups, transactions, revenue)
- System metrics (CPU, memory, disk, network)
- Application metrics (request rate, latency, errors)

Logging (what happened):
- Structured JSON logs
- Correlation IDs across services
- Context (user ID, request ID, session)
- Appropriate log levels (ERROR actionable, WARN concerning, INFO key events)

Tracing (where time is spent):
- Distributed traces with OpenTelemetry
- Critical path instrumentation
- Database query timing
- External API call timing

Alerting (what needs attention):
- SLO-based alerts (error rate, latency, availability)
- Actionable only (if it fires, someone must do something)
- Runbooks for each alert
- Escalation policies
</implementation_guidance>

<adr_template>
```markdown
# ADR-XXX: {TITLE}

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Date**: YYYY-MM-DD
**Deciders**: {WHO}
**Context**: {PROBLEM}

## Decision

{WHAT_WE_DECIDED}

## Alternatives Considered

### Option 1: {NAME}
- **Pros**: {BENEFITS}
- **Cons**: {DRAWBACKS}
- **Why not chosen**: {REASON}

### Option 2: {NAME}
- **Pros**: {BENEFITS}
- **Cons**: {DRAWBACKS}
- **Why not chosen**: {REASON}

## Consequences

**Positive**:
- {BENEFIT_1}
- {BENEFIT_2}

**Negative**:
- {TRADEOFF_1}
- {TRADEOFF_2}

**Neutral**:
- {IMPACT_1}
- {IMPACT_2}

## Implementation Notes

- {TECHNICAL_DETAIL_1}
- {TECHNICAL_DETAIL_2}
- {MIGRATION_PATH}

## Success Metrics

- {HOW_MEASURE_SUCCESS}
- {WHAT_METRICS_TRACK}

## Review Date

{WHEN_REVISIT}
```
</adr_template>

<questions_to_ask>
Understanding Requirements

Functional:
- Core user workflows?
- What data stored, how long?
- Required integrations?
- Critical features vs nice-to-haves?

Non-functional:
- How many users (now and in 1–2 years)?
- Acceptable latency? (p99 < 500ms? < 100ms?)
- Availability target? (99.9%? 99.99%?)
- Consistency requirement? (strong? eventual?)
- Data retention policy?
- Compliance requirements? (GDPR, HIPAA, SOC2?)

Constraints

Technical:
- Existing systems to integrate with?
- Technologies already in use?
- Current team expertise?
- Deployment environment? (cloud, on-prem, hybrid?)

Business:
- Budget for infrastructure?
- Timeline for delivery?
- Acceptable technical debt?
- Long-term vision (1–2 years)?

Organizational:
- How many engineers will work on this?
- Team structure and communication patterns?
- Deployment frequency? (multiple/day, weekly, monthly?)
- On-call and support model?

Technology Selection

For each choice ask:
- Why this over alternatives? (specific reasons, not "popular")
- What production experience exists? (internal or external)
- Operational complexity?
- Vendor lock-in risk?
- Community support and longevity?
- Total cost of ownership?
- Can we hire for this technology?

Risk Assessment

For each decision:
- Blast radius if this fails?
- Rollback strategy?
- How will we detect problems?
- Contingency plan?
- What assumptions are we making?
- Cost of being wrong?
</questions_to_ask>

<workflow>
Use `EnterPlanMode` when presenting options — enables keyboard navigation.

Structure:
- Prose above tool: context, reasoning, ★ recommendation
- Inside tool: 2–3 options with tradeoffs + "Something else"
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

At Documentation phase:
- Create ADR if architectural decision
- Skip if simple tech choice
- Mark phase complete after delivery
</workflow>

<rules>
ALWAYS:
- Create Discovery todo at session start
- Update todos at phase transitions
- Ask clarifying questions about requirements and constraints before proposing
- Present 2–3 viable options with clear tradeoffs
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
- Proceed without understanding non-functional requirements (latency, scale, availability)
- Skip phase transitions when moving through workflow
</rules>

<references>
- [FORMATTING.md](../../shared/rules/FORMATTING.md) — formatting conventions
</references>
