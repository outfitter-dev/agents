---
name: architect
version: 1.1.0
description: Provides comprehensive system design guidance, technology selection frameworks, and scalability planning. Use when designing new systems, evaluating architectural options, making technology decisions, planning for scale, analyzing tradeoffs, or when architecture, system design, tech stack, scalability, microservices, or --architect flag are mentioned.
---

# Architect

Comprehensive architectural guidance for designing scalable, maintainable systems using proven patterns and clear decision frameworks.

## Quick Start

When facing an architectural decision:

1. **Create "Discovery" todo** - Mark as `in_progress` at session start
2. **Analyze requirements** - Understand functional and non-functional needs
3. **Identify constraints** - Map technical, budget, timeline, and organizational limits (transition to "Constraint Evaluation")
4. **Generate options** - Develop 2-3 viable approaches with different tradeoff profiles (transition to "Solution Design")
5. **Apply decision framework** - Use clear criteria to select optimal approach
6. **Document rationale** - Create ADR (Architecture Decision Record) with full context (transition to "Documentation")

## Progress Tracking

Use TodoWrite to show architectural workflow progression. Create todos at session start, update as you advance through phases.

**Core Phases:**

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Discovery** | Session start | "Gathering requirements" |
| **Codebase Analysis** | Requirements understood | "Analyzing codebase" |
| **Constraint Evaluation** | Codebase analyzed | "Evaluating constraints" |
| **Solution Design** | Constraints evaluated | "Designing solutions" |
| **Documentation** | Design selected | "Documenting architecture" |

**Situational Phases** (add when needed):

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Review & Refinement** | Feedback received | "Refining architecture" |

**Workflow:**
- On session start: Create "Discovery" as `in_progress`
- On phase transition: Mark current phase `completed`, add next phase as `in_progress`
- Situational phases insert before "Documentation" when triggered

**Edge Cases:**
- **Small questions**: May skip directly to "Solution Design" for straightforward decisions
- **Optional ADR**: "Documentation" phase may be skipped if user doesn't need formal ADR
- **Iteration cycles**: "Review & Refinement" may trigger multiple times for complex designs
- **Partial analysis**: If codebase doesn't exist yet, skip "Codebase Analysis" phase

## Core Architectural Principles

### Proven over Novel
Always favor battle-tested solutions over bleeding-edge technologies unless there's compelling justification.

**Framework for evaluation**:
- Has it survived 3+ years in production at scale?
- Does it have strong community support and active maintenance?
- Are there experienced practitioners you can hire?
- What's the total cost of ownership (learning curve, tooling, hiring)?

**Red flags**:
- "We'll be early adopters" without dedicated time budget
- "It's written in X" without benchmarks proving it matters
- "Everyone's talking about it" without production case studies

### Complexity Budget
Each abstraction layer must provide 10x value to justify its complexity cost.

**Questions to ask**:
- What specific problem does this abstraction solve?
- Can we solve it with existing tools/patterns?
- What's the maintenance burden (documentation, onboarding, debugging)?
- How does it impact debugging and incident response?

**Example**: Adding GraphQL to a REST API
- **10x value**: Drastically reduces overfetching, enables client-driven queries, improves mobile performance
- **Not 10x**: "It's modern" or "Clients might want flexibility someday"

### Unix Philosophy
Design small, focused modules with clear contracts and single responsibilities.

**Module design checklist**:
- Does it have a single, well-defined purpose?
- Can you describe it in one sentence without using "and"?
- Are its dependencies explicit and minimal?
- Can it be tested in isolation?
- Does it expose a clean, stable interface?

### Observability First
No system ships without comprehensive metrics, distributed tracing, and alerting.

**Required for every service**:
- **Metrics**: RED (Rate, Errors, Duration) for all endpoints
- **Tracing**: Distributed traces with correlation IDs
- **Logging**: Structured logs with context
- **Alerts**: SLO-based alerting with runbooks
- **Dashboards**: At-a-glance health status

