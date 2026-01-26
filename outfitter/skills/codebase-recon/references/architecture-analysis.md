# Architecture Analysis

Techniques for analyzing system structure, dependencies, and component relationships.

## Dependency Mapping

### Forward Dependencies

What a component relies on:
1. **Direct imports** — explicit dependencies in code
2. **Indirect references** — called through interfaces
3. **Runtime dependencies** — configuration, environment
4. **Data dependencies** — shared state, databases

### Reverse Dependencies

What relies on this component:
1. **Direct dependents** — explicit imports from other modules
2. **Interface consumers** — components using this API
3. **Side effect consumers** — code relying on mutations
4. **Event subscribers** — listeners for this component's events

### Circular Dependencies

Red flags:
- A imports B, B imports A
- Longer cycles: A → B → C → A
- Implicit cycles through shared state

Resolution strategies:
- Extract shared code to separate module
- Introduce interface/abstraction layer
- Invert dependency direction
- Break into smaller components

## Layer Identification

### Detecting Layers

Look for:
- **Directional flow** — data/control flows one way
- **Abstraction levels** — concrete → abstract as you ascend
- **Responsibility clustering** — similar concerns grouped
- **Interface boundaries** — clear contracts between groups

### Common Layer Patterns

**Three-tier**:
- Presentation (UI, API endpoints)
- Business logic (domain, workflows)
- Data access (repositories, queries)

**Hexagonal/Clean**:
- Core domain (entities, business rules)
- Application layer (use cases, orchestration)
- Infrastructure (frameworks, external services)
- Interfaces (controllers, adapters)

**Microservices**:
- Service boundary (API gateway)
- Service logic (domain per service)
- Data layer (per-service database)
- Cross-cutting (auth, logging, monitoring)

### Layer Violations

Violations indicate architectural drift:
- Lower layer imports higher layer
- Business logic in presentation layer
- Data access code in domain entities
- Infrastructure concerns leaking into core

## Interface Analysis

### Contract Definition

Examine:
- **Input types** — what does it accept?
- **Output types** — what does it return?
- **Error modes** — what can fail, how?
- **Side effects** — mutations, I/O, state changes
- **Invariants** — what must always be true?

### API Quality

Strong interfaces show:
- **Cohesion** — methods belong together
- **Minimal surface** — small, focused API
- **Clear contracts** — types tell the story
- **Stability** — changes don't cascade
- **Composability** — works well with others

Weak interfaces show:
- **Kitchen sink** — unrelated methods bundled
- **Leaky abstractions** — implementation details exposed
- **Unstable** — frequent breaking changes
- **Rigid** — hard to extend or compose

## Component Relationships

### Relationship Types

**Composition**:
- Component owns sub-components
- Lifecycles coupled
- Strong cohesion
- Example: `Page` owns `Header`, `Footer`

**Aggregation**:
- Component references others
- Independent lifecycles
- Loose coupling
- Example: `ShoppingCart` references `Product`

**Dependency**:
- Uses another component's interface
- No ownership
- Can be swapped
- Example: `AuthService` uses `Database`

**Association**:
- Knows about but doesn't own
- Weak relationship
- Often bidirectional
- Example: `User` ↔ `Post` (many-to-many)

### Coupling Analysis

**Low coupling** (good):
- Communicate through interfaces
- Few shared assumptions
- Changes localized
- Easy to test in isolation

**High coupling** (risky):
- Direct field access
- Shared mutable state
- Knowledge of implementation
- Changes ripple widely

## Architectural Pattern Recognition

### Layered Architecture

Indicators:
- Unidirectional dependencies (top → bottom)
- Each layer uses only layer below
- Clear separation of concerns

Trade-offs:
- ✓ Simple, well-understood
- ✓ Easy to enforce rules
- ✗ Can become rigid
- ✗ Performance overhead

### Event-Driven Architecture

Indicators:
- Pub/sub or message queues
- Decoupled components
- Asynchronous communication
- Event sourcing patterns

Trade-offs:
- ✓ Scalable, resilient
- ✓ Loose coupling
- ✗ Harder to reason about flow
- ✗ Eventual consistency challenges

### Microservices

Indicators:
- Service per bounded context
- Independent deployment
- API-based communication
- Decentralized data

Trade-offs:
- ✓ Independent scaling
- ✓ Technology diversity
- ✗ Distributed system complexity
- ✗ Operational overhead

## Analysis Workflow

### Top-Down

Start broad, narrow focus:
1. **System boundaries** — what's in scope?
2. **Major components** — high-level modules
3. **Component interactions** — how they communicate
4. **Internal structure** — zoom into each component
5. **Implementation** — code-level details

### Bottom-Up

Start specific, build understanding:
1. **Entry point** — main(), server start, UI root
2. **Call graph** — trace execution paths
3. **Cluster calls** — group related functionality
4. **Extract components** — identify logical boundaries
5. **Map relationships** — connect the pieces

### Targeted

Focus on specific concern:
1. **Define question** — what are you trying to understand?
2. **Identify relevant code** — where does this happen?
3. **Trace dependencies** — what does it touch?
4. **Analyze impact** — what would changing this affect?
5. **Document findings** — capture insights

## Documentation Extraction

From architecture analysis, capture:
- **Component diagram** — boxes and arrows
- **Dependency graph** — what imports what
- **Layer diagram** — abstraction levels
- **Sequence diagrams** — interaction flows
- **Decision records** — why this structure?
