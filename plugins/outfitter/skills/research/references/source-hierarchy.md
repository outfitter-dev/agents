# Source Hierarchy

Authority evaluation and cross-referencing guidelines for technical research.

## Authority Hierarchy

Sources ranked by authority for technical research:

| Rank | Source Type | Use For | Confidence |
|------|-------------|---------|------------|
| 1 | **Official Documentation** | API refs, canonical behavior, setup | 90-100% |
| 2 | **Standards Bodies** | RFCs, W3C, IEEE, ISO specs | 90-100% |
| 3 | **Benchmark Studies** | Performance comparisons, metrics | 70-90% |
| 4 | **Case Studies** | Real-world implementations, lessons | 60-80% |
| 5 | **Community Consensus** | Adoption patterns, common practices | 50-70% |

## Source Types Explained

### Official Documentation

Created and maintained by project authors.

**Examples**:
- React docs at reactjs.org
- TypeScript Handbook
- AWS service documentation
- Framework migration guides

**Trust for**:
- API signatures and parameters
- Configuration options
- Breaking changes
- Official recommendations

**Verify**:
- Documentation version matches user's version
- Content is current (check update dates)

### Standards Bodies

Formal specifications from standards organizations.

**Examples**:
- IETF RFCs (HTTP, TLS, etc.)
- W3C specifications (HTML, CSS, WebAPI)
- ECMA standards (JavaScript/ECMAScript)
- ISO standards

**Trust for**:
- Protocol specifications
- Language semantics
- Compliance requirements
- Interoperability guarantees

**Note**: Standards may describe ideal behavior; implementations may vary.

### Benchmark Studies

Comparative performance analysis.

**Examples**:
- TechEmpower web framework benchmarks
- Browser performance comparisons
- Database benchmarking suites
- Independent performance tests

**Trust for**:
- Relative performance comparisons
- Throughput/latency metrics
- Memory usage patterns
- Scalability characteristics

**Verify**:
- Benchmark methodology is sound
- Test conditions match user's scenario
- Results are recent (performance changes with versions)

### Case Studies

Real-world implementation experiences.

**Examples**:
- Engineering blog posts from known companies
- Conference talks with implementation details
- Published post-mortems
- Migration stories

**Trust for**:
- Practical challenges and solutions
- Scale considerations
- Team/organizational factors
- Production gotchas

**Note**: Context matters - their constraints may differ from yours.

### Community Consensus

Aggregated community experience.

**Examples**:
- Stack Overflow voting patterns
- GitHub stars/usage statistics
- Survey results (State of JS, etc.)
- Reddit/HN discussion trends

**Trust for**:
- Popularity indicators
- Common pain points
- Ecosystem health signals
- Developer experience trends

**Verify**: Community consensus can be wrong; cross-reference with higher-authority sources.

## Cross-Referencing Requirements

### Critical Claims

Require 2+ independent sources for:
- Security recommendations
- Breaking changes
- Performance claims
- Migration paths
- Best practices

### Verification Strategy

```
Primary source → Secondary verification → Empirical test (if feasible)
```

1. Start with highest-authority source
2. Find independent confirmation
3. Test directly when possible

### Conflict Resolution

When sources disagree:

| Factor | Resolution |
|--------|------------|
| **Recency** | Newer usually supersedes |
| **Authority** | Higher-ranked source wins |
| **Context** | Both may be right for different scenarios |
| **Verification** | Empirical test is authoritative |

Document unresolved conflicts with uncertainty flag.

## Query-Type Authority Mapping

| Query Type | Primary Source | Secondary | Tertiary |
|------------|----------------|-----------|----------|
| API Reference | Official docs | GitHub issues | Community Q&A |
| Best Practices | Expert guides | Case studies | Community consensus |
| Troubleshooting | GitHub issues | Stack Overflow | Official troubleshooting |
| Performance | Benchmarks | Case studies | Community reports |
| Security | Official advisories | Security researchers | Community discussion |

## Freshness Requirements

| Content Type | Acceptable Age |
|--------------|----------------|
| API reference | Current version |
| Security advisories | Last 30 days |
| Best practices | Last 1-2 years |
| Tutorials | Last 1 year |
| Benchmarks | Last 6 months |

Older content may still be valid but requires verification against current state.
