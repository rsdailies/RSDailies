# Sovereign Swarm Consensus

This workflow defines the minimum multi-model review loop for high-risk framework changes.

## Sovereign Nodes
1. **Maker (`gpt-5.2`)**
   Primary implementation and synthesis.
2. **Checker (`claude-sonnet-4-20250514`)**
   Adversarial review, edge cases, and logic stress-testing.
3. **Sentinel (`gemini-2.5-flash`)**
   Topology, naming, and structural drift checks.

## Consensus Loop
1. Draft the change.
2. Review it with at least one non-maker perspective.
3. Block release when topology, safety, or evidence checks fail.
4. Accept only when the implementation, review, and verification stories agree.
