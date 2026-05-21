<script lang="ts">
import { load } from '@shared/storage/storage-service';
import { formatDurationMs } from '@shared/time/formatters';
import { timeStore } from '@shared/time/time-store';
import { getTimers } from '../services/timer-runtime';

let { id = '' } = $props();

const timerEntry = $derived(getTimers({ load })[id]);
const remainingMs = $derived.by(() => {
	if (!timerEntry) return 0;
	return Math.max(0, timerEntry.readyAt - $timeStore);
});

const isReady = $derived(timerEntry && remainingMs <= 0);
const text = $derived(isReady ? 'Ready' : formatDurationMs(remainingMs));
</script>

{#if timerEntry}
	<span class="ds-timer-display" class:ready={isReady}>
		{text}
	</span>
{/if}

<style>
	.ds-timer-display {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		color: var(--ds-link-hover);
		font-size: 0.85em;
		background: rgba(64, 131, 202, 0.1);
		padding: 1px 6px;
		border-radius: 4px;
	}

	.ds-timer-display.ready {
		color: #52c41a;
		background: rgba(82, 196, 26, 0.1);
	}
</style>
