# Scalability

## Performance Modeling

Key metrics:
- **Latency**: p50, p95, p99 response times
- **Throughput**: requests per second
- **Resource utilization**: CPU, memory, network, disk I/O
- **Error rates**: 4xx, 5xx responses
- **Saturation**: queue depths, connection pools

Capacity planning:
1. **Baseline**: measure current performance under normal load
2. **Load test**: use realistic traffic patterns (gradual ramp, spike, sustained)
3. **Find limits**: identify bottlenecks (CPU? DB? Network?)
4. **Model growth**: project based on business metrics (users, transactions)
5. **Plan headroom**: maintain 30-50% capacity buffer

## Bottleneck Identification

| Resource | Symptoms | Solutions |
|----------|----------|-----------|
| Database | High query latency, connection pool exhaustion | Indexing, query optimization, read replicas, caching, sharding |
| CPU | High utilization, slow processing | Horizontal scaling, algorithm optimization, caching, async processing |
| Memory | OOM errors, high GC pressure | Memory profiling, data structure optimization, streaming processing |
| Network | High bandwidth, slow transfers | Compression, CDN, protocol optimization (HTTP/2, gRPC) |
| I/O | Disk queue depth, slow reads/writes | SSD, batching, async I/O, caching |

## Scaling Strategies

### Vertical scaling (bigger machines)

- **Pros**: Simple, no code changes
- **Cons**: Expensive, hard limits, single point of failure
- **Use when**: Quick fix needed, not yet optimized

### Horizontal scaling (more machines)

- **Pros**: Cost-effective, no hard limits, fault tolerant
- **Cons**: Requires stateless design, load balancing complexity
- **Requirements**: Stateless services, shared state in DB/cache

### Caching layers

| Layer | Location | Tradeoffs |
|-------|----------|-----------|
| L1 | Application | Fastest, stale risk |
| L2 | Distributed (Redis, Memcached) | Shared across instances |
| L3 | CDN (CloudFlare, CloudFront) | Edge caching |

Strategies: cache-aside, write-through, write-behind based on needs

### Database scaling

- **Read replicas**: Route reads to replicas, writes to primary
- **Sharding**: Partition data (customer, geography, hash)
- **Connection pooling**: PgBouncer, connection reuse
- **Query optimization**: Indexes, query tuning, explain plans
