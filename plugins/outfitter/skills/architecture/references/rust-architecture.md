# Rust Architecture

## When to Choose Rust

**Strong fit:**
- Performance-critical services (compute-heavy, low-latency)
- Resource-constrained environments
- Systems programming needs
- Memory safety critical (no GC pauses)
- Concurrent processing with correctness guarantees

**May not be worth it:**
- Prototype/MVP stage (slower iteration)
- Small team without Rust experience
- Standard CRUD API (TS faster to develop)
- Heavy dependency on ecosystem libraries only in other languages

## Stack Recommendations

### Web services

| Component | Recommendation |
|-----------|----------------|
| Runtime | `tokio` (async runtime, de facto standard) |
| Web framework | `axum` (modern, type-safe) or `actix-web` (mature, fast) |
| Database | `sqlx` (compile-time checked), `diesel` (full ORM) |
| Serialization | `serde` + `serde_json`, `bincode` for binary |
| Observability | `tracing` + `tracing-subscriber` |
| Errors | `thiserror` (libraries), `anyhow` (applications) |

### Project structure

```
my-service/
├── Cargo.toml          # Workspace manifest
├── crates/
│   ├── api/            # HTTP handlers, routing
│   ├── domain/         # Business logic, pure Rust
│   ├── persistence/    # Database access
│   └── common/         # Shared utilities
```

### Operational considerations

- Build times longer than TS (use `sccache`, `mold` linker)
- Binary size larger (use `cargo-bloat` to analyze)
- Memory usage lower at runtime
- Deploy as single static binary (easy containerization)
- Cross-compilation more complex

## Tradeoffs vs TypeScript

| Aspect | Rust | TypeScript |
|--------|------|------------|
| Memory | 5-10x lower | Higher |
| Execution | 2-10x faster | Slower |
| Bug detection | Compile-time (null, races) | Runtime possible |
| GC pauses | None | Yes |
| Development speed | Slower (borrow checker) | Faster iteration |
| Ecosystem | Smaller for web | Massive (npm) |
| Hiring | Harder | Easy |
