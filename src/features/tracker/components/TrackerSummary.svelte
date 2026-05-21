<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { getActiveProfile } from '@shared/storage/storage-service';
import StatusChip from '@shared/ui/StatusChip.svelte';

let { game = 'rs3' } = $props();

const activeProfile = $derived(getActiveProfile());
const pinnedCount = $derived(Object.keys(tracker.overviewPins).length);

const completedCount = $derived.by(() => {
	let total = 0;
	for (const sectionKey in tracker.completed) {
		total += Object.keys(tracker.completed[sectionKey] || {}).length;
	}
	return total;
});

const hiddenCount = $derived.by(() => {
	let total = 0;
	for (const sectionKey in tracker.hiddenRows) {
		total += Object.keys(tracker.hiddenRows[sectionKey] || {}).length;
	}
	return total;
});
</script>

<div class="tracker-summary-bar">
	<StatusChip label="Profile" value={activeProfile} title="Active Profile" />
	<StatusChip label="Pinned" value={pinnedCount} type="info" title="Pinned tasks" />
	<StatusChip label="Completed" value={completedCount} type="success" title="Total completed" />
	{#if hiddenCount > 0}
		<StatusChip label="Hidden" value={hiddenCount} type="warning" title="Hidden rows" />
	{/if}
</div>

<style>
	.tracker-summary-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
	}
</style>
