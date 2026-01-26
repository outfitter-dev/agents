# Test Quality Metrics

Comprehensive guide to measuring and improving test quality through coverage and mutation testing.

## Coverage Metrics

### Line Coverage

Percentage of code lines executed during test runs.

**Target**: ≥80% overall, ≥90% for critical paths

**TypeScript/Bun**:

```bash
bun test --coverage

# Output
Coverage Summary:
  Statements   : 85.2% ( 1420/1667 )
  Branches     : 78.5% ( 314/400 )
  Functions    : 82.1% ( 156/190 )
  Lines        : 85.2% ( 1420/1667 )
```

**Rust**:

```bash
# Using cargo-tarpaulin
cargo tarpaulin --out Html --output-dir coverage/

# Using cargo-llvm-cov
cargo llvm-cov --html
```

### Branch Coverage

Percentage of decision branches (if/else, switch, ternary) executed.

**Target**: ≥75%

Example showing uncovered branch:

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {  // Branch covered
    throw new Error('Division by zero')
  }
  return a / b    // Branch covered
}

// Test only covers success path
test('divides numbers', () => {
  expect(divide(10, 2)).toBe(5)
})

// Coverage: 50% branches (only success branch covered)
```

Fix with both branches:

```typescript
test('divides numbers', () => {
  expect(divide(10, 2)).toBe(5)
})

test('throws on division by zero', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero')
})

// Coverage: 100% branches
```

### Function Coverage

Percentage of functions called during tests.

**Target**: ≥80%

Uncovered functions often indicate:
- Dead code that should be removed
- Missing test cases
- Helper functions only used in uncovered paths

### Interpreting Coverage

High coverage ≠ high quality. Coverage shows what's tested, not how well.

**Example of misleading coverage**:

```typescript
function processPayment(amount: number): Result {
  if (amount <= 0) {
    return { type: 'error', code: 'INVALID_AMOUNT' }
  }

  const result = chargeCard(amount)
  return { type: 'success', transactionId: result.id }
}

// Bad test with 100% coverage
test('processes payment', () => {
  processPayment(100)
  processPayment(-10)
})

// No assertions! 100% coverage but 0% verification
```

Coverage shows code was executed, not that it was verified correct.

## Mutation Testing

Mutation testing verifies test quality by introducing small bugs and checking if tests catch them.

### How It Works

1. **Mutant Generation**: Tool mutates source code (e.g., `===` → `!==`, `+` → `-`)
2. **Test Execution**: Run tests against each mutant
3. **Classification**:
   - **Killed**: Test fails (good — test caught the bug)
   - **Survived**: Test passes (bad — test missed the bug)
   - **Timeout**: Mutant caused infinite loop
   - **No Coverage**: Line not executed by tests

### Mutation Score

```
Mutation Score = (Killed Mutants / Total Mutants) × 100%
```

**Target**: ≥75%

### TypeScript Mutation Testing

Using Stryker:

**Install**:

```bash
bun add -d @stryker-mutator/core @stryker-mutator/typescript-checker
```

**Configuration** (`stryker.conf.json`):

```json
{
  "mutator": "typescript",
  "packageManager": "bun",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "bun",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts"
  ],
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
}
```

**Run**:

```bash
bun x stryker run

# Output
Mutation testing complete:
  Killed: 78
  Survived: 12
  Timeout: 2
  No Coverage: 8
  Mutation Score: 78.0%
```

**Common Mutations**:

| Original | Mutant | Catches |
|----------|--------|---------|
| `===` | `!==` | Equality assertions |
| `>` | `>=` | Boundary tests |
| `+` | `-` | Arithmetic verification |
| `&&` | `||` | Logic tests |
| `true` | `false` | Boolean verification |
| `0` | `1` | Zero handling |
| `return x` | `return undefined` | Return value tests |

**Example Analysis**:

```typescript
function calculateDiscount(price: number, isPremium: boolean): number {
  if (isPremium) {
    return price * 0.8  // 20% discount
  }
  return price
}

// Weak test
test('calculates discount', () => {
  calculateDiscount(100, true)
  calculateDiscount(100, false)
})

