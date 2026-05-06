# User Profile

This file is the canonical persistent profile for the framework.

## Preferences
- **Default Mode**: Plan-mode first, then guarded execution after approval.
- **Execution Style**: Guardrailed autonomy for low-risk actions, explicit approval for high-risk actions.
- **Bridge Priority**: Gemini CLI and Antigravity-compatible bridge surfaces.
- **Skill Discovery**: Hybrid discovery through wrappers plus canonical registry.

## Context Preferences
- **Memory**: Rolling buffer for recent turns, summarized history for older context.
- **Context Budget**: Dynamic weighting with topology-first loading.

## Canonical Rule
- `BODY/ORGANS/MEMORY/` is the public memory contract.
- Any copies under `BODY/BRAIN/MEMORY/` are compatibility shadows, not the source of truth.

---
*Updated when user preferences or framework defaults materially change.*
