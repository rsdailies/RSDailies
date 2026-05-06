# 👂 Signal Map

This document maps host-tool events to anatomical interpretations.

| Host Signal | Anatomical Meaning | Escalation Path |
| :--- | :--- | :--- |
| **exit_code: 1** | HANDS execution failure. | BRAIN (Re-Plan) |
| **stderr: Path Not Found** | SKELETON structural drift. | BRAIN (Re-Audit) |
| **timeout** | LEGS environment constraint. | BRAIN (Back-off) |
| **429 Rate Limit** | NERVES provider constraint. | BRAIN (Model Rotate) |
| **User: "Stop"** | HEART principle violation (User agency). | STOP |

---
*Refer to BODY/EARS/ROLE.md for signal monitoring rules.*
