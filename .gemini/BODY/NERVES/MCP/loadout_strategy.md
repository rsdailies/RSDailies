# MCP Loadout Strategy

This document defines how the framework selects MCP servers from `BODY/NERVES/MCP/servers.yaml`.

## Transport Baseline
- Local servers default to `stdio`.
- Remote servers default to `Streamable HTTP`.
- New remote deployments should not standardize on legacy HTTP+SSE.

## Loadout Tiers
- **Minimal**: `filesystem`
- **Research**: `filesystem`, plus documented research servers such as `brave_search` or `notion`
- **Implementation**: `filesystem`, plus implementation-facing servers such as `github` or approved remote MCP endpoints

## Activation Rules
- `servers.yaml` is the catalog and policy document.
- `settings.json` and `antigravity/mcp_config.json` are the active local runtime surfaces.
- Active runtime configuration must stay in parity with the `active_local_settings` section in `servers.yaml`.

## Remote HTTP Security
- Validate `Origin` headers.
- Bind local HTTP transports to localhost when possible.
- Require authentication for non-local endpoints.
- Treat remote MCP access as a higher-risk loadout than local `stdio`.
