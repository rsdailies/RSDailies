# 🌉 Bridge Policy

This document defines the rules for mirroring `BODY` content to bridge surfaces (`.agents/`, `GEMINI.md`, etc.).

## 1. Direction of Truth
- **BODY -> Bridge**: All updates must flow from the canonical `BODY` outward.
- No rule or skill may be authored directly in a bridge directory.

## 2. Minimalist Principle
- Bridges must be "Thin Wrappers".
- Use `@import` or pointers whenever possible to avoid instruction duplication and token bloat.

## 3. Automation First
- Bridge files in `.agents/` are considered **Generated Artifacts**.
- Manual edits to bridge files are disposable and will be overwritten by mirroring scripts.

## 4. Host Compliance
- Bridges must follow the specific syntax and directory requirements of the target host (e.g., Gemini CLI's SKILL.md frontmatter requirements).

---
*Violating the Bridge Policy leads to "Self-Referential Drift" and system failure.*