### Modern by Default
Use contemporary proven patterns for greenfield projects while respecting legacy constraints.

**Modern patterns** (as of 2025):
- TypeScript with strict mode for type safety
- Rust for performance-critical services
- Container-based deployment (Docker, Kubernetes)
- Infrastructure as Code (Terraform, Pulumi)
- Distributed tracing (OpenTelemetry)
- Event-driven architectures for service communication

**Legacy respect**:
- Document why legacy patterns exist
- Plan migration paths incrementally
- Don't rewrite what works reliably

### Evolutionary Architecture
Design for change with clear upgrade paths and backwards compatibility strategies.

**Key practices**:
- Version all APIs with clear deprecation policies
- Use feature flags for gradual rollouts
- Design with migration paths in mind
- Keep deployment independent from release
- Build automated compatibility testing

## Technology Selection Framework

### Database Selection

**Key decision factors**:

1. **Data model fit**
   - Relational (structured, ACID, complex queries) → PostgreSQL, MySQL
   - Document (flexible schema, nested data) → MongoDB, DynamoDB
   - Graph (relationship-heavy queries) → Neo4j, DGraph
   - Time-series (metrics, events) → TimescaleDB, InfluxDB
   - Key-value (simple lookups, caching) → Redis, DynamoDB

2. **Consistency requirements**
   - Strong consistency needed → PostgreSQL, CockroachDB
   - Eventual consistency acceptable → DynamoDB, Cassandra
   - Hybrid needs → MongoDB, Cosmos DB

3. **Scale characteristics**
   - Read-heavy → Add read replicas, caching layer
   - Write-heavy → Sharding strategy, write-optimized DB
   - Both → Consider CQRS pattern

4. **Operational complexity**
   - Managed service available? Use it unless special needs
   - Self-hosted required? Factor in operational overhead
   - Multi-region? Consider distributed databases

**Decision matrix**:
```
Need ACID + complex queries + proven at scale? → PostgreSQL
Need flexibility + horizontal scaling + managed? → DynamoDB
Need document model + rich queries + open source? → MongoDB
Need high write throughput + wide column? → Cassandra
Need caching + pub/sub + simple data? → Redis
```

### Framework Selection

**Backend frameworks**:

**TypeScript/JavaScript**:
- **Hono** (modern, fast, edge-compatible) - Best for new projects, serverless
- **Express** (proven, massive ecosystem) - Best for teams with Express experience
- **Fastify** (performance-focused) - Best when raw speed matters
- **NestJS** (structured, enterprise) - Best for large teams, complex domains

**Rust**:
- **Axum** (modern, tokio-based) - Best for new projects, type-safe routing
- **Actix-web** (mature, fast) - Best when raw performance critical
- **Rocket** (ergonomic, batteries-included) - Best for rapid development

