# Benchmarking Methodology

Rigorous performance measurement techniques for reliable optimization decisions.

## Core Principles

**Statistical rigor** — account for variance, run multiple iterations, report confidence intervals.

**Environmental isolation** — eliminate noise from other processes, network, disk I/O.

**Realistic workload** — use production-representative data, not toy examples.

**Consistent conditions** — same hardware, OS load, data set across runs.

## Benchmark Design

### 1. Define Success Criteria

**Before benchmarking, specify:**
- Target metric (latency, throughput, memory)
- Acceptable threshold (e.g., P95 < 100ms)
- Minimum improvement to justify change (e.g., 20% faster)

### 2. Choose Workload

**Representative data:**
- Production dataset sample
- Realistic data distribution
- Edge cases included
- Sufficient size (not trivially small)

**Load patterns:**
- Typical request rate
- Burst scenarios
- Concurrent users/requests
- Data size variations

### 3. Isolate Environment

**Eliminate interference:**
- Close unnecessary applications
- Disable background services
- Stop cron jobs during testing
- Use dedicated hardware if critical

**System configuration:**
- Document CPU, RAM, OS version
- Pin process to specific cores (avoid migration)
- Disable CPU frequency scaling
- Clear filesystem caches between runs

### 4. Warm Up

**JIT compilation:**
- Run warm-up iterations before measurement
- Allow JIT to optimize hot paths
- Discard initial slow runs

**Caching:**
- Decide: cold cache or warm cache testing
- Document cache state
- Be consistent across runs

## Statistical Methodology

### Multiple Runs

**Never trust single measurement:**
- Run at least 10-30 iterations
- More iterations for high-variance operations
- Discard outliers (carefully, document why)

### Measure Variance

**Report distribution, not just mean:**

```text
Operation: parse_json
Runs: 50
Mean: 42.3ms
Median (P50): 41.8ms
P95: 48.2ms
P99: 52.1ms
Std Dev: 3.2ms
Range: 38.1ms - 54.3ms
```

### Statistical Significance

**Use t-test or Mann-Whitney U test:**
- Null hypothesis: no difference between implementations
- Reject if p-value < 0.05 (95% confidence)
- Higher confidence (p < 0.01) for critical changes

**Effect size:**
- Report percentage improvement: `(old - new) / old * 100%`
- Cohen's d for standardized effect size
- Confidence interval around improvement estimate

## Tool Selection

### TypeScript/Bun

**microbench (recommended):**

```typescript
import { bench, run } from 'mitata'

bench('fast implementation', () => {
  // code to benchmark
})

bench('slow implementation', () => {
  // code to benchmark
})

await run()
```

**Benchmark.js:**

```typescript
import Benchmark from 'benchmark'

const suite = new Benchmark.Suite()

suite
  .add('implementation A', () => { /* code */ })
  .add('implementation B', () => { /* code */ })
  .on('cycle', (event) => console.log(String(event.target)))
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
```

### Rust

**criterion (recommended):**

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};

fn benchmark_implementations(c: &mut Criterion) {
    let mut group = c.benchmark_group("comparison");

    for size in [10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::new("fast", size), size, |b, &size| {
            b.iter(|| fast_implementation(black_box(size)));
        });

        group.bench_with_input(BenchmarkId::new("slow", size), size, |b, &size| {
            b.iter(|| slow_implementation(black_box(size)));
        });
    }

    group.finish();
}

criterion_group!(benches, benchmark_implementations);
criterion_main!(benches);
```

**cargo bench output:**
- Automatic outlier detection
- Statistical analysis included
- Regression detection across runs
- HTML reports with plots

## Comparison Techniques

### Before/After Comparison

**Document baseline:**

```text
Baseline (commit abc123):
  Operation: process_batch
  Mean: 125ms
  P95: 142ms
  Throughput: 8000 ops/sec
```

**Measure improvement:**

```text
Optimized (commit def456):
  Operation: process_batch
  Mean: 78ms (-37.6%)
  P95: 89ms (-37.3%)
  Throughput: 12800 ops/sec (+60%)

