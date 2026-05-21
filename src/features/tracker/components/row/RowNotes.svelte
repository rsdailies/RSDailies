<script lang="ts">
import { usePenguinStore } from '@features/penguins/stores/penguin.svelte';
import { TimerDisplay, clearTimer, startTimer } from '@features/timers';
import { load, save } from '@shared/storage/storage-service';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
import { formatDurationMs } from '@shared/time/formatters';
import { timeStore } from '@shared/time/time-store';

let {
	id,
	note,
	detailLines = [],
	timerId,
	cooldownMinutes,
	completed,
	sectionKey = '',
	onToggle,
	colspan = 1,
} = $props();

const penguins = usePenguinStore();
const displayNote = $derived(penguins.getLiveNote(id, note));
const activeTimerId = $derived(timerId || (cooldownMinutes ? id : ''));

const nextBoundary = $derived.by(() => {
	if (!sectionKey || !completed || activeTimerId) return null;
	const now = new Date($timeStore);
	if (sectionKey.includes('daily')) {
		return nextDailyBoundary(now);
	} else if (sectionKey.includes('weekly')) {
		return nextWeeklyBoundary(now);
	} else if (sectionKey.includes('monthly')) {
		return nextMonthlyBoundary(now);
	}
	return null;
});

const formattedCountdown = $derived.by(() => {
	if (!nextBoundary) return '';
	const diff = nextBoundary.getTime() - $timeStore;
	return formatDurationMs(diff);
});

function handleClick(e: MouseEvent) {
	if (activeTimerId) {
		e.stopPropagation();
		const timers = load('timers', {});
		if (timers[activeTimerId]) {
			clearTimer(activeTimerId, { load, save });
		} else {
			startTimer({ id: activeTimerId, cooldownMinutes }, { load, save });
		}
		return;
	}

	if (typeof onToggle === 'function') {
		(onToggle as () => void)();
	}
}
</script>

<td class="activity_notes" {colspan} onclick={handleClick}>
	<div class="notes-container">
		{#if displayNote}
			<span class="note-text">{displayNote}</span>
		{/if}

		{#each detailLines as line}
			<span class="detail-line {line.kind}">{line.text}</span>
		{/each}

		{#if activeTimerId}
			<TimerDisplay id={activeTimerId} />
		{/if}

		{#if completed && !activeTimerId}
			{#if formattedCountdown}
				<span class="activity_duration_note countdown">Resets in: {formattedCountdown}</span>
			{/if}
		{/if}
	</div>
</td>
