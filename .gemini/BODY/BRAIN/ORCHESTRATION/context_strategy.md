# 🧠 Context Strategy

This document defines how the agent manages its context window to prevent "Token Bloat" and performance degradation.

## 1. Modular Context
- Never load the entire `BODY/` into a single prompt.
- Use the `BOOT.md` shim to load only high-level missions.
- Use `@` imports to pull in specific policies only when relevant.

## 2. Evidence Paging
- For large research files, use `grep` and `line ranges` instead of reading the whole file.
- Summarize research findings into Source Cards to keep active context lean.

## 3. History Pruning
- Use artifacts to store plans and progress.
- Refer back to artifacts by URI instead of re-pasting content.

---
*Follow these rules to maintain high-speed reasoning.*