Statistical significance: p < 0.001
```

### A/B Comparison

**Concurrent testing:**
- Run both implementations with same data
- Randomize order to avoid bias
- Use same hardware/environment
- Report relative performance

**Example output:**

```text
Implementation A vs B (1000 runs each):

  A: 42.3ms ± 3.2ms
  B: 38.1ms ± 2.8ms

  Improvement: 9.9% faster (p < 0.01)
  Effect size: Cohen's d = 1.42 (large)
```

### Scaling Analysis

**Test multiple input sizes:**

```text
Input Size | Time (ms) | Ops/sec
-----------|-----------|--------
10         | 1.2       | 8333
100        | 11.5      | 869
1000       | 118.3     | 85
10000      | 1205.7    | 8.3

Complexity: O(n) confirmed
Slope: 0.12ms per item
```

## Common Pitfalls

### Dead Code Elimination

**Optimizer removes unused results:**

```typescript
// Bad: result never used, might be optimized away
bench('compute', () => {
  compute_expensive()
})

// Good: use black_box or assert result
bench('compute', () => {
  const result = compute_expensive()
  assert(result !== undefined) // forces computation
})
```

```rust
// Bad: optimizer removes unused work
b.iter(|| expensive_function());

// Good: black_box prevents elimination
b.iter(|| black_box(expensive_function()));
```

### Memory Effects

**Cache effects distort results:**
- Small dataset fits in L1 cache (unrealistic)
- Repeated access to same data (cache hot)
- Sequential access vs random (cache friendly)

**Mitigation:**
- Use realistic data sizes
- Randomize access patterns
- Clear caches between runs
- Test with cold cache scenario

### Timing Overhead

**Measurement affects result:**
- Timer resolution too coarse (use nanoseconds)
- Timer overhead significant for fast operations
- Loop overhead in benchmark

**Mitigation:**
- Batch operations for fast functions
- Subtract timer overhead from results
- Use high-resolution timers

### Confirmation Bias

**Expecting improvement, find it:**
- Cherry-picking favorable runs
- Ignoring variance in results
- Stopping when desired result appears

**Mitigation:**
- Pre-register hypothesis and methodology
- Use automated statistical tests
- Report all results, not just favorable
- Peer review benchmark design

## Documentation Template

```markdown
## Performance Benchmark: {OPERATION}

### Goal
{PERFORMANCE_GOAL}

### Environment
- Hardware: {CPU, RAM, DISK}
- OS: {VERSION}
- Runtime: {LANGUAGE_VERSION}
- Date: {YYYY-MM-DD}

### Methodology
- Workload: {DESCRIPTION}
- Data size: {SIZE}
- Iterations: {N}
- Warm-up: {N} iterations
- Cache state: {COLD/WARM}

### Baseline (commit {SHA})
```text
Mean:   {X}ms
Median: {X}ms
P95:    {X}ms
P99:    {X}ms
Std:    {X}ms
```

### Optimized (commit {SHA})

```text
Mean:   {X}ms (-{X}%)
Median: {X}ms (-{X}%)
P95:    {X}ms (-{X}%)
P99:    {X}ms (-{X}%)
Std:    {X}ms
```

### Statistical Analysis

- t-test: p < {VALUE}
- Effect size: {COHENS_D}
- Conclusion: {SIGNIFICANT/NOT_SIGNIFICANT}

### Tradeoffs

- {TRADEOFF_1}
- {TRADEOFF_2}

### Recommendation

{ACCEPT/REJECT} optimization based on {CRITERIA}

```

## Resources

**Papers:**
- "Statistically Rigorous Java Performance Evaluation" (Georges et al.)
- "Producing Wrong Data Without Doing Anything Obviously Wrong!" (Mytkowicz et al.)

**Tools:**
- Criterion (Rust) — statistical benchmarking
- mitata (JavaScript) — modern benchmarking
- perf (Linux) — low-level profiling
- Flamegraph — visualization

**Validation:**
- Always review benchmark methodology with team
- Reproduce results on different hardware
- Document assumptions and limitations
- Update benchmarks as codebase evolves
