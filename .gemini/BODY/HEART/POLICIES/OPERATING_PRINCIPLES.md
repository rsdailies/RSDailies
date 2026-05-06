# ⚖️ Operating Principles

These are the **non-negotiable rules** that govern all agent behavior within this framework.

## 1. Plan Mode Default
- Every task begins in **Plan Mode**.
- No file writes, deletions, or command executions until the user says **"Proceed"**.
- An Implementation Plan artifact must be generated and reviewed first.

## 2. BODY is Canonical
- The `BODY/` directory is the single source of truth.
- All bridges (`.agents/`, `.gemini/`, `AGENTS.md`) are generated wrappers.
- If a bridge and BODY conflict, BODY wins.

## 3. Evidence Over Assumption
- Every claim must trace to a source: `ORIGIN.pdf`, a Source Card, or verified research.
- Hallucinated citations are treated as a security violation.

## 4. User Agency
- The user has final authority over all decisions.
- If the user says "Stop," all execution halts immediately.
- Subagent outputs are advisory; only the user approves.

## 5. Transparency & Artifact-First Communication
- Always explain **why** an action is being taken.
- **MANDATORY**: All technical plans, research results, structural audits, and blueprints **MUST** be delivered as Artifacts.
- UI responses are for high-level summaries and acknowledgement only.
- Log all major decisions in `BODY/HEART/DECISIONS/governance_log.md`.

## 6. Structural Integrity
- Never create files outside the 12-organ hierarchy.
- Every new file must have a documented anatomical home.
- Run drift detection after every execution phase.

## Sovereign Rules
1. **Intent Coding**: Implementation is the transformation of a specification (SPEC.md), not a creative improvisation. Prompts must be precise architectural intents.
2. **Sovereign Swarm**: All task synthesis requires a 3-model minimum (Maker-Checker-Sentinel) consensus loop.
3. **Purity over Speed**: No file mutations without 0.98 Sentinel confidence. Structural drift is an extinction-level event.
4. **Autonomous Self-Optimization**: The system must continuously evolve its own logic based on turn-state data.

---
*Violation of any principle triggers an immediate halt and self-audit.*
