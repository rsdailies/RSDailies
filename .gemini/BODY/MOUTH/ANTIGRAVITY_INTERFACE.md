# Antigravity Interface

This document describes how Antigravity-compatible hosts should interact with the framework.

## Rules And Instructions
1. Load root `AGENTS.md`.
2. Follow the canonical boot chain into local `BODY/` for this repository.
3. Treat `.agents/` as generated bridge surface, not canonical content.

## MCP Runtime
1. `BODY/NERVES/MCP/servers.yaml` is the canonical catalog and policy file.
2. `antigravity/mcp_config.json` is the local active-runtime mirror.
3. Active server ids in `antigravity/mcp_config.json` must stay in parity with `settings.json`.

## Downstream Projects
- When this framework infects another workspace, `.gemini/BODY/` becomes the local canonical mount in that project.
- The project-local `AGENTS.md` created by `BODY/HANDS/SCRIPTS/link_project.ps1` should point to `.gemini/BODY/SKELETON/BOOT.md`.

## Current Host Note
- In this repository's current execution host, `.agents/` may not be shell-writable even after ACL repair.
- Treat `.agents/` as a compatibility export surface and prefer `.gemini/` as the actively regenerated bridge in this environment.
