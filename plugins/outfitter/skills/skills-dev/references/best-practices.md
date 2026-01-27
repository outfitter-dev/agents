# Agent Skills Best Practices

Community-sourced patterns, techniques, and pitfalls from practitioners and official documentation.

## Table of Contents

- [Progressive Disclosure Architecture](#progressive-disclosure-architecture)
- [Skill Composition Patterns](#skill-composition-patterns)
- [Description Optimization](#description-optimization)
- [Common Pitfalls](#common-pitfalls)
- [Testing Strategies](#testing-strategies)
- [Advanced Techniques](#advanced-techniques)
- [Security Considerations](#security-considerations)
- [Organization-Wide Patterns](#organization-wide-patterns)

## Progressive Disclosure Architecture

**Three-tier information model**: Discovery → Activation → Execution

### Discovery Layer (~50 tokens)

YAML frontmatter that helps agents find the right skill without loading full content.

```yaml
---
name: pdf-processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

**Keys to effective discovery**:
- Include WHAT the skill does AND WHEN to use it
- Use third-person voice
- Include specific trigger terms users might mention
- Keep under 100 tokens

### Activation Layer (~2-5K tokens)

Core SKILL.md instructions loaded when skill is invoked.

**Structure**:

```markdown
# Skill Name

<when_to_use>
Clear criteria for when this skill applies
</when_to_use>

<workflow>
Step-by-step process (numbered or structured)
</workflow>

<rules>
- ALWAYS: Mandatory behaviors
- NEVER: Prohibited actions
- PREFER: Recommended approaches
</rules>

<references>
Links to deep-dive docs in references/ subdirectory
</references>
```

**Keys to effective activation**:
- **Assume intelligence**: Claude doesn't need basic concepts explained
- **Be directive, not comprehensive**: Focus on what makes THIS approach different
- **Keep under 500 lines**: Move details to references/
- **Use examples sparingly**: Only for non-obvious patterns

### Execution Layer (dynamic)

Deep-dive content loaded on-demand from references/ subdirectory.

**Pattern from practitioners**:

```
skill-name/
├── SKILL.md                    # Core workflow (500 lines max)
├── references/
│   ├── configuration.md        # Detailed config options
│   ├── error-handling.md       # Edge cases and recovery
│   ├── advanced-patterns.md    # Expert techniques
│   └── examples.md             # Worked examples
└── scripts/                    # Helper utilities
```

**Why this works** (source: Juan C Olamendy, skillmatic-ai):
- Prevents context rot from loading irrelevant information
- Allows targeted follow-up ("show me the advanced patterns")
- Keeps initial load fast and focused
- Scales to complex domains without overwhelming context

## Skill Composition Patterns

### Skills Invoking Skills

**Pattern**: Reference other skills in instructions rather than duplicating methodology.

```markdown
## Error Investigation

Load the **outfitter:debugging** skill using the Skill tool to investigate
this authentication failure systematically.

Pass these parameters to the debugging workflow:
- Error context: [collected error details]
- Hypothesis: Token validation timing issue
```

**Why this works**:
- Reuses established methodologies
- Maintains single source of truth
- Allows skills to evolve independently
- Reduces duplication across skill library

**Anti-pattern**: Embedding another skill's instructions inline.

### Subagent Architecture

For orchestrating specialized work with context isolation, see [claude-code.md](./claude-code.md#master-clone-architecture) for Claude Code-specific patterns.

### Skill + External Service Integration

Skills can integrate with external services (APIs, MCP servers) by separating concerns:
- **External service**: Handles authentication, rate limiting, data access
- **Skill**: Handles business logic, formatting, workflows

This separation enables reuse across similar domains.

## Description Optimization

**Goal**: Help Claude discover your skill without loading it.

### Include Both WHAT and WHEN

❌ **Vague**: "Processes PDFs"
✅ **Specific**: "Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."

### Use Third-Person Voice

❌ "Use me when you need to debug"
✅ "Debugs issues using systematic root cause analysis. Use when encountering errors, unexpected behavior, or test failures."

### Include Trigger Terms

Think about what users actually say:

```yaml
description: Creates weekly team status reports with wins, challenges, and priorities.
  Use when the user asks for a team update, standup report, weekly summary, or status
  email. Keywords: standup, weekly update, team report, status.
```

### Be Specific About Scope

❌ "Helps with testing"
✅ "Implements test-driven development using Red-Green-Refactor cycles. Use when implementing new features with tests first, refactoring with test coverage, or reproducing bugs as failing tests."

**Source**: Official Anthropic best practices emphasize specificity prevents Claude from loading irrelevant skills.

## Common Pitfalls

### 1. Making SKILL.md Too Verbose

**Symptom**: 1000+ line SKILL.md files with exhaustive explanations.

**Why it's a problem**:
- Wastes context window on every invocation
- Buries key directives in noise
- Assumes Claude needs basic concepts explained

**Fix**:
- Keep SKILL.md under 500 lines
- Move deep dives to references/
- Trust Claude's base knowledge
- Focus on WHAT makes THIS approach unique

**Example** (source: Anthropic best practices):

❌ **Verbose**:

```markdown
## What is Test-Driven Development?

Test-Driven Development (TDD) is a software development methodology where you write
tests before writing the actual code. This approach was popularized by Kent Beck
and has become a cornerstone of modern software engineering practices...

[500 lines of TDD philosophy]
```

✅ **Concise**:

```markdown
## TDD Workflow

1. **Red**: Write a failing test for the next small piece of functionality
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green

ALWAYS write the test first. NEVER skip the refactor step.
```

### 2. Negative-Only Constraints

**Symptom**: Instructions full of "NEVER do X" without alternatives.

❌ **Problem**:

```markdown
- NEVER use any types
- NEVER skip error handling
- NEVER commit without tests
```

**Why it's a problem**: Tells Claude what NOT to do but not what TO do.

✅ **Fix**: Pair constraints with positive alternatives:

```markdown
- ALWAYS use strict types; NEVER use `any`
- ALWAYS handle errors with Result types; NEVER let exceptions propagate silently
- ALWAYS run tests before committing; NEVER push untested code
```

### 3. Deeply Nested File References

**Symptom**: Skills referencing files that reference other files 3+ levels deep.

**Why it's a problem**:
- Context explosion
- Circular references
- Hard to maintain

**Fix** (source: skillmatic-ai research):
- Keep references ONE level deep
- Use table of contents in long reference files
- Let Claude request additional detail if needed

❌ **Deep nesting**:

```
SKILL.md → references/patterns.md → references/examples/auth.md → references/examples/auth/jwt.md
```

✅ **Flat structure**:

```
SKILL.md → references/auth-patterns.md (with ToC for JWT, OAuth, etc.)
```

### 4. Not Treating Skills Like Code

**Symptom**: Skills maintained as loose documents without version control, testing, or reviews.

**Why it's a problem**:
- Skills drift from reality
- Breaking changes go unnoticed
- No way to roll back problematic versions

**Fix** (source: blog.sshh.io, Nate's newsletter):
- **Version control**: Skills in git repos with semantic versioning
- **Testing**: Build evaluations to validate skill behavior
- **Reviews**: Treat skill PRs like code reviews
- **Changelog**: Document what changed and why

**Pattern from practitioners**:

```markdown
---
name: api-integration
version: 2.1.0
changelog: |
  2.1.0 - Added retry logic for rate limiting
  2.0.0 - Switched to streaming responses (breaking)
  1.5.0 - Added webhook verification
---
```

### 5. Over-Relying on Auto-Compaction

**Symptom**: Never manually clearing context, letting auto-compaction handle everything.

**Why it's a problem** (source: blog.sshh.io practitioner experience):
- Important context gets compressed or dropped
- Skill instructions get summarized incorrectly
- Debugging becomes harder when full skill isn't visible

**Fix**: Manual context management strategy:
1. Start complex tasks with `/clear` for clean slate
2. Use `/catchup` with explicit context about what skills are active
3. Let auto-compaction handle routine continuations
4. Force reload skills after compaction if behavior seems off

**When to manually clear**:
- Starting new major feature
- Switching between unrelated tasks
- After hitting context limits on complex debugging
- When skill behavior seems inconsistent

### 6. Unclear Skill Boundaries

**Symptom**: Skill tries to do too many unrelated things.

**Example**: "code-helper" that does linting, testing, documentation, deployment, and debugging.

**Why it's a problem**:
- Hard to discover (description too generic)
- Loads unnecessary context
- Becomes maintenance nightmare

**Fix**: **One skill, one job**.

✅ **Well-scoped skills**:
- `linting-workflow`: Code quality checks and fixes
- `tdd`: TDD methodology
- `api-documentation`: API reference generation
- `deployment-automation`: Deploy and rollback workflows
- `debugging`: Root cause investigation

**Exception**: Orchestrator skills that explicitly load other skills (like `feature-development` that loads TDD → documentation → deployment in sequence).

### 7. No Usage Examples

**Symptom**: Skill has abstract instructions but no concrete examples.

**Why it's a problem**: Claude may misinterpret intent without seeing desired output.

**Fix**: Include 1-2 examples in references/examples.md

**Pattern**:

```markdown
# Examples

## Example 1: Simple Case

**Input**: User asks to add login endpoint

**Workflow**:
1. Load TDD skill
2. Write failing test for /login POST
3. Implement minimal auth logic
4. Refactor to service layer

**Output**: [Show actual test code + implementation]

## Example 2: Edge Case

**Input**: User asks to add login with OAuth and JWT and refresh tokens

**Workflow**:
1. Load pathfinding skill to break down requirements
2. Load TDD skill for each component separately
3. OAuth integration → JWT generation → Refresh logic
4. Each gets its own test cycle

**Output**: [Show breakdown and test structure]
```

**Source**: Official Anthropic best practices recommend examples for non-obvious patterns.

## Testing Strategies

### Eval-Driven Development

**Pattern**: Build evaluations BEFORE extensive documentation (source: Nate's newsletter).

**Workflow**:
1. Create minimal skill version
2. Build test suite with target inputs/outputs
3. Iterate skill until evals pass consistently
4. THEN write comprehensive docs

**Why this works**:
- Prevents documenting the wrong approach
- Faster iteration cycles
- Forces clarity about success criteria
- Builds regression test suite automatically

**Implementation** (from Nate's debugging toolkit):

```typescript
// skill-testing-framework pattern
interface SkillEval {
  name: string;
  input: string;
  expectedBehavior: string[];
  forbiddenBehavior: string[];
  targetModels: ('haiku' | 'sonnet' | 'opus')[];
}

const tddSkillEvals: SkillEval[] = [
  {
    name: "basic-tdd-workflow",
    input: "Add a login endpoint",
    expectedBehavior: [
      "Writes test first",
      "Test fails initially (red phase)",
      "Implements minimal solution",
      "Test passes (green phase)",
      "Refactors with tests passing"
    ],
    forbiddenBehavior: [
      "Writes implementation before test",
      "Skips refactor step",
      "Makes test pass by modifying test"
    ],
    targetModels: ['haiku', 'sonnet', 'opus']
  }
];
```

### Multi-Model Testing

**Pattern**: Test skills with all target models.

**Why**: Haiku, Sonnet, and Opus interpret instructions differently:
- **Haiku**: Needs more explicit instructions, less inference
- **Sonnet**: Balanced reasoning, good for most workflows
- **Opus**: Handles complex context, better with ambiguity

**Testing strategy** (source: Anthropic best practices):

| Aspect | Haiku Test | Sonnet Test | Opus Test |
|--------|------------|-------------|-----------|
| Clarity | Do instructions work with minimal reasoning? | Do instructions balance brevity and clarity? | Do instructions leverage advanced reasoning? |
| Context | Works with small context? | Handles moderate references? | Manages large cross-references? |
| Edge cases | Explicit handling? | Reasonable inference? | Sophisticated judgment? |

**Fix pattern**: If Haiku fails but Sonnet passes, instructions likely assume too much inference.

### Real-World Usage Testing

**Pattern**: Test skills with actual users/agents in production-like scenarios.

**Anti-pattern**: Only testing with constructed examples.

**Strategy** (from practitioner experience):
1. **Dogfooding**: Use your own skills for real work
2. **Iteration tracking**: Log when skills are loaded but not followed
3. **Confusion signals**: Detect when Claude asks for clarification (skill might be unclear)
4. **Outcome validation**: Did the skill achieve its intended result?

**Metrics to track**:
- Skill load frequency (is it discoverable?)
- Completion rate (do workflows finish?)
- User satisfaction (did it solve the problem?)
- Iteration count (how many tries to get it right?)

**From blog.sshh.io**: "Built 10 debugging tools after watching 100 people hit the same problems in their first week."

### Systematic Evaluation Framework

**Components** (source: Nate's newsletter, skillmatic-ai research):

1. **skill-debugging-assistant**: Identifies where skills fail
2. **skill-security-analyzer**: Checks for security risks in skill code
3. **skill-gap-analyzer**: Finds missing skills in your library
4. **skill-performance-profiler**: Tracks context usage and latency
5. **prompt-optimization-analyzer**: Improves skill descriptions for discovery
6. **skill-testing-framework**: Automated test runner for skills

**Pattern**: Build tools to test tools.

## Advanced Techniques

### Hook-Based Validation

For platform-specific hook implementation patterns, see [claude-code.md](./claude-code.md#hook-based-validation).

**General principle**: Use hooks to enforce constraints at decision points—prevent destructive operations, enforce testing requirements, validate configuration before deployment.

### Organization-Wide Skill Libraries

**Pattern**: Centralized skill repository as institutional knowledge (source: Juan C Olamendy, Medium).

**Structure**:

```
company-skills/
├── engineering/
│   ├── deployment-workflow/
│   ├── incident-response/
│   └── architecture-review/
├── product/
│   ├── user-story-creation/
│   └── feature-planning/
└── business/
    ├── team-standup/
    └── quarterly-planning/
```

**Benefits**:
- Codifies company processes
- Onboarding material becomes executable
- Process improvements propagate automatically
- Consistency across teams

**Implementation** (from practitioners):
1. **Central registry**: Marketplace or internal skill server
2. **Contribution guidelines**: Templates for creating company skills
3. **Review process**: Skills reviewed like code before publishing
4. **Version management**: Semantic versioning for breaking changes
5. **Deprecation policy**: How to sunset old patterns

**Pattern from blog.sshh.io**:

```markdown
# Company Skill Manifest

## Deployment
- `deployment-staging`: Deploy to staging with rollback plan
- `deployment-production`: Production deploy with checklist
- `deployment-rollback`: Emergency rollback procedures

## Code Review
- `pr-review-backend`: Backend code review checklist
- `pr-review-frontend`: Frontend code review standards
- `security-review`: Security-focused code review

## Documentation
- `api-documentation`: OpenAPI spec generation
- `readme-maintenance`: README updates for features
```

**Anti-pattern**: Every team building their own version of the same workflows.

### Progressive Skill Disclosure in Practice

**Advanced pattern**: Table of contents in reference files for targeted loading.

**Example** (source: skillmatic-ai architecture):

```markdown
# API Integration Patterns

## Table of Contents

- [REST Basics](#rest-basics) - Standard CRUD operations
- [GraphQL](#graphql) - Query and mutation patterns
- [Webhooks](#webhooks) - Event-driven integrations
- [Rate Limiting](#rate-limiting) - Backoff and retry
- [Authentication](#authentication) - OAuth, JWT, API keys
- [Error Handling](#error-handling) - Retry logic and fallbacks

## REST Basics

[Focused content on REST]

## GraphQL

[Focused content on GraphQL]
```

**Usage**: Skill says "See references/api-patterns.md#rate-limiting for retry logic" rather than loading entire file.

**Why it works**:
- Claude can navigate to specific section
- Preserves context for other tasks
- User can request more depth if needed

### Skills as Living Documentation

**Pattern**: Skills replace static documentation that goes stale.

**Traditional docs**: "Here's how to deploy" (written once, outdated quickly)
**Skill**: Executes deployment with current best practices

**Benefits** (source: Juan C Olamendy):
- **Always current**: If process changes, skill changes
- **Executable**: Not just instructions but enforcement
- **Testable**: Verify the process actually works
- **Discoverable**: Claude can find relevant process

**Example transformation**:

❌ **Static doc** (docs/deployment.md):

```markdown
# Deployment Process

1. Run tests
2. Update version number
3. Build production bundle
4. Upload to S3
5. Clear CDN cache
6. Notify team in Slack

[This gets outdated when we switch to Vercel]
```

✅ **Skill** (skills/deployment/SKILL.md):

```markdown
---
name: deployment-production
description: Deploys to production with safety checks
---

# Production Deployment

1. Verify all tests pass: `bun test`
2. Run build: `bun run build`
3. Deploy to Vercel: `vercel --prod`
4. Verify deployment: Check /api/health
5. Notify team: Use Slack MCP to post to #deployments

ALWAYS wait for health check before considering deploy complete.
```

**When process changes**: Update skill, test it, deploy new version. Documentation stays current.

### Skill Chaining for Complex Workflows

**Pattern**: Master skill orchestrates sequence of specialized skills.

**Example** (source: practitioner patterns):

```markdown
---
name: feature-development
description: End-to-end feature development workflow
---

# Feature Development Workflow

## Stage 1: Planning
Load **pathfinding** skill to clarify requirements and architecture.

## Stage 2: Implementation
Load **tdd** skill to implement with tests.

## Stage 3: Documentation
Load **api-documentation** skill to generate API docs.

## Stage 4: Review
Load **code-review** skill to validate implementation.

## Stage 5: Deployment
Load **deployment-staging** skill to deploy for testing.

Each stage must complete successfully before proceeding to next.
```

**Advantage**: Each specialized skill can evolve independently. Feature-development orchestrates but doesn't duplicate.

**Related pattern - Conditional chaining**:

```markdown
## Error Recovery

If tests fail in Stage 2:
  Load **debugging** skill to investigate
  Return to Stage 2 after fixes

If code review finds issues in Stage 4:
  Return to Stage 2 for fixes
  Re-run Stage 3 to update docs
  Re-run Stage 4 to re-review
```

## Security Considerations

**Critical warning** (source: Sid Bharath tutorial, security research): Skills can execute arbitrary code and access files. Only use skills from trusted sources.

### Risks

1. **Code execution**: Skills can include scripts that run on your machine
2. **File access**: Skills can read/write files in project
3. **Network access**: Skills can make HTTP requests
4. **Credential access**: Skills can access environment variables, config files
5. **Social engineering**: Malicious skills disguised as helpful tools

### Protection Strategies

**1. Source verification**:
- Only install skills from trusted authors
- Review skill code before using
- Check community reputation and reviews
- Verify skill matches description (no hidden behavior)

**2. Code review checklist** (from security research):

```markdown
## Skill Security Review

- [ ] Review all scripts in scripts/ directory
- [ ] Check for file system access patterns
- [ ] Verify network requests are legitimate
- [ ] Confirm no credential harvesting
- [ ] Check for obfuscated code
- [ ] Validate external dependencies
- [ ] Test in isolated environment first
```

**3. Sandbox testing**:
- Test new skills in isolated project first
- Use throwaway credentials for initial testing
- Monitor file system and network activity
- Check for unexpected side effects

**4. Minimal permissions**:

```yaml
# Proposed security metadata (from research)
permissions:
  file_read: ['src/**', 'docs/**']
  file_write: ['docs/**']
  network: ['https://api.company.com']
  environment: []
```

**5. Audit logging**:
Track what skills do in production:
- What files were accessed?
- What commands were executed?
- What network requests were made?

**From security papers**: "Skills are code execution with conversational interface. Treat them with same security rigor as any code dependency."

## Organization-Wide Patterns

### Skill as Institutional Knowledge

**Pattern**: Replace tribal knowledge with executable skills (source: Juan C Olamendy).

**Traditional problem**:
- "How do we deploy?" → Ask Sarah, she knows
- "What's the PR review process?" → Different on every team
- "How do we handle incidents?" → Check the wiki (outdated)

**Skill solution**:
- **deployment-production skill**: Encodes Sarah's knowledge
- **pr-review skill**: Standardizes review process
- **incident-response skill**: Current playbook, always up to date

**Implementation strategy**:

1. **Identify critical workflows**: What knowledge is locked in people's heads?
2. **Interview experts**: How do they actually do the work?
3. **Create skills**: Encode process as executable workflow
4. **Test with novices**: Can someone unfamiliar complete the task?
5. **Iterate**: Refine based on real usage
6. **Deprecate docs**: Point to skills instead of wikis

**Example from blog.sshh.io**:

```markdown
---
name: internal-deploy
description: Company deployment process with all safety checks
---

# Internal Deployment Workflow

## Pre-Deploy Checklist
1. Verify Jira ticket is in "Ready for Deploy" status
2. Confirm tests pass in CI: `check-ci-status`
3. Get approval in #deploy-requests Slack channel

## Deploy
1. Run staging deploy: `npm run deploy:staging`
2. Verify staging health: `curl https://staging.company.com/health`
3. Run smoke tests: `npm run smoke-test:staging`
4. Deploy to production: `npm run deploy:prod`
5. Monitor for 5 minutes: Watch Datadog dashboard

## Post-Deploy
1. Verify production health: `curl https://company.com/health`
2. Post to #deployments: "Deployed [feature] to prod"
3. Update Jira ticket to "Deployed"

NEVER skip smoke tests. ALWAYS monitor after deploy.
```

**Benefit**: New team members can deploy safely on day one.

### Contribution Guidelines

**Pattern**: Treat skills like open source contributions.

**Template** (from ComposioHQ awesome-claude-skills):

```markdown
# Contributing Skills

## Before Submitting

1. **Test thoroughly**: Run skill with Haiku, Sonnet, and Opus
2. **Follow structure**: Use provided skill template
3. **Document clearly**: Include description, when to use, examples
4. **Security review**: No malicious code or credential access
5. **License**: MIT or Apache 2.0

## Skill Requirements

- [ ] Descriptive name (kebab-case)
- [ ] Clear description with trigger terms
- [ ] SKILL.md under 500 lines
- [ ] References in references/ subdirectory
- [ ] At least one example in examples/
- [ ] Testing results documented
- [ ] README.md with usage instructions

## Review Process

1. Submit PR with skill in skills/your-skill-name/
2. Maintainers review for quality and security
3. Address feedback
4. Approved skills merged and published
```

### Versioning Strategy

**Pattern**: Semantic versioning for skills (from practitioners).

**Format**: MAJOR.MINOR.PATCH

```yaml
---
name: api-integration
version: 2.1.0
---
```

**Versioning rules**:
- **MAJOR**: Breaking changes (workflow steps changed, different inputs required)
- **MINOR**: New features (additional optional steps, new references added)
- **PATCH**: Bug fixes (typos, clarifications, small improvements)

**Breaking change example**:

```markdown
# Version 1.x: Required user to provide API key
---
name: api-client
version: 1.5.0
description: Make API calls with provided credentials
---

# Version 2.x: Uses MCP server for authentication (breaking)
---
name: api-client
version: 2.0.0
description: Make API calls using Linear MCP server
---
```

**Migration guide pattern**:

```markdown
# Migration Guide: 1.x → 2.0

## Breaking Changes

- No longer accepts `api_key` parameter
- Now requires Linear MCP server configured
- Response format changed from JSON to structured objects

## Migration Steps

1. Install Linear MCP server: `/mcp install linear`
2. Update skill invocations to remove `api_key`
3. Update code expecting JSON to handle structured objects
```

## Summary: Hierarchy of Best Practices

### Essential (Do These Always)

1. **Progressive disclosure**: Keep SKILL.md under 500 lines, use references/
2. **Clear descriptions**: Include what AND when, with trigger terms
3. **Assume intelligence**: Claude doesn't need basics explained
4. **Test with real usage**: Dogfood your own skills
5. **Version control**: Track changes, review like code

### Important (Do These Usually)

6. **Multi-model testing**: Verify Haiku, Sonnet, Opus behavior
7. **Positive constraints**: Say what TO do, not just what NOT to do
8. **Examples for non-obvious**: Show expected behavior
9. **Composition over duplication**: Reference other skills
10. **Security review**: Audit code execution and file access

### Advanced (Do These for Scale)

11. **Eval-driven development**: Build tests before extensive docs
12. **Hook-based enforcement**: Use PreToolUse for quality gates
13. **Organization-wide libraries**: Centralized skill registry
14. **Semantic versioning**: Track breaking changes
15. **Skills as living docs**: Replace static documentation

### Expert (Do These for Excellence)

16. **Systematic evaluation framework**: Build tools to test tools
17. **Master-Clone architecture**: Optimize context usage
18. **Conditional skill chaining**: Orchestrate complex workflows
19. **Audit logging**: Track skill execution in production
20. **Community contribution**: Share patterns, learn from others

## Sources

Research synthesized from:

- **Official Documentation**: Anthropic Claude Agent Skills Best Practices
- **Community Repositories**: ComposioHQ/awesome-claude-skills, skillmatic-ai/awesome-agent-skills
- **Practitioner Blogs**: blog.sshh.io (Claude Code at scale), Juan C Olamendy (Medium), Sid Bharath
- **Research**: Security considerations from academic papers, progressive disclosure architecture
- **Tooling**: Nate's Newsletter (debugging toolkit), evaluation frameworks

Last updated: 2026-01-10