// Mutation: 0.8 → 0.9
// Status: Survived (no assertion)
```

Fix with assertions:

```typescript
test('applies 20% discount for premium users', () => {
  expect(calculateDiscount(100, true)).toBe(80)
})

test('no discount for regular users', () => {
  expect(calculateDiscount(100, false)).toBe(100)
})

// Mutation: 0.8 → 0.9
// Status: Killed (test fails with 90 !== 80)
```

### Rust Mutation Testing

Using `cargo-mutants`:

**Install**:

```bash
cargo install cargo-mutants
```

**Run**:

```bash
cargo mutants

# Output
Mutation testing results:
  caught: 45
  missed: 5
  timeout: 1
  unviable: 2
  score: 90.0%
```

**Common Mutations**:

| Original | Mutant | Catches |
|----------|--------|---------|
| `==` | `!=` | Equality tests |
| `>` | `>=` | Boundary tests |
| `&&` | `||` | Logic tests |
| `Some(x)` | `None` | Option handling |
| `Ok(x)` | `Err(...)` | Result handling |
| `+` | `-` | Arithmetic verification |

**Example**:

```rust
fn calculate_discount(price: i32, is_premium: bool) -> i32 {
    if is_premium {
        price * 80 / 100  // 20% discount
    } else {
        price
    }
}

// Weak test
#[test]
fn test_discount() {
    calculate_discount(100, true);
    calculate_discount(100, false);
}

// Mutation: 80 → 90
// Status: missed (no assertion)
```

Fix:

```rust
#[test]
fn applies_discount_for_premium() {
    assert_eq!(calculate_discount(100, true), 80);
}

#[test]
fn no_discount_for_regular() {
    assert_eq!(calculate_discount(100, false), 100);
}

// Mutation: 80 → 90
// Status: caught (assertion fails)
```

## Quality Standards Matrix

| Metric | Minimum | Good | Excellent |
|--------|---------|------|-----------|
| Line Coverage | 70% | 80% | 90% |
| Branch Coverage | 65% | 75% | 85% |
| Function Coverage | 75% | 85% | 95% |
| Mutation Score | 60% | 75% | 85% |
| Test Execution Time | <10s | <5s | <2s |

## Improving Test Quality

### Weak Assertion Detection

**Problem**: Tests execute code but don't verify results

```typescript
// ❌ Weak - no verification
test('processes order', () => {
  processOrder({ items: [item1, item2] })
})
```

**Solution**:

```typescript
// ✓ Strong - verifies result
test('processes order', () => {
  const result = processOrder({ items: [item1, item2] })
  expect(result.type).toBe('success')
  expect(result.total).toBe(150)
})
```

### Missing Edge Cases

Use mutation testing to find gaps:

```typescript
function validateAge(age: number): boolean {
  return age >= 18  // Mutant: >= → >
}

// Current test
test('validates age', () => {
  expect(validateAge(20)).toBe(true)
  expect(validateAge(16)).toBe(false)
})

// Mutation survived: >= → >
// Missing: boundary test for exactly 18
```

Add boundary test:

```typescript
test('accepts exactly 18', () => {
  expect(validateAge(18)).toBe(true)
})

// Now mutation is caught
```

### Test Redundancy

Multiple tests verifying same thing:

```typescript
// Redundant tests
test('validates positive number', () => {
  expect(isPositive(5)).toBe(true)
})

test('validates another positive number', () => {
  expect(isPositive(10)).toBe(true)
})

test('validates yet another positive number', () => {
  expect(isPositive(100)).toBe(true)
})
```

Consolidate:

```typescript
test.each([5, 10, 100])('validates positive number %i', (num) => {
  expect(isPositive(num)).toBe(true)
})
```

## Continuous Quality Monitoring

### CI/CD Integration

**TypeScript**:

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: bun test --coverage

- name: Check coverage thresholds
  run: |
    coverage=$(bun test --coverage --json | jq '.coverage.total.statements.pct')
    if (( $(echo "$coverage < 80" | bc -l) )); then
      echo "Coverage $coverage% below 80% threshold"
      exit 1
    fi

- name: Run mutation testing
  run: bun x stryker run
  # Fail if mutation score < 75%
```

