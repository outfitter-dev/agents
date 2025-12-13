---
description: Check for relevant skills before starting a task
argument-hint: [task description or keyword]
---

# Skill Check

Search for skills that might help with a task before starting.

## How It Works

1. Parse the task description or keyword
2. Search available skills across all sources (user, project, plugin)
3. Match skills by trigger keywords, description, and capability
4. Present top matches with reasoning
5. Offer to load the most relevant skill

## When to Use

- Before starting unfamiliar tasks
- When unsure if a skill exists for your goal
- When exploring available capabilities
- Explicit skill discovery (vs automatic skill loading)

## Task to Check

$ARGUMENTS

---

Search for skills matching this task. Present the top 2-3 matches with:
- Skill name and source
- What it does (1 sentence)
- Why it matches this task
- Recommendation on whether to use it

If no matches found, suggest proceeding without a skill or creating one.
