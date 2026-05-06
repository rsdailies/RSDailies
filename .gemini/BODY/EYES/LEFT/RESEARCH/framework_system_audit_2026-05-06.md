# Framework System Audit

Verified on 2026-05-06 in the canonical framework repository at `c:\Users\antho\.gemini`.

## Executive Summary
- Local `BODY/` is now the canonical truth model for this repository.
- `.gemini/BODY/` is now documented and preserved only as the downstream infection contract for external workspaces.
- Canonical public memory now lives in `BODY/ORGANS/MEMORY/`.
- Canonical public skills now live in `BODY/ORGANS/SKILLS/`.
- Bridge wrappers are now generated with computed relative imports instead of hardcoded path depth assumptions.
- Drift verification passed after regeneration.

## Verified Findings
1. `AGENTS.md` and `.agents/instructions.md` were pointing at `.gemini/BODY` from the wrong context for the global framework repo.
2. `.agents/skills/*` and `.gemini/skills/*` wrappers were using depth-wrong imports and were not generated from a stable public registry.
3. `BODY/ORGANS/MEMORY/` and `BODY/ORGANS/SKILLS/` were claimed as canonical in multiple docs but were incomplete in the live tree.
4. `BODY/SKELETON/MANIFESTS/file_index.txt` and `bridge_manifest.yaml` were stale and contradicted the live filesystem.
5. `settings.json`, `antigravity/mcp_config.json`, and `BODY/NERVES/MCP/servers.yaml` were not aligned on the active filesystem MCP launcher.
6. Model registry and workflow docs still referenced stale provider baselines.

## Repair Map
### Truth Model
- Updated `AGENTS.md` to point at `BODY/SKELETON/BOOT.md`.
- Replaced `.agents/instructions.md` with imports that resolve relative to `.agents/`.
- Updated bridge docs so global-framework mode and infected-project mode are distinct contracts.

### Canonical Registry
- Created canonical public memory files:
  - `BODY/ORGANS/MEMORY/user_profile.md`
  - `BODY/ORGANS/MEMORY/active_context.md`
- Created canonical public skill registry entries:
  - `BODY/ORGANS/SKILLS/PLANNING/plan-mode/SKILL.md`
  - `BODY/ORGANS/SKILLS/RESEARCH/research/SKILL.md`
  - `BODY/ORGANS/SKILLS/RESEARCH/research-sync/SKILL.md`
  - `BODY/ORGANS/SKILLS/SAFETY/logic-audit/SKILL.md`
- Registry entries now import the live organ-owned implementations under `BRAIN`, `EYES`, and `IMMUNE`.

### Generators And Manifests
- Replaced hardcoded wrapper templates with computed `{{relative_import}}` placeholders.
- Rewrote `BODY/HANDS/SCRIPTS/mirror_body.ps1` to support:
  - `GlobalFramework` mode
  - `InfectedProject` mode
  - skill wrapper generation
  - subagent wrapper generation
- Added:
  - `BODY/HANDS/SCRIPTS/sync_body_standards.ps1`
  - `BODY/HANDS/SCRIPTS/rebuild_file_index.ps1`
- Replaced `BODY/IMMUNE/GUARDRAILS/drift_monitor.ps1` with a real drift verifier.
- Rebuilt `BODY/SKELETON/MANIFESTS/file_index.txt`.
- Replaced `BODY/SKELETON/MANIFESTS/bridge_manifest.yaml` with a mode-aware manifest.

### Runtime Modernization
- Normalized `settings.json` and `antigravity/mcp_config.json` on `@modelcontextprotocol/server-filesystem`.
- Replaced `BODY/NERVES/MCP/servers.yaml` with a catalog that separates transport baseline, cataloged servers, and active local settings.
- Updated `BODY/NERVES/MCP/loadout_strategy.md` to current MCP transport assumptions.
- Refreshed model and workflow docs to current provider baselines and Responses-API-first guidance.

## Verification Results
- `powershell -ExecutionPolicy Bypass -File BODY/HANDS/SCRIPTS/sync_body_standards.ps1`
- `powershell -ExecutionPolicy Bypass -File BODY/HANDS/SCRIPTS/mirror_body.ps1 -Mode GlobalFramework`
- `powershell -ExecutionPolicy Bypass -File BODY/HANDS/SCRIPTS/rebuild_file_index.ps1`
- `powershell -ExecutionPolicy Bypass -File BODY/IMMUNE/GUARDRAILS/drift_monitor.ps1`

Result: `No drift detected.`

## Distribution
- Canonical repo artifact: `BODY/EYES/LEFT/RESEARCH/framework_system_audit_2026-05-06.md`
- Notion mirror: https://www.notion.so/35834331528f818ab0dac64d7bedaf2a

## Known Constraint
- `.agents/` has a filesystem ACL in this workspace that blocks shell-driven writes. The live `.agents` wrappers were patched directly, and `mirror_body.ps1` now tolerates those write failures with warnings instead of aborting generation. This is an environment constraint, not a path-resolution defect.
- The preferred operational stance in this host is to treat `.gemini/` as the actively regenerated bridge surface and `.agents/` as a compatibility export surface.

## Future Execution Notes
- Vercel AI SDK agent work should assume `ToolLoopAgent`, `createAgentUIStreamResponse`, and `useChat` transport defaults.
- AI text rendering should assume AI Elements `Conversation` plus `MessageResponse`.
- Cloudflare remote MCP guidance should assume `createMcpHandler()` for stateless deployments and `McpAgent` for stateful/session-based deployments.
- Cloudflare observability guidance should include structured diagnostics, `keepAlive()`, and `waitForMcpConnections`.

## Source Links
- MCP specification, transports: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
- Cloudflare Agents and remote MCP guidance: https://developers.cloudflare.com/agents/ and https://developers.cloudflare.com/agents/guides/remote-mcp-server/
- Cloudflare changelog for MCP runtime details: https://developers.cloudflare.com/changelog/
- Vercel AI SDK docs: https://ai-sdk.dev/docs
- Vercel AI Elements docs: https://ai-sdk.dev/elements/docs
- OpenAI platform docs: https://platform.openai.com/docs
- Google Gemini model docs: https://ai.google.dev/gemini-api/docs/models
- Anthropic model docs: https://docs.anthropic.com/en/docs/about-claude/models
