# ✅ Gemini CLI Verification Checklist

Run these steps to ensure the Gemini CLI is correctly integrated with the anatomical framework.

- [ ] **Context Load**: Run `gemini context` and verify `BODY/SKELETON/BOOT.md` is listed.
- [ ] **Skill Discovery**: Run `/skills list` and verify `plan-mode` and `research-sync` appear.
- [ ] **Subagent Discovery**: Run `/agents list` and verify `planner` is available.
- [ ] **Plan-Mode Enforcement**: Start a task and verify the agent proposes a plan before editing.
- [ ] **Ignore Rules**: Verify that `gemini search` does not return results from `BODY/SKELETON/BONES/DOCS/ORIGIN/` (unless explicitly asked).

---
*Log results in BODY/EVALUATION/results/gemini_<date>.md*
