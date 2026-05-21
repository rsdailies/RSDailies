<script lang="ts">
let { label, value, type = 'muted', title = '' } = $props();
</script>

<div class="ds-status-chip ds-status-chip-{type}" {title}>
	<span class="ds-status-label">{label}:</span>
	<span class="ds-status-value">{value}</span>
</div>

<style>
	.ds-status-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.ds-status-label {
		opacity: 0.7;
		font-weight: 400;
	}

	.ds-status-chip-info { border-color: rgba(64, 131, 202, 0.3); color: #8bb9eb; }
	.ds-status-chip-success { border-color: rgba(40, 167, 69, 0.3); color: #89d99b; }
	.ds-status-chip-warning { border-color: rgba(255, 193, 7, 0.3); color: #ffe082; }
</style>
