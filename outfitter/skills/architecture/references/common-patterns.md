# Common Architecture Patterns

## API Gateway

Single entry point for all client requests, handles routing, auth, rate limiting.

- **Use when**: Multiple backend services, need centralized auth/logging
- **Options**: Kong, AWS API Gateway, custom Nginx
- **Tradeoffs**: Single point of failure, added latency

## Backends for Frontends (BFF)

Separate backend for each frontend type.

- **Use when**: Different clients need different data shapes
- **Benefits**: Optimized per-client, independent deployment
- **Tradeoffs**: Code duplication, more services to maintain

## Circuit Breaker

Prevent cascading failures by failing fast when downstream unhealthy.

- **Implementation**: Track failure rate, open circuit after threshold, half-open to test recovery
- **Libraries**: Hystrix (Java), Polly (.NET), Resilience4j (Java), opossum (Node)

## Saga Pattern

Manage distributed transactions across services.

| Type | Description |
|------|-------------|
| Choreography | Services emit events, others listen and react |
| Orchestration | Central coordinator manages workflow |

- **Use when**: Multi-service transaction, eventual consistency acceptable

## Strangler Fig

Gradually migrate from legacy by routing new features to new system.

1. Route all traffic through proxy/facade
2. Build new features in new system
3. Gradually migrate existing features
4. Sunset legacy when complete
