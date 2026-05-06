---
name: research-sync
description: verifies local records against official sources and ORIGIN compendium to prevent knowledge drift.
kind: local
---

# 👁️ Research-Sync Skill

## Purpose
This skill ensures that the agent's internal context remains synchronized with the latest research and the historical `ORIGIN` archive. It prevents the agent from making assumptions that contradict established project facts.

## Use Procedure
1. **Trigger**: Activate when entering a new project phase or when a conflict is detected in `BODY`.
2. **Consult ORIGIN**: Search `BODY/SKELETON/BONES/DOCS/ORIGIN/` for relevant historical context.
3. **Verify SOURCES**: Check `BODY/EYES/SOURCES/source_registry.yaml` for verified evidence.
4. **Audit Context**: Compare current `BODY` documentation against the discovered facts.
5. **Update Ledger**: Log any new findings in `BODY/EYES/LEFT/RESEARCH/query_log.md`.

## Constraints
- **Evidence-Only**: Do not incorporate "common knowledge" from the model's training data if it conflicts with the project's `SOURCES`.
- **Citation Required**: Every synchronization must result in at least one updated citation in `BODY/EYES/CITATIONS`.

## Canonical BODY Source
- `BODY/ORGANS/SKILLS/RESEARCH/research-sync/SKILL.md`
- Governed by: `BODY/EYES/ROLE.md`

---
*Follow the canonical BODY source. This skill exists for host discovery and internal regulation.*
