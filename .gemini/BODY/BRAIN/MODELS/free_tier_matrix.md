# Provider Baseline Matrix

Verified against current provider docs on 2026-05-06.

| Provider | Current Baseline | Best Use |
| :--- | :--- | :--- |
| OpenAI | `gpt-5.2` | complex reasoning, coding, agentic workflows |
| OpenAI | `gpt-5-mini` | balanced latency, cost, and tool use |
| OpenAI | `gpt-5-nano` | high-throughput classification and lightweight transforms |
| Anthropic | `claude-sonnet-4-20250514` | review, adversarial checking, long-context reasoning |
| Google | `gemini-2.5-pro` | deep reasoning and large-context synthesis |
| Google | `gemini-2.5-flash` | fast execution, iteration, and general assistant work |
| Google | `gemini-2.5-flash-lite` | low-latency, cost-sensitive bulk workloads |

## Selection Guidance
- Prefer the Responses-API-first mental model for OpenAI integrations.
- Use `gpt-5.2` or an equivalent frontier model when accuracy matters more than latency.
- Use smaller variants only after the task is already meeting its accuracy target.

## Framework Defaults
- Maker / deep execution: `gpt-5.2`
- Checker / adversarial review: `claude-sonnet-4-20250514`
- Sentinel / fast topology checks: `gemini-2.5-flash`

## Notes
- This file replaces stale references to `GPT-4o mini`, `Claude 3.5 Sonnet`, and `Gemini 1.5 *`.
- Host-specific defaults may remain narrower than this matrix if a local client only exposes a subset of models.
