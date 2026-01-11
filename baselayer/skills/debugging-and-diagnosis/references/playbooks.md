# Bug-Type Playbooks

Investigation focus and techniques by bug category.

## Runtime Errors

Crashes, exceptions, uncaught errors.

**Investigation focus:**
- Stack trace analysis (line, function, call chain)
- Variable state at crash point
- Input values that trigger crash
- Environment differences (dev vs prod)

**Common causes:**
- Null/undefined access
- Type mismatches
- Array out of bounds
- Missing error handling
- Resource exhaustion

**Techniques:**
- Add try-catch with detailed logging
- Validate assumptions with assertions
- Check null/undefined before access
- Log input values before processing

## Logic Bugs

Wrong result, unexpected behavior.

**Investigation focus:**
- Expected vs actual output comparison
- Data transformations step by step
- Conditional logic evaluation
- State changes over time

**Common causes:**
- Off-by-one errors
- Incorrect comparison operators
- Wrong order of operations
- Missing edge case handling
- State not reset between operations

**Techniques:**
- Print intermediate values
- Step through with debugger
- Write test cases for edge cases
- Check loop boundaries

## Integration Failures

API, database, external service issues.

**Investigation focus:**
- Request/response logging
- Network traffic inspection
- Authentication/authorization
- Data format mismatches
- Timing and timeouts

**Common causes:**
- API version mismatch
- Authentication token expired
- Wrong content-type headers
- Data serialization differences
- Network timeout too short
- Rate limiting

**Techniques:**
- Log full request/response
- Test with curl/httpie directly
- Check API documentation version
- Verify credentials and permissions
- Monitor network timing

## Intermittent Issues

Works sometimes, fails others.

**Investigation focus:**
- What's different when it fails?
- Timing dependencies
- Shared state/resources
- External conditions
- Concurrency issues

**Common causes:**
- Race conditions
- Cache inconsistency
- Clock/timezone issues
- Resource contention
- External service flakiness

**Techniques:**
- Add timestamps to all logs
- Run many times to find pattern
- Check for async operations
- Look for shared mutable state
- Test under different loads

## Performance Issues

Slow, memory leaks, high CPU.

**Investigation focus:**
- Profiling and metrics
- Resource usage over time
- Algorithm complexity
- Data volume scaling
- Memory allocation patterns

**Common causes:**
- N+1 queries
- Inefficient algorithms
- Memory leaks (unreleased resources)
- Excessive allocations
- Missing indexes
- Unbounded caching

**Techniques:**
- Profile with appropriate tools
- Measure time/memory at checkpoints
- Test with various data sizes
- Check for cleanup in destructors
- Monitor resource usage trends
