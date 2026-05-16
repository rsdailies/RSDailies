<script lang="ts">
	import { tracker } from '@features/tracker';
	import { getActiveProfile } from '@shared/storage/storage-service';

	let { game = 'rs3' } = $props();

	const activeProfile = $derived(getActiveProfile());
	const pinnedCount = $derived(Object.keys(tracker.pins).length);
	
	const completedCount = $derived.by(() => {
		let total = 0;
		for (const sectionKey in tracker.completed) {
			total += Object.keys(tracker.completed[sectionKey] || {}).length;
		}
		return total;
	});

	const hiddenCount = $derived.by(() => {
		let total = 0;
		for (const sectionKey in tracker.hidden) {
			total += Object.keys(tracker.hidden[sectionKey] || {}).length;
		}
		return total;
	});
</script>

<div class="tracker-summary-bar ds-status-group">
	<div class="ds-status-chip ds-status-chip-muted" title="Active Profile">
		<span class="ds-status-label">Profile:</span>
		<span class="ds-status-value">{activeProfile}</span>
	</div>
	<div class="ds-status-chip ds-status-chip-info" title="Pinned tasks">
		<span class="ds-status-label">Pinned:</span>
		<span class="ds-status-value">{pinnedCount}</span>
	</div>
	<div class="ds-status-chip ds-status-chip-success" title="Total completed tasks">
		<span class="ds-status-label">Completed:</span>
		<span class="ds-status-value">{completedCount}</span>
	</div>
	{#if hiddenCount > 0}
		<div class="ds-status-chip ds-status-chip-warning" title="Hidden rows">
			<span class="ds-status-label">Hidden:</span>
			<span class="ds-status-value">{hiddenCount}</span>
		</div>
	{/if}
</div>

<style>
	.tracker-summary-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
	}

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
