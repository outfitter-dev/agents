---
name: performance-engineering
version: 1.0.0
description: Performance profiling, optimization techniques, and benchmarking methodology. Use when profiling code, optimizing bottlenecks, benchmarking implementations, analyzing memory usage, improving latency, or when performance, profiling, benchmarking, optimization, memory-leak, or --perf are mentioned.
---

# Performance Engineering

Evidence-based performance optimization → measure → profile → optimize → validate.

<when_to_use>

- Profiling slow code paths or bottlenecks
- Identifying memory leaks or excessive allocations
- Optimizing latency-critical operations (P95, P99)
- Benchmarking competing implementations
- Database query optimization
- Reducing CPU usage in hot paths
- Improving throughput (RPS, ops/sec)

NOT for: premature optimization, optimization without measurement, guessing at bottlenecks

</when_to_use>

<iron_law>

NO OPTIMIZATION WITHOUT MEASUREMENT

**Required workflow:**
1. Measure baseline performance with realistic workload
2. Profile to identify actual bottleneck
3. Optimize the bottleneck (not what you think is slow)
4. Measure again to verify improvement
5. Document gains and tradeoffs

Optimizing unmeasured code wastes time and introduces bugs.

</iron_law>

<phases>

Use TodoWrite to track optimization process:

**Phase 1: Establishing baseline**
- content: "Establish performance baseline with realistic workload"
- activeForm: "Establishing performance baseline"

**Phase 2: Profiling bottlenecks**
- content: "Profile code to identify actual bottlenecks"
- activeForm: "Profiling code to identify bottlenecks"

**Phase 3: Analyzing root cause**
- content: "Analyze profiling data to determine root cause"
- activeForm: "Analyzing profiling data"

**Phase 4: Implementing optimization**
- content: "Implement targeted optimization for identified bottleneck"
- activeForm: "Implementing optimization"

**Phase 5: Validating improvement**
- content: "Measure performance gains and verify no regressions"
- activeForm: "Validating performance improvement"

</phases>

<metrics>

## Key Performance Indicators

**Latency (response time):**
- P50 (median) — typical case
- P95 — most users
- P99 — tail latency
- P99.9 — outliers
- TTFB — time to first byte
- TTLB — time to last byte

**Throughput:**
- RPS — requests per second
- ops/sec — operations per second
- bytes/sec — data transfer rate
- queries/sec — database throughput

**Memory:**
- Heap usage — allocated memory
- GC frequency — garbage collection pauses
- GC duration — stop-the-world time
- Allocation rate — memory churn
- Resident set size (RSS) — total memory

**CPU:**
- CPU time — total compute
- Wall time — elapsed time
- Hot paths — frequently executed code
- Time complexity — algorithmic efficiency
- CPU utilization — percentage used

**Always measure:**
- Before optimization (baseline)
- After optimization (improvement)
- Under realistic load (not toy data)
- Multiple runs (account for variance)

</metrics>

<profiling_tools>

## TypeScript/Bun

**Built-in timing:**

```typescript
console.time('operation')
// ... code to measure
console.timeEnd('operation')

// High precision
const start = Bun.nanoseconds()
// ... code to measure
const elapsed = Bun.nanoseconds() - start
console.log(`Took ${elapsed / 1_000_000}ms`)
```

**Performance API:**

```typescript
const mark1 = performance.mark('start')
// ... code to measure
const mark2 = performance.mark('end')
performance.measure('operation', 'start', 'end')
const measure = performance.getEntriesByName('operation')[0]
console.log(`Duration: ${measure.duration}ms`)
```

**Memory profiling:**
- Chrome DevTools → Memory tab → heap snapshots
- Node.js `--inspect` flag + Chrome DevTools
- `process.memoryUsage()` for RSS/heap tracking

**CPU profiling:**
- Chrome DevTools → Performance tab → record session
- Node.js `--prof` flag + `node --prof-process`
- Flamegraphs for visualization

## Rust

**Benchmarking:**

```rust
#[cfg(test)]
mod benches {
    use criterion::{black_box, criterion_group, criterion_main, Criterion};

    fn benchmark_function(c: &mut Criterion) {
        c.bench_function("my_function", |b| {
            b.iter(|| my_function(black_box(42)))
        });
    }

    criterion_group!(benches, benchmark_function);
    criterion_main!(benches);
}
```

**Profiling:**
- `cargo bench` — criterion benchmarks
- `perf record` + `perf report` — Linux profiling
- `cargo flamegraph` — visual flamegraphs
- `cargo bloat` — binary size analysis
- `valgrind --tool=callgrind` — detailed profiling
- `heaptrack` — memory profiling

