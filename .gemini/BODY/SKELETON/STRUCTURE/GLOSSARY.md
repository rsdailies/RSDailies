# 📖 Project Glossary

This document defines the anatomical terminology used within the framework.

| Term | Anatomical Part | Definition |
| :--- | :--- | :--- |
| **Architect** | BRAIN | The subagent responsible for high-level planning and decomposition. |
| **Bridge** | MOUTH | A thin wrapper or export surface (e.g., `.agents/`) that points to `BODY`. |
| **Canonical** | BODY | The primary, non-duplicated source of truth for an instruction or skill. |
| **Detection** | NOSE | The process of identifying risk (injection, hallucinations) in context. |
| **Drafting** | HANDS | The process of staging file changes in `LEFT/DRAFTING` before implementation. |
| **Evidence** | EYES | Verified data extracted from a source and stored in a Source Card. |
| **Mirroring** | MOUTH | The automated or manual process of generating bridges from `BODY`. |
| **Quarantine** | SKELETON | The isolation of unverified or historical research in `BONES/DOCS/ORIGIN`. |
| **Skill** | ORGANS | An atomic, reusable capability defined in a `SKILL.md` file. |
| **Source Card** | EYES | A YAML file that metadata-tags an external source for traceability. |

---
*Refer to individual ROLE.md files for functional missions.*
