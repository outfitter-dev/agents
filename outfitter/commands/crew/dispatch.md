---
description: Orchestrate multiple agents for complex multi-domain tasks
argument-hint: [task description requiring coordination]
---

# Agent Dispatch

Coordinate multiple agents to accomplish a complex task requiring different expertise areas.

## Instructions

- Consider the recent conversation history, your context, and the task to be accomplished.
- Specific user instructions should be followed unless they are contradictory to the task at hand. $ARGUMENTS

## Steps

1. **Load Skills** — Use the Skill tool to load:
   - **outfitter:subagents** — agent routing and orchestration patterns
   - **outfitter:context-management** — for long-running tasks, teaches Task state persistence
2. **Consider** — Ultrathink and analyze the task, consider the complexity, sequence of steps, and agent requirements.
3. **Planning** — Use the **Plan subagent** to research the codebase and design an orchestration strategy
4. **Report** — Present the orchestration plan (which agents, what sequence, expected handoffs)
   - **IMPORTANT**: After presenting the orchestration plan, proceed directly to execution.
   - Do not wait for approval unless the task is high-risk (destructive changes, production deployment, security-sensitive).
5. **Execute** — Dispatch agents according to the plan, passing context between them
6. **Persist** — Update Tasks throughout with agent IDs, decisions, and progress (survives compaction)

## Planning Process

Ensure you've loaded the **outfitter:subagents** skill. Then coordinate with the **Plan subagent** to design the orchestration plan. Task the **Plan subagent** to:

1. Explore the relevant parts of the codebase
2. Identify which roles are needed (coding, reviewing, research, testing, etc.)
3. Determine the best available agents for each role
4. Design the execution sequence (sequential, parallel, or hybrid)
5. Return a concise orchestration plan

After receiving the plan, think about if you agree with it, make adjustments where necessary, and proceed with the next steps mentioned above.
