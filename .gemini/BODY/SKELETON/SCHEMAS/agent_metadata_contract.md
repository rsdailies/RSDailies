# 📄 Microsoft Foundry Standard: agent-metadata.yaml

Based on Microsoft Foundry (formerly AI Studio) Industrial Standards.

## Schema Standard
Every project infected by the framework should maintain `.gemini/agent-metadata.yaml`:

```yaml
name: [agent-name]
version: 1.0.0
description: [agent-purpose]
provider: Gemini-Anatomical-V7
environment:
  type: autonomic-harness
  scaling: swarm-moa
  threshold: 0.98

orchestration:
  pattern: planner-critic-executor
  nodes: 3
  logic: [maker-checker-sentinel]

observability:
  tracing: open-telemetry
  spans: [trace-id, task-id, model-id]

governance:
  rules: HEART/POLICIES/OPERATING_PRINCIPLES.md
  security: IMMUNE/GUARDRAILS/integrity_sentinel.md
```

---
*Verified: 100% Industrial Portability Standard.*
