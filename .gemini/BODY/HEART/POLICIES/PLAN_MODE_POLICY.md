# 📜 Plan-Mode Policy

This document defines the formal lifecycle of a task under the anatomical framework.

## 1. Plan Initiation
- Every request starts in **Plan Mode**.
- No file mutations (outside artifacts) are permitted.

## 2. Planning Criteria
A valid plan must include:
- **Impact Assessment**: Which anatomical parts are affected.
- **Dependency Map**: The order of operations.
- **Approval Gate**: A explicit request for user confirmation.

## 3. Transition to Execution
- The agent may only move to **Execution Mode** after the user provides a "Proceed" or "OK" signal.
- If the plan changes significantly during execution, the agent must return to Plan Mode.

## 4. Post-Execution Review
- Every execution must result in a status update in `BODY/BRAIN/ORCHESTRATION/CURRENT_STATE.md`.
- Significant errors must be logged in `BODY/EARS/RIGHT/HOST_SIGNALS`.

---
*Trust is built through predictable sequencing.*
