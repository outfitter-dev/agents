# Workflow: Collect Evidence

Understand what's actually happening before proposing any fixes.

<when_to_use>

- Starting fresh on a bug report
- No reproduction steps yet
- Error message unclear
- Symptoms but no root cause hypothesis

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/evidence-patterns.md - diagnostic techniques
2. references/reproduction.md - reproduction strategies

</required_reading>

<process>

## Step 1: Read Error Messages Completely

- Stack traces top to bottom
- Note file paths, line numbers, variable names
- Look for "caused by" chains
- Copy exact error text for reference

## Step 2: Reproduce Consistently

Document exact trigger steps:
- What inputs cause the failure?
- What inputs don't cause the failure?
- Is it intermittent (timing, race conditions)?
- Does it reproduce in a clean environment?

```bash
# Minimal reproduction script
git checkout <commit>
bun install
bun test <specific-test>
```

## Step 3: Check Recent Changes

```bash
# What changed recently?
git diff HEAD~5..HEAD

# Recent commits
git log --oneline -10

# When did it last work?
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
```

Also check:
- Dependency updates (package.json, Cargo.toml)
- Config/environment changes
- Infrastructure changes

## Step 4: Gather Evidence

Add diagnostic logging:

```typescript
// Log function entry/exit
console.log('[DEBUG] fetchUser called:', { userId, timestamp: Date.now() });

// Log variable transformations
console.log('[DEBUG] before transform:', data);
const result = transform(data);
console.log('[DEBUG] after transform:', result);

// Log timing
const start = performance.now();
await operation();
console.log('[DEBUG] operation took:', performance.now() - start, 'ms');
```

## Step 5: Trace Data Flow Backward

Find the first place the value becomes wrong:

1. Where is the bad value used?
2. Where does it come from?
3. What transforms it?
4. Where does it enter the system?

Document the chain: `output <- transform <- fetch <- input`

</process>

<red_flags>

STOP and stay in this stage if you catch yourself:

- "I think maybe X is the problem"
- "Let's try changing Y"
- "It might be related to Z"
- Starting to write code before understanding
- Proposing solutions without evidence

ALL mean: more evidence needed.

</red_flags>

<anti_patterns>

Avoid:
- Skimming error messages
- Assuming you know the cause
- Jumping to hypothesis without evidence
- Single reproduction attempt

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Error message fully documented
- [ ] Reproduction steps written down
- [ ] Can trigger bug consistently
- [ ] Recent changes reviewed
- [ ] Data flow traced at least one level
- [ ] Evidence collected (logs, values, timing)
- [ ] Ready to form hypothesis

</success_criteria>

<next_steps>

- Narrow scope: Load `workflows/isolate-variables.md`
- Have hypothesis already: Load `workflows/test-hypothesis.md`

</next_steps>
