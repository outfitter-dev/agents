# Workflow: REFACTOR Phase

Enhance code quality without changing behavior. Tests must continue passing after every change.

<when_to_use>

- Tests passing from GREEN phase
- Code works but is messy
- Ready to improve quality
- Before marking feature complete

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/quality-metrics.md - coverage analysis, mutation testing

</required_reading>

<process>

## Step 1: Identify Improvements

Look for:
- Duplicated code to extract
- Unclear names to improve
- Complex conditionals to simplify
- Missing type safety
- Hard-coded values to parameterize

Don't try to fix everything at once. Pick one improvement.

## Step 2: Make Single Change

Apply one refactoring at a time:

**Extract common patterns:**

```typescript
// Before
if (!creds.password) return { type: 'error', code: 'MISSING_PASSWORD' };
if (!isValidEmail(creds.email)) return { type: 'error', code: 'INVALID_EMAIL' };

// After
function validateCredentials(creds: Credentials): AuthResult | null {
  if (!creds.password) return { type: 'error', code: 'MISSING_PASSWORD' };
  if (!isValidEmail(creds.email)) return { type: 'error', code: 'INVALID_EMAIL' };
  return null; // Valid
}
```

**Improve type safety:**

```typescript
// Before
type UserId = string;

// After - branded type prevents mixing IDs
type UserId = string & { readonly __brand: 'UserId' };
```

**Improve naming:**

```typescript
// Before
function process(d: unknown) { ... }

// After
function validateAndNormalizeUserInput(rawInput: unknown) { ... }
```

## Step 3: Run Tests After Each Change

```bash
# After EVERY refactoring
bun test

# Must still pass!
```

If tests fail, the refactoring changed behavior. Revert and try differently.

## Step 4: Rust Refactoring

```rust
// Extract validation
fn validate_credentials(creds: &Credentials) -> Result<(), AuthError> {
    if creds.password.is_empty() {
        return Err(AuthError::MissingPassword);
    }
    if !is_valid_email(&creds.email) {
        return Err(AuthError::InvalidEmail);
    }
    Ok(())
}

// Newtype for safety
pub struct Email(String);

impl Email {
    pub fn new(value: &str) -> Result<Self, ValidationError> {
        if is_valid_email(value) {
            Ok(Email(value.to_string()))
        } else {
            Err(ValidationError::InvalidEmail)
        }
    }
}
```

## Step 5: Check Quality Metrics

```bash
# Coverage
bun test --coverage
# Target: >=80% line coverage

# Mutation testing (if configured)
bun x stryker run
# Target: >=75% mutation score
```

## Step 6: Commit

```bash
git add -A
git commit -m "refactor: extract credential validation"
```

One commit per logical refactoring. Don't bundle unrelated changes.

</process>

<refactoring_checklist>

Consider applying:
- [ ] Extract function for repeated logic
- [ ] Rename unclear variables/functions
- [ ] Add discriminated unions for state
- [ ] Add branded types for IDs
- [ ] Simplify complex conditionals
- [ ] Remove dead code
- [ ] Add missing type annotations

</refactoring_checklist>

<boundaries>

**Do:**
- Run tests after every change
- Commit frequently
- Improve readability
- Add type safety
- Extract reusable patterns

**Don't:**
- Change test behavior
- Add new features
- Change API contracts
- Skip test runs
- Bundle unrelated changes

</boundaries>

<anti_patterns>

Avoid:
- Changing test assertions during refactor
- Adding new functionality
- Multiple unrelated refactorings per commit
- Skipping test runs between changes
- "Improving" working code into broken code

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] All tests still pass
- [ ] Code quality improved
- [ ] No behavior changes
- [ ] Coverage maintained or improved
- [ ] Committed: `refactor: [improvement description]`
- [ ] Ready to verify or start next feature

</success_criteria>

<next_steps>

- Refactoring complete: Load `workflows/verify.md` or start new RED cycle
- Task done: Mark "Refactor" `completed`
- More features: Create new "Red" task for next feature

</next_steps>
