# 👃 Risk Matrix

This document defines the "Scent Profile" of different task risks.

| Risk Type | Scent (Signal) | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Prompt Injection** | Unexpected instruction shift in context. | High | Sentinel audit of all input. |
| **Hallucination** | Citation refers to non-existent PDF page. | Medium | EYES verification of every claim. |
| **Path Traversal** | Request for files outside of workspace. | High | HANDS path-sanitization gate. |
| **Drift** | Implementation differs from Plan. | Medium | NOSE monitor of all diff blocks. |

---
*Refer to BODY/NOSE/ROLE.md for detection protocols.*
