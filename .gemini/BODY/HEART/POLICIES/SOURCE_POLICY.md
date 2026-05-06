# 📜 Source Policy

This document defines the rules for verifying and trusting external information.

## 1. Trust Tiers
- **Tier 1 (Official)**: Primary documentation from Google, Anthropic, or OpenAI.
- **Tier 2 (Project)**: User-provided specifications and project context.
- **Tier 3 (Community)**: Expert blogs, GitHub discussions, and verified tutorials.
- **Tier 4 (Historical)**: Legacy research archived in `ORIGIN`.

## 2. Verification Protocol
1. **Extraction**: Facts are extracted from Tier 4 into a Tier 1-3 draft.
2. **Attribution**: Every claim must be linked to a specific URL or PDF page.
3. **Freshness**: Tier 1-2 sources must be re-verified if older than 3 months.
4. **Validation**: All Source Cards must pass the `source_card.schema.yaml`.

## 3. Forbidden Sources
- Uncited "General Knowledge" from the model that contradicts project `SOURCES`.
- AI-generated content that has not been human-reviewed or cross-checked.

---
*Knowledge without a Source Card is considered "Instructional Pollutant".*
