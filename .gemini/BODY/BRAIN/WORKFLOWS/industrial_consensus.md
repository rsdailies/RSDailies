# 🛠️ Workflow: Industrial Consensus (Maker-Checker)

This workflow implements the multi-agent discussion pattern.

## 1. Trigger
Complex architectural changes or security-sensitive file mutations.

## 2. Subagent Roles
- **Maker (BRAIN)**: Drafts the initial Implementation Plan.
- **Checker (RESEARCHER)**: Verifies the plan against `ORIGIN.pdf` and Source Cards.
- **Sentinel (IMMUNE)**: Audits the plan for security risks and drift.

## 3. The Discussion Board
- Subagents write their comments in a `# 💬 Subagent Dialogue` section of the active plan artifact.
- Sentinel provides a `VETO` or `CLEAR` signal.

## 4. Final Gate
- User reviews the consolidated dialogue and provides the `Proceed` signal.

---
*Refer to BODY/HEART/POLICIES/STRICT_GATE.md*
