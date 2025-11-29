# Implementation Checklist

## Phase 1: Foundation Skills

### 1.1 conversation-analysis Skill

- [ ] Create directory: `outfitter/skills/conversation-analysis/`
- [ ] Create `SKILL.md` with frontmatter (third-person description)
- [ ] Write signal taxonomy section
- [ ] Write analysis process section
- [ ] Write output format section
- [ ] Create `references/signal-patterns.md`
- [ ] Create `references/extraction-techniques.md`
- [ ] Create `examples/sample-analysis.md`
- [ ] Validate: description has trigger phrases
- [ ] Validate: body uses imperative style
- [ ] Validate: under 2,000 words in SKILL.md
- [ ] Test: skill triggers on relevant queries

### 1.2 workflow-patterns Skill

- [ ] Create directory: `outfitter/skills/workflow-patterns/`
- [ ] Create `SKILL.md` with frontmatter
- [ ] Write pattern types section
- [ ] Write component mapping section
- [ ] Write pattern specification section
- [ ] Create `references/pattern-types.md`
- [ ] Create `references/component-mapping.md`
- [ ] Create `examples/workflow-pattern.md`
- [ ] Create `examples/orchestration-pattern.md`
- [ ] Create `examples/heuristic-pattern.md`
- [ ] Validate: description has trigger phrases
- [ ] Validate: body uses imperative style
- [ ] Validate: under 1,500 words in SKILL.md
- [ ] Test: skill triggers on relevant queries

## Phase 2: Agent

### 2.1 pattern-analyzer Agent

- [ ] Create file: `outfitter/agents/pattern-analyzer.md`
- [ ] Write frontmatter with name, description, model, color, tools
- [ ] Write description with 3 example blocks
- [ ] Write system prompt with:
  - [ ] Core responsibilities
  - [ ] Analysis process (5 steps)
  - [ ] Output format (JSON structure)
  - [ ] Edge cases
  - [ ] Quality standards
- [ ] Validate: description uses third-person
- [ ] Validate: system prompt uses second-person
- [ ] Validate: examples show context, user, assistant, commentary
- [ ] Test: agent triggers on relevant Task calls
- [ ] Test: agent loads skills correctly
- [ ] Test: agent returns structured output

## Phase 3: Command

### 3.1 patternify Command

- [ ] Create file: `outfitter/commands/patternify.md`
- [ ] Write frontmatter (description, argument-hint, allowed-tools)
- [ ] Write Phase 1: Analyze (Task tool launch)
- [ ] Write Phase 2: Present (AskUserQuestion)
- [ ] Write Phase 3: Refine (jam skill integration)
- [ ] Write Phase 4: Component type detection
- [ ] Write Phase 5: Location picker (smart defaults)
- [ ] Write Phase 6: File generation
- [ ] Write Phase 7: Confirmation
- [ ] Write error handling section
- [ ] Write usage examples
- [ ] Validate: allowed-tools includes all needed tools
- [ ] Test: command appears in /commands list
- [ ] Test: full workflow end-to-end

## Phase 4: Integration Testing

### 4.1 Unit Tests

- [ ] Test conversation-analysis with sample conversation
- [ ] Test workflow-patterns with known patterns
- [ ] Test pattern-analyzer with real transcript
- [ ] Test patternify command phases individually

### 4.2 End-to-End Tests

- [ ] Test `/patternify` (no arguments) in real session
- [ ] Test `/patternify "specific hint"` with focused analysis
- [ ] Test composite detection and generation
- [ ] Test all location options (plugin, project, personal)
- [ ] Test error cases (no patterns, jam doesn't converge)

### 4.3 Output Validation

- [ ] Generated skill follows plugin-dev best practices
- [ ] Generated command has proper frontmatter
- [ ] Generated agent has proper structure
- [ ] Generated hook has valid hooks.json
- [ ] Generated composite works together

## Phase 5: Documentation

- [ ] Update outfitter README with /patternify
- [ ] Add usage examples to docs
- [ ] Document known limitations
- [ ] Add troubleshooting guide

## Definition of Done

- [ ] All skills load on expected triggers
- [ ] Agent produces structured output
- [ ] Command completes full workflow
- [ ] Generated components are valid
- [ ] Generated components work immediately
- [ ] Documentation is complete
