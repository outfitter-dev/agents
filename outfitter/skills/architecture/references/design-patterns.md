# Design Patterns

## Service Decomposition

**Monolith first, then extract:**

1. Start with well-organized monolith
2. Identify bounded contexts as you learn domain
3. Extract when hitting specific pain:
   - Different scaling needs (one service needs 10x instances)
   - Different deployment cadences (ML model updates vs API)
   - Team boundaries (separate teams, separate services)
   - Technology constraints (need Rust for one component)

**When to use microservices:**

| Signal | Microservices |
|--------|---------------|
| Large team (10+ engineers) | Yes |
| Clear domain boundaries | Yes |
| Independent scaling needs | Yes |
| Polyglot requirements | Yes |
| Small team (<5 engineers) | No |
| Unclear domain | No |
| Premature optimization | No |

## Communication Patterns

### Synchronous (REST, GraphQL, gRPC)

- **Use when**: Immediate response needed, simple request-response
- **Tradeoffs**: Tight coupling, cascading failures, latency compounds
- **Mitigation**: Circuit breakers, timeouts, retries with backoff

### Asynchronous (message queues, event streams)

- **Use when**: Eventual consistency acceptable, high volume, decoupling needed
- **Tradeoffs**: Complexity, harder debugging, ordering challenges
- **Patterns**: Message queues (RabbitMQ, SQS), event streams (Kafka, Kinesis)

### Event-driven architecture

Core: services publish events, others subscribe

**Benefits**: Loose coupling, easy to add consumers, audit trail

**Challenges**: Eventual consistency, event versioning, ordering

**Best practices**:
- Schema registry for event contracts
- Include correlation IDs for tracing
- Design idempotent consumers
- Plan for out-of-order delivery

## Data Management

### Database per service

- Each service owns its data
- No direct database access across services
- Communication via APIs or events
- Tradeoff: data consistency challenges, no joins across services

### Shared database (anti-pattern for microservices)

- Multiple services access same database
- Only acceptable: transitioning from monolith
- Migration path: add service layer, restrict direct access

### CQRS (Command Query Responsibility Segregation)

- Separate write model from read model
- Use when: read/write patterns very different, complex queries needed
- Implementation: write to normalized DB, project to read-optimized views

### Event Sourcing

- Store events, not current state
- Rebuild state by replaying events
- Use when: audit trail critical, temporal queries needed
- Challenges: migration complexity, eventual consistency
