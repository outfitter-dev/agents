# Performance Considerations

Token impact and optimization strategies for Claude Code skills.

## Token Impact

Every skill activation loads the full SKILL.md into context.

| SKILL.md Size | Approximate Tokens |
|---------------|-------------------|
| 100 lines | ~700 tokens |
| 300 lines | ~2,000 tokens |
| 500 lines | ~3,500 tokens |
| 1,000 lines | ~7,000 tokens |
| 1,500 lines | ~10,000 tokens |

**Rule**: Keep SKILL.md under 500 lines. Use progressive disclosure for details.

## Progressive Disclosure

Move details out of SKILL.md:

```
skill-name/
+-- SKILL.md           # Core workflow (~300 lines)
+-- references/        # Deep-dive docs
|   +-- patterns.md
|   +-- edge-cases.md
+-- examples/          # Worked examples
```

**Loading pattern**:
1. SKILL.md loads on activation (~2,000 tokens)
2. References load only when explicitly needed
3. Examples load only for clarification

## Tool Restrictions Reduce Latency

Without `allowed-tools`: Claude asks permission for each tool.
With `allowed-tools`: Listed tools run immediately.

```yaml
# Fast (no permission prompts)
allowed-tools: Read Grep Glob

# Slower (prompts for unlisted tools)
# (no allowed-tools field)
```

## Context Mode Optimization

### When to Fork

| Scenario | Recommendation |
|----------|----------------|
| Verbose intermediate work | Fork (keeps main context clean) |
| Parallel independent tasks | Fork (run simultaneously) |
| Building on conversation | Inherit (needs prior context) |
| Simple one-shot task | Either (fork slightly cleaner) |

Fork trades context sharing for isolation. Each fork starts fresh.

### Fork Overhead

Each forked skill invocation:
- Loads skill instructions fresh
- No conversation history
- Returns only final output

Benefit: Main context stays lean
Cost: No state sharing between forks

## Description Efficiency

Descriptions load into system prompt for every message. Keep them concise.

```yaml
# Good: Concise, specific
description: Parse PDF files for text extraction. Use when working with .pdf files.

# Bad: Verbose, redundant
description: This skill is designed to help you parse and extract text content from PDF files. It can be used whenever you need to work with PDF documents, extract text, or process PDF files for analysis.
```

## Activation Efficiency

### Auto-Activation

Claude evaluates skill descriptions against user input. More specific descriptions activate faster (fewer false considerations).

```yaml
# Specific (fast match)
description: Extract tables from Excel .xlsx files

# Vague (many false considerations)
description: Work with files and data
```

### Manual Activation

For skills that shouldn't auto-activate:

```yaml
disable-model-invocation: true
```

Requires explicit Skill tool call. Avoids description evaluation overhead.

## Caching

Skills are cached per session. Changes require:

```
/clear
```

Or start a new session.

## Optimization Checklist

- [ ] SKILL.md under 500 lines
- [ ] Details in `references/`
- [ ] Specific description with trigger keywords
- [ ] `allowed-tools` for frequently-used tools
- [ ] `context: fork` for verbose processing
- [ ] `disable-model-invocation: true` for manual-only skills
