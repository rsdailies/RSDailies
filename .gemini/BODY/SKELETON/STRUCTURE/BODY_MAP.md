# BODY Map

## Canonical Rule
- In this repository, local `BODY/` is the canonical source of truth.
- `.agents/` and `.gemini/` are bridge surfaces generated from canonical content.
- In downstream infected projects, `.gemini/BODY/` becomes the local canonical mount for generated shims.

## Root Layout
```text
.gemini/
|-- AGENTS.md
|-- GEMINI.md
|-- .agents/
|   |-- instructions.md
|   |-- agents/
|   `-- skills/
|-- .gemini/
|   |-- GEMINI.md
|   |-- agents/
|   `-- skills/
|-- BODY/
|   |-- BRAIN/
|   |-- EARS/
|   |-- EYES/
|   |-- HANDS/
|   |-- HEART/
|   |-- IMMUNE/
|   |-- LEGS/
|   |-- MOUTH/
|   |-- NERVES/
|   |-- NOSE/
|   |-- ORGANS/
|   `-- SKELETON/
|-- antigravity/
`-- settings.json
```

## Public Contracts
- Boot contract: `AGENTS.md`, `GEMINI.md`, and `.agents/instructions.md`
- Canonical memory: `BODY/ORGANS/MEMORY/`
- Canonical public skills: `BODY/ORGANS/SKILLS/`
- Bridge generation: `BODY/HANDS/SCRIPTS/mirror_body.ps1`
- Drift verification: `BODY/IMMUNE/GUARDRAILS/drift_monitor.ps1`

## Notes
- `BODY/BRAIN/MEMORY/` may contain compatibility shadows but is not the public memory contract.
- Generated manifests and wrappers must be recreated from scripts, not hand-maintained.
