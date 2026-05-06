# Gemini CLI Interface

This document describes how Gemini-compatible hosts interact with the anatomical framework.

## Loading Context
- In this repository, the root `GEMINI.md` imports local `BODY/` content.
- `.gemini/GEMINI.md` delegates to `.agents/instructions.md`.
- `.agents/instructions.md` must resolve imports relative to its own directory, not via hardcoded `.gemini/BODY` assumptions.

## Skill Discovery
- Public skills live under `BODY/ORGANS/SKILLS/`.
- Bridge wrappers are generated into `.gemini/skills/` and `.agents/skills/`.
- Wrapper imports must be computed from the wrapper file's actual directory.

## Bridge Modes
- **Global framework mode**: wrappers resolve against local `BODY/`.
- **Infected project mode**: wrappers resolve against `.gemini/BODY/`.

## Host Constraint
- In this current runtime, `.gemini/` is the reliable generated bridge surface.
- `.agents/` remains a compatibility bridge surface, but shell-based regeneration may be blocked by the host environment even when repository ACLs are clean.

## MCP Servers
- Active local MCP servers are configured in `settings.json`.
- The canonical registry and policy surface lives in `BODY/NERVES/MCP/servers.yaml`.
- Loadout behavior is documented in `BODY/NERVES/MCP/loadout_strategy.md`.
