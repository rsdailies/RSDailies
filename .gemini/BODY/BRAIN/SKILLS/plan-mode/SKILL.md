---
name: plan-mode
description: use when the user asks for plan-only reasoning, architecture planning, folder design, or implementation sequencing without execution.
kind: local
---

# 🧠 Plan-Mode Skill

## Purpose
This skill governs the agent's behavior during the "Drafting" and "Review" phases of a project. It ensures that no code is executed until a complete logical path has been established and approved.

## Use Procedure
1. **Analyze Requirements**: Decompose the user request into anatomical impacts (which organs are affected?).
2. **Consult BODY**: Read `OPERATING_PRINCIPLES.md` and the relevant `ROLE.md` files.
3. **Draft Plan**: Create an implementation plan artifact.
4. **Define Sequence**: List exactly which files will be created or modified and in what order.
5. **Request Approval**: Present the plan to the user and halt until a "Proceed" signal is received.

## Constraints
- **NO EXECUTION**: Do not run `run_command` (except for `ls` or `dir`) or mutate files during the planning phase.
- **Traceability**: Every step in the plan must refer back to a source in `BODY` or `ORIGIN`.

## Canonical BODY Source
- `BODY/ORGANS/SKILLS/PLANNING/plan-mode/SKILL.md`
- Governed by: `BODY/BRAIN/ROLE.md`

---
*Follow the canonical BODY source. This skill exists for host discovery and internal regulation.*
