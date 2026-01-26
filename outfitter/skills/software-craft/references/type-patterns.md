# Type Safety Patterns

Language-agnostic principles for type-safe software design.

## Core Philosophy

**Make illegal states unrepresentable**

The fundamental goal of type safety: if a state is invalid, the type system should reject it at compile time. Don't rely on runtime checks to catch impossible combinations—structure types so they can't exist.

**Type safety hierarchy**:
1. Correct — no runtime type errors possible
2. Clear — types serve as documentation
3. Precise — exact constraints, not overly broad

## Result Types

**The Problem**

Exceptions hide failure modes from function signatures. Callers can't tell from the type alone that a function might fail.

**The Solution**

Return types that explicitly model success and failure. The caller must handle both cases—the type system enforces it.

**Key Properties**:
- Success and error are mutually exclusive branches
- Error types are specific, not generic "Error"
- Callers handle errors explicitly, not via try/catch
- Compiler verifies all cases handled

**When to Use**:
- Operations that can fail (I/O, parsing, validation)
- Business logic with multiple outcome types
- Any function where callers should handle failure

**When Not to Use**:
- Truly exceptional cases (out of memory, corrupted state)
- Internal assertions that indicate bugs

## Discriminated Unions

**The Problem**

Loose object types allow impossible state combinations. A request object with status "loading" shouldn't have data or error fields—but loose types permit this.

**The Solution**

Model each state as a separate branch in a union, distinguished by a discriminator field. Each branch contains only the fields valid for that state.

**Key Properties**:
- Single discriminator field (usually `type` or `status`)
- Each branch has different required fields
- Pattern matching exhaustively handles all branches
- Compiler errors if a branch is unhandled

**Common Applications**:
- Request/loading states (idle, loading, success, error)
- Form states (editing, submitting, submitted, error)
- Authentication (anonymous, authenticated, admin)
- Any multi-state entity

## Branded Types

**The Problem**

Primitives of the same underlying type are interchangeable. A user ID and product ID are both strings—the type system can't distinguish them.

**The Solution**

"Brand" types with a phantom marker that exists only at compile time. The runtime representation is unchanged, but the compiler treats them as distinct types.

**Key Properties**:
- Compile-time distinction, zero runtime overhead
- Smart constructors validate and brand values
- Cannot accidentally pass wrong branded type
- Enforces validation at construction

**Common Applications**:
- Entity IDs (user, product, order)
- Sanitized strings (HTML, SQL, paths)
- Validated formats (email, URL, phone)
- Units (meters, pixels, seconds)

## Parse, Don't Validate

**The Principle**

Don't validate data and continue using the untyped version. Parse it into a typed structure, then work only with the typed version.

**Key Insight**

Validation answers "is this valid?" but leaves data untyped. Parsing answers "what is this?" and produces typed data. After parsing, the type system guarantees validity.

**Application**:
- API responses → parse into domain types
- User input → parse into validated types
- Configuration → parse into typed config
- Files → parse into structured data

**Boundary Rule**:
Parse at system boundaries. Inside the boundary, trust the types.

## Runtime Validation at Boundaries

**System Boundaries**

External data enters untyped:
- HTTP request/response bodies
- File contents
- Environment variables
- User input
- Database results (sometimes)
- Third-party API responses

**Inside vs Outside**

- Outside the boundary: data is untyped, validation required
- Inside the boundary: data is typed, trust the types

**Validation Strategy**:
1. Accept untyped data at boundary
2. Validate and parse into typed structure
3. Reject invalid data with clear errors
4. Pass typed data to internal functions
5. Internal functions trust their input types

## Exhaustive Pattern Matching

**The Principle**

When handling discriminated unions, ensure all branches are covered. The compiler should error if a new branch is added but not handled.

**Implementation Pattern**

Use a "never" check in the default case. If a new branch is added to the union, the compiler will error because the new case falls through to the never check.

**Benefits**:
- Compiler enforces completeness
- Adding new states requires updating all handlers
- No silent failures from unhandled cases

## Type Narrowing

**The Principle**

Control flow should inform the type system. After checking a condition, subsequent code should have access to the narrowed type.

**Applications**:
- Null checks narrow `T | null` to `T`
- Type guards narrow `unknown` to specific types
- Discriminator checks narrow unions to specific branches
- instanceof checks narrow class hierarchies

## See Also

For TypeScript-specific implementations of these patterns:
- Load `typescript-dev/SKILL.md` for code examples
- Result types, branded types, discriminated unions with TypeScript syntax
- Zod for runtime validation with type inference