**Decision criteria**:
- Team expertise and learning curve
- Performance requirements (most apps don't need Rust speed)
- Ecosystem and library availability
- Type safety and developer experience
- Deployment target (serverless, containers, bare metal)

**Frontend frameworks**:
- **React** + TanStack Router - Best for complex state, large ecosystems
- **Solid** - Best for performance-critical UIs
- **Svelte** - Best for small teams, simple apps
- **Next.js** - Best for SSR/SSG needs, full-stack React

### Infrastructure Selection

**Deployment platforms**:

**Serverless** (Vercel, Cloudflare Workers, AWS Lambda):
- ✓ Zero ops, auto-scaling, pay-per-use
- ✗ Cold starts, vendor lock-in, debugging harder
- **Best for**: Low-traffic apps, edge functions, prototypes

**Container orchestration** (Kubernetes, ECS):
- ✓ Portability, fine-grained control, proven at scale
- ✗ Operational complexity, learning curve
- **Best for**: Medium-large apps, multi-service systems

**Platform-as-a-Service** (Heroku, Render, Railway):
- ✓ Simple deploys, managed infrastructure
- ✗ Higher cost, less control, scaling limits
- **Best for**: Startups, MVPs, small teams

**Bare metal / VMs**:
- ✓ Full control, cost-effective at scale
- ✗ High operational burden
- **Best for**: Special requirements, very large scale

## System Design Patterns

### Service Decomposition Strategies

**Monolith first, then extract**:
1. Start with well-organized monolith
2. Identify bounded contexts as you learn the domain
3. Extract services when you hit specific pain points:
   - Different scaling needs (one service needs 10x more instances)
   - Different deployment cadences (ML model updates vs. API)
   - Team boundaries (separate teams owning separate services)
   - Technology constraints (need Rust for one component)

**When to use microservices**:
- ✓ Large team (10+ engineers)
- ✓ Clear domain boundaries
- ✓ Independent scaling needs
- ✓ Polyglot requirements
- ✗ Small team (<5 engineers)
- ✗ Unclear domain
- ✗ Premature optimization

### Communication Patterns

**Synchronous (REST, GraphQL, gRPC)**:
- **Use when**: Immediate response needed, simple request-response
- **Tradeoffs**: Tight coupling, cascading failures, latency compounds
- **Mitigation**: Circuit breakers, timeouts, retries with backoff

**Asynchronous (Message queues, event streams)**:
- **Use when**: Eventual consistency acceptable, high volume, decoupling needed
- **Tradeoffs**: Complexity, debugging harder, ordering challenges
- **Patterns**: Message queues (RabbitMQ, SQS), Event streams (Kafka, Kinesis)

**Event-driven architecture**:
- **Core pattern**: Services publish events, others subscribe
- **Benefits**: Loose coupling, easy to add consumers, audit trail
- **Challenges**: Eventual consistency, event versioning, ordering
- **Best practices**:
  - Use schema registry for event contracts
  - Include correlation IDs for tracing
  - Design idempotent consumers
  - Plan for out-of-order delivery

### Data Management Patterns

**Database per service**:
- Each service owns its data
- No direct database access across services
- Communication via APIs or events
- **Tradeoff**: Data consistency challenges, no joins across services

**Shared database** (anti-pattern for microservices):
- Multiple services access same database
- **Only acceptable**: Transitioning from monolith
- **Migration path**: Add service layer, restrict direct access

**CQRS (Command Query Responsibility Segregation)**:
- Separate write model (commands) from read model (queries)
- **Use when**: Read/write patterns very different, complex queries needed
- **Implementation**: Write to normalized DB, project to read-optimized views

**Event Sourcing**:
- Store events, not current state
- Rebuild state by replaying events
- **Use when**: Audit trail critical, temporal queries needed
- **Challenges**: Migration complexity, eventual consistency

## Scalability Planning

### Performance Modeling

**Key metrics to track**:
- **Latency**: p50, p95, p99 response times
- **Throughput**: Requests per second
- **Resource utilization**: CPU, memory, network, disk I/O
- **Error rates**: 4xx, 5xx responses
- **Saturation**: Queue depths, connection pools

**Capacity planning process**:
1. **Baseline**: Measure current performance under normal load
2. **Load test**: Use realistic traffic patterns (gradual ramp, spike, sustained)
3. **Find limits**: Identify bottlenecks (CPU? DB? Network?)
4. **Model growth**: Project based on business metrics (users, transactions)
5. **Plan headroom**: Maintain 30-50% capacity buffer

### Bottleneck Identification

**Common bottlenecks**:

**Database**:
- Symptoms: High query latency, connection pool exhaustion
- Solutions: Indexing, query optimization, read replicas, caching, sharding

**CPU**:
- Symptoms: High CPU utilization, slow processing
- Solutions: Horizontal scaling, algorithm optimization, caching, async processing

**Memory**:
- Symptoms: OOM errors, high GC pressure
- Solutions: Memory profiling, data structure optimization, streaming processing

**Network**:
- Symptoms: High bandwidth usage, slow transfers
- Solutions: Compression, CDN, protocol optimization (HTTP/2, gRPC)

**I/O**:
- Symptoms: Disk queue depth, slow reads/writes
- Solutions: SSD, batching, async I/O, caching

### Scaling Strategies

**Vertical scaling** (bigger machines):
- ✓ Simple, no code changes
- ✗ Expensive, hard limits, single point of failure
- **Use when**: Quick fix needed, not yet optimized

**Horizontal scaling** (more machines):
- ✓ Cost-effective, no hard limits, fault tolerant
- ✗ Requires stateless design, load balancing complexity
- **Requirements**: Stateless services, shared state in DB/cache

**Caching layers**:
- **L1 (Application)**: In-memory, fastest, stale risk
- **L2 (Distributed)**: Redis, Memcached, shared across instances
- **L3 (CDN)**: CloudFlare, CloudFront, edge caching
- **Strategy**: Cache-aside, write-through, write-behind based on needs

**Database scaling**:
- **Read replicas**: Route reads to replicas, writes to primary
- **Sharding**: Partition data across databases (by customer, geography, hash)
- **Connection pooling**: PgBouncer, connection reuse
- **Query optimization**: Indexes, query tuning, explain plans

## Architectural Decision Records (ADRs)

Template for documenting decisions:

```markdown
# ADR-XXX: [Title]

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Date**: YYYY-MM-DD
**Deciders**: [Who was involved]
**Context**: [What problem are we solving?]

## Decision

[What did we decide? Be specific and concrete.]

## Alternatives Considered

### Option 1: [Name]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Why not chosen**: [Specific reason]

### Option 2: [Name]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Why not chosen**: [Specific reason]

## Consequences

**Positive**:
- [Benefit 1]
- [Benefit 2]

**Negative**:
- [Tradeoff 1]
- [Tradeoff 2]

**Neutral**:
- [Impact 1]
- [Impact 2]

## Implementation Notes

- [Technical detail 1]
- [Technical detail 2]
- [Migration path if applicable]

## Success Metrics

- [How will we know this was the right decision?]
- [What metrics will we track?]

## Review Date

[When should we revisit this decision?]
```

## Questions to Ask When Designing Systems

### Understanding Requirements

**Functional**:
- What are the core user workflows?
- What data needs to be stored and for how long?
- What integrations are required?
- What are the critical features vs. nice-to-haves?

**Non-functional**:
- How many users (now and in 1-2 years)?
- What's acceptable latency? (p99 < 500ms? < 100ms?)
- What's the availability target? (99.9%? 99.99%?)
- What's the consistency requirement? (strong? eventual?)
- What's the data retention policy?
- What are the compliance requirements? (GDPR, HIPAA, SOC2?)

### Constraints

**Technical**:
- What existing systems must we integrate with?
- What technologies are already in use?
- What's the current team expertise?
- What's the deployment environment? (cloud, on-prem, hybrid?)

**Business**:
- What's the budget for infrastructure?
- What's the timeline for delivery?
- What's the acceptable technical debt?
- What's the long-term vision (1-2 years)?

**Organizational**:
- How many engineers will work on this?
- What's the team structure and communication patterns?
- What's the deployment frequency? (multiple/day, weekly, monthly?)
- What's the on-call and support model?

### Technology Selection

**For each technology choice, ask**:
- Why this over alternatives? (specific reasons, not "it's popular")
- What production experience exists? (internal or external)
- What's the operational complexity?
- What's the vendor lock-in risk?
- What's the community support and longevity?
- What's the total cost of ownership?
- Can we hire for this technology?

### Risk Assessment

**For each architectural decision**:
- What's the blast radius if this fails?
- What's our rollback strategy?
- How will we detect problems?
- What's the contingency plan?
- What assumptions are we making?
- What's the cost of being wrong?

## Common Architectural Patterns

### API Gateway Pattern
Single entry point for all client requests, handles routing, auth, rate limiting.

**Use when**: Multiple backend services, need centralized auth/logging
**Options**: Kong, AWS API Gateway, custom Nginx
**Tradeoffs**: Single point of failure, added latency

### Backends for Frontends (BFF)
Separate backend for each frontend type (web, mobile, desktop).

**Use when**: Different clients need different data shapes
**Benefits**: Optimized per-client, independent deployment
**Tradeoffs**: Code duplication, more services to maintain

### Circuit Breaker
Prevent cascading failures by failing fast when downstream service is unhealthy.

**Implementation**: Track failure rate, open circuit after threshold, half-open to test recovery
**Libraries**: Hystrix (Java), Polly (.NET), Resilience4j (Java), opossum (Node)

### Saga Pattern
Manage distributed transactions across services.

**Choreography**: Services emit events, others listen and react
**Orchestration**: Central coordinator manages workflow
**Use when**: Multi-service transaction, eventual consistency acceptable

### Strangler Fig
Gradually migrate from legacy system by routing new features to new system.

**Process**:
1. Route all traffic through proxy/facade
2. Build new features in new system
3. Gradually migrate existing features
4. Sunset legacy when complete

## Rust-Specific Architecture Patterns

### When to Choose Rust

**Strong fit**:
- Performance-critical services (compute-heavy, low-latency)
- Resource-constrained environments
- Systems programming needs
- Memory safety critical (no GC pauses)
- Concurrent processing with correctness guarantees

**May not be worth it**:
- Prototype/MVP phase (slower iteration)
- Small team without Rust experience
- Standard CRUD API (TS is faster to develop)
- Heavy dependency on ecosystem libraries only in other languages

### Rust Stack Recommendations

**Web services**:
- **Runtime**: `tokio` (async runtime, de facto standard)
- **Web framework**: `axum` (modern, type-safe) or `actix-web` (mature, fast)
- **Database**: `sqlx` (compile-time checked queries), `diesel` (full ORM)
- **Serialization**: `serde` with `serde_json`, `bincode` for binary
- **Observability**: `tracing` + `tracing-subscriber` for structured logging
- **Error handling**: `thiserror` for libraries, `anyhow` for applications

**Project structure**:
```
my-service/
├── Cargo.toml          # Workspace manifest
├── crates/
│   ├── api/            # HTTP handlers, routing
│   ├── domain/         # Business logic, pure Rust
│   ├── persistence/    # Database access
│   └── common/         # Shared utilities
```

**Operational considerations**:
- Build times longer than TS (use `sccache`, `mold` linker)
- Binary size larger (use `cargo-bloat` to analyze)
- Memory usage lower at runtime
- Deploy as single static binary (easy containerization)
- Cross-compilation more complex

**Tradeoffs vs. TypeScript**:
```
Rust:
✓ 5-10x lower memory usage
✓ Faster execution (often 2-10x)
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

## Implementation Guidance

### Phased Delivery Approach

**Phase 1: MVP** (2-4 weeks)
- Core user workflow only
- Simplest possible architecture
- Manual processes acceptable
- Focus: Validate problem-solution fit

**Phase 2: Beta** (4-8 weeks)
- Key features, basic scalability
- Monitoring and logging
- Automated deployment
- Focus: Validate product-market fit

**Phase 3: Production** (8-12 weeks)
- Full feature set
- Production-grade reliability
- Auto-scaling, disaster recovery
- Focus: Scale and optimize

**Phase 4: Optimization** (ongoing)
- Performance tuning
- Cost optimization
- Feature refinement
- Focus: Efficiency and experience

### Critical Path Analysis

**For each phase, identify**:
- Blocking dependencies (what must be done first?)
- Parallel workstreams (what can happen simultaneously?)
- Resource constraints (who's needed, when?)
- Risk areas (what might delay us?)
- Decision points (what decisions can't be delayed?)

### Monitoring and Observability

**Metrics (quantitative health)**:
- Business metrics (signups, transactions, revenue)
- System metrics (CPU, memory, disk, network)
- Application metrics (request rate, latency, errors)

**Logging (what happened)**:
- Structured JSON logs
- Correlation IDs across services
- Context (user ID, request ID, session)
- Appropriate log levels (ERROR for actionable, WARN for concerning, INFO for key events)

**Tracing (where time is spent)**:
- Distributed traces with OpenTelemetry
- Critical path instrumentation
- Database query timing
- External API call timing

**Alerting (what needs attention)**:
- SLO-based alerts (error rate, latency, availability)
- Actionable only (if it fires, someone must do something)
- Runbooks for each alert
- Escalation policies

## Example: Designing a Real-time Chat System

### Requirements Analysis

**Functional**:
- Send/receive messages in real-time
- Create channels, direct messages
- User presence (online/offline)
- Message history (30 days retention)
- File attachments (images, documents)

**Non-functional**:
- 100k concurrent users target (1M in 2 years)
- p99 message latency < 100ms
- 99.9% availability
- Strong consistency for message ordering
- GDPR compliant

**Constraints**:
- Team: 5 engineers (2 backend, 2 frontend, 1 full-stack)
- Timeline: 3 months MVP, 6 months production
- Budget: $5k/month infrastructure
- Expertise: Strong TypeScript, learning Rust

### Architectural Options

**Option 1: Monolith + WebSockets + PostgreSQL**

**Architecture**:
```
[Clients] <--WebSocket--> [Node.js + Hono] <--> [PostgreSQL]
                              |
                              v
                          [Redis PubSub]
```

**Stack**:
- Backend: Hono (TypeScript) with WebSocket support
- Database: PostgreSQL (messages, users, channels)
- PubSub: Redis (broadcast to multiple servers)
- Files: S3 + CloudFront

**Pros**:
- Simple to develop and debug
- Team expertise (TypeScript)
- Fast iteration
- Lower operational complexity

**Cons**:
- WebSocket sticky sessions needed
- Horizontal scaling limited by WebSocket connections
- Potential memory issues at 100k concurrent

**Cost**: ~$2k/month (RDS, ElastiCache, EC2, S3)

**Option 2: Microservices + Event-driven + Rust for websockets**

**Architecture**:
```
[Clients] <--WS--> [Rust WS Gateway] <--gRPC--> [Hono API] <--> [PostgreSQL]
                          |                          |
                          +--------[Kafka]----------+
                                     |
                              [Message Processor]
```

**Stack**:
- WebSocket Gateway: Rust + `tokio-tungstenite` (handle 100k connections per server)
- API: Hono (TypeScript) for REST
- Events: Kafka (message delivery, presence)
- Database: PostgreSQL + read replicas

**Pros**:
- Rust handles many more concurrent connections (lower memory)
- Event-driven scales horizontally
- Clear separation of concerns

**Cons**:
- More complex (3 services vs. 1)
- Learning curve (Rust + Kafka)
- Higher operational burden
- More expensive infrastructure

**Cost**: ~$4k/month (Kafka, more servers, RDS)

**Option 3: Serverless + Managed services**

**Architecture**:
```
[Clients] <--WS--> [API Gateway WS] <--> [Lambda] <--> [DynamoDB]
                                           |
                                     [EventBridge]
```

**Stack**:
- WebSockets: API Gateway WebSocket API
- Functions: AWS Lambda (TypeScript)
- Database: DynamoDB
- Files: S3 + CloudFront

**Pros**:
- Zero ops, auto-scaling
- Pay per use (cheap at low scale)
- No server management

**Cons**:
- API Gateway WS has quirks (connections not fully managed)
- Lambda cold starts for message delivery
- DynamoDB learning curve
- Vendor lock-in

**Cost**: ~$1k/month at low volume, $3k+ at 100k users

### Recommended Approach: Option 1 → Option 2

**Phase 1 (Months 1-3): Monolith MVP**
- Build with Hono + WebSockets + PostgreSQL + Redis
- Get to market fast, validate product
- Learn scaling characteristics
- **Success metric**: 1k concurrent users, p99 < 200ms

**Phase 2 (Months 4-6): Production hardening**
- Add monitoring (OpenTelemetry + Grafana)
- Implement rate limiting, auth hardening
- Optimize database queries, add indexes
- **Success metric**: 10k concurrent users, p99 < 100ms, 99.9% uptime

**Phase 3 (Months 7+): Scale with Rust gateway**
- When hitting connection limits (~50k concurrent on Node)
- Extract WebSocket handling to Rust service
- Keep API in TypeScript (team expertise)
- **Success metric**: 100k concurrent users, p99 < 100ms

**Rationale**:
- Start simple, validate product first
- Learn scaling characteristics before over-engineering
- Incremental complexity as needed
- Leverages team expertise (TypeScript) while using Rust strategically
- Clear migration path

### Implementation Plan

**Month 1: Core messaging**
- Basic auth (JWT)
- WebSocket connection handling
- Message send/receive
- PostgreSQL schema

**Month 2: Features**
- Channels and DMs
- User presence
- Message history
- Basic file uploads

**Month 3: Polish**
- Production deployment (AWS)
- Monitoring and alerting
- Load testing
- Security audit

**Months 4-6: Scale**
- Optimize hot paths
- Add caching layer
- Implement rate limiting
- Prepare for horizontal scaling

### ADR Example

```markdown
# ADR-001: Use Redis PubSub for multi-server message broadcast

**Status**: Accepted
**Date**: 2025-11-28
**Context**: Need to broadcast messages to all connected clients across multiple Node.js servers.

## Decision

Use Redis PubSub to broadcast messages between servers. Each server subscribes to a channel and publishes messages when received from clients.

## Alternatives Considered

### Option 1: Sticky sessions only
- **Pros**: Simple, no additional infrastructure
- **Cons**: Doesn't work with multiple servers, clients must reconnect to same server
- **Why not**: Doesn't support horizontal scaling

### Option 2: Kafka for message bus
- **Pros**: More robust, ordered delivery, persistence
- **Cons**: Heavy infrastructure, over-engineered for current scale
- **Why not**: Too complex for MVP, can migrate later if needed

### Option 3: Database polling
- **Pros**: No additional service
- **Cons**: High latency, DB load
- **Why not**: Unacceptable latency for real-time chat

## Consequences

**Positive**:
- Simple to implement (Redis already used for session storage)
- Low latency (~1-5ms)
- Scales to 10s of servers easily

**Negative**:
- Redis is now critical path (single point of failure)
- PubSub doesn't persist (messages lost if subscriber down)

**Mitigation**:
- Use Redis Sentinel for HA
- Persist messages to PostgreSQL immediately
- Monitor Redis health closely

## Success Metrics

- Message delivery latency < 10ms between servers
- Redis CPU < 30% under normal load
- Zero message loss (all persisted to DB)

## Review Date

After 3 months in production, evaluate if Redis is bottleneck or if we need Kafka.
```

## Critical Rules

**ALWAYS:**
- Create "Discovery" todo at session start
- Update todos when transitioning between phases
- Ask clarifying questions about requirements and constraints before proposing solutions
- Present 2-3 viable architectural options with clear tradeoffs
- Document architectural decisions with rationale (ADRs when appropriate)
- Consider both immediate needs and future scale
- Evaluate team expertise and operational capacity
- Account for budget and timeline constraints

**NEVER:**
- Recommend bleeding-edge tech without strong justification
- Over-engineer solutions for current scale
- Skip constraint analysis (budget, timeline, team, existing systems)
- Propose architectures the team can't operate
- Ignore operational complexity in technology selection
- Proceed with design without understanding non-functional requirements (latency, scale, availability)
- Skip phase transitions when moving through workflow

---

For detailed architectural patterns and extended examples, see [REFERENCE.md](REFERENCE.md).
