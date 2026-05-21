<script lang="ts">
import type { TimerGroup, TimerPlot } from '@entities/task/types';
import { clearTimer, getTimerMinutes, getTimerPlotTaskId } from '@features/timers';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { load, save } from '@shared/storage/storage-service';
import { onMount } from 'svelte';
import SubgroupHeader from './SubgroupHeader.svelte';
import TaskRow from './TaskRow.svelte';

let { section, groups = [] as TimerGroup[], colspan = 3 } = $props();
let now = $state(Date.now());

onMount(() => {
	const intervalId = window.setInterval(() => {
		now = Date.now();
	}, 1000);

	return () => window.clearInterval(intervalId);
});

function formatMinutes(minutes: number) {
	if (!Number.isFinite(minutes) || minutes <= 0) return '';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function getPlotNote(plot: any) {
	const settings = load('settings', {});
	const minutes = getTimerMinutes(plot, settings);
	return minutes > 0 ? `Growth: ${formatMinutes(minutes)}` : '';
}

function resetGroup(group: TimerGroup) {
	const taskIds = (group.plots || []).map((plot) => getTimerPlotTaskId(plot.id));
	tracker.clearGroupCompletions(section.id, taskIds);
	for (const plot of group.plots || []) {
		clearTimer(plot.id, { load, save });
	}
	now = Date.now();
}

function completed(id: string) {
	return !!tracker.completed[section.id]?.[id];
}
function hidden(id: string) {
	return !!tracker.hiddenRows[section.id]?.[id];
}
function pinned(id: string) {
	return !!tracker.overviewPins[`${section.id}::${id}`];
}
</script>

{#each groups as group (group.id)}
	{@const groupId = `timer-group-${group.id}`}
	<SubgroupHeader 
		id={groupId} 
		label={`<div class="section-group-heading">${group.label || group.name || group.id}</div>`} 
		colspan={colspan} 
		showControls={true} 
		onReset={() => resetGroup(group)} 
		sectionId={section.id}
		tasks={(group.plots || []).map((plot) => ({ id: getTimerPlotTaskId(plot.id), name: plot.name }))}
	/>
	
	{#if !tracker.isCollapsedBlock(groupId)}
		{#each group.plots || [] as plot (plot.id)}
			{@const taskId = getTimerPlotTaskId(plot.id)}
			{@const note = getPlotNote(plot)}
			<TaskRow
				id={taskId}
				name={plot.name}
				wiki={plot.wiki}
				detailLines={[
					...(note ? [{ kind: 'duration', text: note } as const] : []),
					...(plot.locationNote || plot.note ? [{ kind: 'location', text: plot.locationNote || plot.note } as const] : []),
				]}
				completed={completed(taskId)}
				hidden={hidden(taskId)}
				pinned={pinned(taskId)}
				sectionKey={section.id}
				extraClass="farming-location-row"
				cooldownMinutes={(plot.cycleMinutes || 0) * (plot.stages || 0)}
				timerId={plot.id}
			/>
		{/each}
	{/if}
{/each}