**Rust**:

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: cargo tarpaulin --fail-under 80

- name: Run mutation testing
  run: cargo mutants
  continue-on-error: true  # Warning only initially
```

### Tracking Over Time

Monitor trends:

```bash
# Generate coverage badge
coverage=$(bun test --coverage --json | jq '.coverage.total.statements.pct')
echo "Coverage: $coverage%" > coverage.txt

# Track mutation score
mutation=$(bun x stryker run --json | jq '.mutationScore')
echo "Mutation Score: $mutation%" > mutation.txt
```

## Advanced Techniques

### Differential Coverage

Only measure coverage on changed code:

```bash
# Get changed files
git diff --name-only main... > changed.txt

# Run coverage on changed files
bun test --coverage --changed-files changed.txt
```

### Coverage Ratcheting

Prevent coverage from decreasing:

```bash
# Save current coverage
current=$(bun test --coverage --json | jq '.coverage.total.statements.pct')
echo "$current" > .baseline-coverage

# On future runs, compare
baseline=$(cat .baseline-coverage)
if (( $(echo "$current < $baseline" | bc -l) )); then
  echo "Coverage decreased from $baseline% to $current%"
  exit 1
fi
```

### Mutation Testing Optimization

Run only on changed code:

```bash
# Stryker incremental mode
bun x stryker run --incremental

# cargo-mutants on specific files
cargo mutants --file src/auth/mod.rs
```

## Common Pitfalls

### Pitfall 1: Chasing 100% Coverage

**Problem**: Diminishing returns past 90%, testing trivial code

```typescript
// Trivial getter - not worth testing
class User {
  get email(): string {
    return this._email
  }
}
```

**Solution**: Focus on behavior, not line count. Exclude trivial code from coverage requirements.

### Pitfall 2: Gaming Metrics

**Problem**: Tests that execute code without verification

```typescript
// ❌ High coverage, zero value
test('calls all functions', () => {
  func1()
  func2()
  func3()
})
```

**Solution**: Use mutation testing to catch weak assertions.

### Pitfall 3: Slow Mutation Testing

**Problem**: Full mutation testing takes hours

**Solution**: Run incrementally or in CI only:

```bash
# Local: Quick feedback on changed files
bun x stryker run --mutate "src/auth/**/*.ts"

# CI: Full suite
bun x stryker run
```

## Quality Metrics Dashboard

Example report format:

```
Test Quality Report
===================

Coverage:
  Statements: 85.2% ░░░░░░░░▓▓
  Branches:   78.5% ░░░░░░░▓▓▓
  Functions:  82.1% ░░░░░░░░▓▓

Mutation Testing:
  Score:      78.0% ░░░░░░░▓▓▓
  Killed:     78
  Survived:   12
  No Cov:     8

Performance:
  Unit Tests: 2.3s  ✓
  Total:      8.7s  ✓

Status: ✓ All thresholds met
```

## Actionable Improvement Plan

1. **Week 1**: Establish baseline
   - Run coverage analysis
   - Run mutation testing
   - Document current state

2. **Week 2-3**: Fix critical gaps
   - Add tests for uncovered critical paths
   - Fix survived mutants in high-risk code
   - Target 80% coverage, 75% mutation score

3. **Week 4**: Automate
   - Add CI coverage checks
   - Set up coverage ratcheting
   - Schedule weekly mutation testing

4. **Ongoing**: Maintain
   - Review coverage on each PR
   - Run mutation testing monthly
   - Gradually raise thresholds

## Resources

TypeScript:
- [Stryker Documentation](https://stryker-mutator.io)
- [Bun Test Coverage](https://bun.sh/docs/cli/test#coverage)

Rust:
- [cargo-tarpaulin](https://github.com/xd009642/tarpaulin)
- [cargo-llvm-cov](https://github.com/taiki-e/cargo-llvm-cov)
- [cargo-mutants](https://github.com/sourcefrog/cargo-mutants)