**Instrumentation:**

```rust
use std::time::Instant;

let start = Instant::now();
// ... code to measure
let duration = start.elapsed();
println!("Took: {:?}", duration);
```

</profiling_tools>

<optimization_patterns>

## Algorithm Improvements

**Time complexity:**
- O(n²) → O(n log n) — sorting, searching
- O(n) → O(log n) — binary search, trees
- O(n) → O(1) — hash maps, memoization

**Space-time tradeoffs:**
- Cache computed results (memoization)
- Precompute expensive operations
- Index data for faster lookup
- Use hash maps for O(1) access

## Memory Optimization

**Reduce allocations:**

```typescript
// Bad: creates new array each iteration
for (const item of items) {
  const results = []
  results.push(process(item))
}

// Good: reuse array
const results = []
for (const item of items) {
  results.push(process(item))
}
```

```rust
// Bad: allocates String every time
fn format_user(name: &str) -> String {
    format!("User: {}", name)
}

// Good: reuses buffer
fn format_user(name: &str, buf: &mut String) {
    buf.clear();
    buf.push_str("User: ");
    buf.push_str(name);
}
```

**Memory pooling:**
- Reuse expensive objects (connections, buffers)
- Object pools for frequently allocated types
- Arena allocators for batch allocations

**Lazy evaluation:**
- Compute only when needed
- Stream processing vs loading all data
- Iterators over materialized collections

## I/O Optimization

**Batching:**
- Batch API calls (1 request vs 100)
- Batch database writes (bulk insert)
- Batch file operations (single write vs many)

**Caching:**
- Cache expensive computations
- Cache database queries (Redis, in-memory)
- Cache API responses (HTTP caching)
- Invalidate stale cache entries

**Async I/O:**
- Non-blocking operations (async/await)
- Concurrent requests (Promise.all, tokio::spawn)
- Connection pooling (reuse connections)

## Database Optimization

**Query optimization:**
- Add indexes for common queries
- Use EXPLAIN/EXPLAIN ANALYZE
- Avoid N+1 queries (use joins or batch loading)
- Select only needed columns
- Filter at database level (WHERE vs client filter)

**Schema design:**
- Normalize to reduce duplication
- Denormalize for read-heavy workloads
- Partition large tables
- Use appropriate data types

**Connection management:**
- Connection pooling (don't create per request)
- Prepared statements (avoid SQL parsing)
- Transaction batching (reduce round trips)

</optimization_patterns>

<workflow>

Loop: Measure → Profile → Analyze → Optimize → Validate

1. **Define performance goal** — target metric (e.g., P95 < 100ms)
2. **Establish baseline** — measure current performance under realistic load
3. **Profile systematically** — identify actual bottleneck (not guesses)
4. **Analyze root cause** — understand why code is slow
5. **Design optimization** — plan targeted improvement
6. **Implement optimization** — make focused change
7. **Measure improvement** — verify gains, check for regressions
8. **Document results** — record baseline, optimization, gains, tradeoffs

At each step:
- Document measurements with methodology
- Note profiling tool output
- Track optimization attempts (what worked/failed)
- Update performance documentation

</workflow>

<validation>

Before declaring optimization complete:

**Check gains:**
- ✓ Measured improvement meets target?
- ✓ Improvement statistically significant?
- ✓ Tested under realistic load?
- ✓ Multiple runs confirm consistency?

**Check regressions:**
- ✓ No degradation in other metrics?
- ✓ Memory usage still acceptable?
- ✓ Code complexity still manageable?
- ✓ Tests still pass?

**Check documentation:**
- ✓ Baseline measurements recorded?
- ✓ Optimization approach explained?
- ✓ Gains quantified with numbers?
- ✓ Tradeoffs documented?

</validation>

<rules>

ALWAYS:
- Measure before optimizing (baseline)
- Profile to find actual bottleneck
- Use realistic workload (not toy data)
- Measure multiple runs (account for variance)
- Document baseline and improvements
- Check for regressions in other metrics
- Consider readability vs performance tradeoff
- Verify statistical significance

NEVER:
- Optimize without measuring first
- Guess at bottleneck without profiling
- Benchmark with unrealistic data
- Trust single-run measurements
- Skip documentation of results
- Sacrifice correctness for speed
- Optimize without clear performance goal
- Ignore algorithmic improvements

</rules>

<references>

Methodology:
- [benchmarking.md](references/benchmarking.md) — rigorous benchmarking methodology

Related skills:
- codebase-analysis — evidence-based investigation (foundation)
- debugging-and-diagnosis — structured bug investigation
- typescript-dev — correctness before performance

</references>
