# Agent Types

Common agent archetypes and their characteristics.

## Analysis Agents

**Purpose:** Examine and report without modifying.

**Characteristics:**
- Read-only operations
- Detailed reporting
- Recommendations, no implementation
- Metrics and measurements

**Example tasks:** "Analyze performance", "Find memory leaks", "Review bundle size"

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

## Implementation Agents

**Purpose:** Build and modify code.

**Characteristics:**
- Creates/modifies code
- Follows templates and patterns
- Implements specifications

**Example tasks:** "Create component", "Implement feature", "Build API endpoint"

```yaml
# Usually inherit full access (no tools field)
```

## Review Agents

**Purpose:** Provide feedback and suggestions.

**Characteristics:**
- Evaluates existing code
- Specific, actionable feedback
- Rates/scores quality
- Suggests improvements

**Example tasks:** "Review this PR", "Check code quality", "Evaluate architecture"

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

## Testing Agents

**Purpose:** Create and manage tests.

**Characteristics:**
- Generates test code
- Runs test suites
- Analyzes coverage
- Identifies gaps

**Example tasks:** "Create tests for X", "Improve coverage", "Add edge case tests"

```yaml
tools: Glob, Grep, Read, Write, Edit, Bash, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

## Migration Agents

**Purpose:** Transform code from one form to another.

**Characteristics:**
- Systematic transformation
- Preserves functionality
- Gradual approach
- Validation at each step

**Example tasks:** "Migrate to TypeScript", "Update to new API", "Refactor to pattern"

```yaml
tools: Glob, Grep, Read, Write, Edit, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

## Research Agents

**Purpose:** Find information and synthesize knowledge.

**Characteristics:**
- Information gathering
- Source verification
- Synthesis and summary
- Citation and linking

**Example tasks:** "Research how to X", "Find examples of Y", "Best practice for Z"

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, WebSearch, WebFetch
```

## Deployment Agents

**Purpose:** Handle deployment and infrastructure.

**Characteristics:**
- Infrastructure operations
- Deployment procedures
- Safety checks
- Monitoring integration

**Example tasks:** "Deploy to staging", "Rollback deployment", "Check cluster health"

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash(kubectl *), Bash(docker *)
```

## Choosing an Archetype

```
Need to examine without changing?     → Analysis
Need to build or modify code?         → Implementation
Need to evaluate and give feedback?   → Review
Need to create or run tests?          → Testing
Need to transform existing code?      → Migration
Need to gather external information?  → Research
Need to manage infrastructure?        → Deployment
```
