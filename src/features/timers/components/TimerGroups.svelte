<script lang="ts">
	import { SubgroupHeader, TaskRow, tracker } from '@features/tracker';
	import { getTimerMinutes } from '../services/timer-math';
	import { load } from '@shared/storage/storage-service';
	import type { TimerGroup, TimerDefinition, TimerPlot } from '@entities/task/types';

	let { section, groups = [] as TimerGroup[], colspan = 3 } = $props();

	function slug(value: string) {
		return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function formatMinutes(minutes: number) {
		if (!Number.isFinite(minutes) || minutes <= 0) return '';
		if (minutes < 60) return `${minutes} min`;
		const hours = Math.floor(minutes / 60);
		const rest = minutes % 60;
		return rest ? `${hours}h ${rest}m` : `${hours}h`;
	}

	function durationNote(timer: TimerDefinition) {
		if (typeof timer?.durationNote === 'string' && timer.durationNote.trim()) return timer.durationNote.trim();
		const settings = load('settings', {});
		const minutes = getTimerMinutes(timer, settings);
		return minutes > 0 ? `Growth: ${formatMinutes(minutes)}` : '';
	}

	function plotRows(group: TimerGroup, timer: TimerDefinition) {
		const plots = Array.isArray(timer?.plots) && timer.plots.length > 0 ? timer.plots : group.plots || [];
		const note = durationNote(timer);
		return plots.map((plot: TimerPlot) => ({
			id: `timers::${timer.id}::${plot.id}`,
			name: plot.name,
			wiki: plot.wiki || timer.wiki || '',
			sectionKey: section.id,
			detailLines: [
				...(note ? [{ kind: 'duration', text: note } as const] : []),
				...(plot.locationNote || plot.note ? [{ kind: 'location', text: plot.locationNote || plot.note } as const] : []),
			],
		}));
	}

	function groupTaskIds(group: TimerGroup) {
		return (group.timers || []).flatMap((timer: TimerDefinition) => plotRows(group, timer).map((row) => row.id));
	}

	function timerTaskIds(group: TimerGroup, timer: TimerDefinition) {
		return plotRows(group, timer).map((row) => row.id);
	}

	function completed(task: { id: string; sectionKey?: string }) { return !!tracker.completed[task.sectionKey || section.id]?.[task.id]; }
	function hidden(task: { id: string; sectionKey?: string }) { return !!tracker.hidden[task.sectionKey || section.id]?.[task.id]; }
	function pinned(task: { id: string; sectionKey?: string }) { return !!tracker.pins[`${task.sectionKey || section.id}::${task.id}`]; }
</script>

{#each groups as group (group.id)}
	{@const groupId = `timer-group-${group.id}`}
	<SubgroupHeader id={groupId} label={`<div class="section-group-heading">${group.label || group.name || group.id}</div>`} {colspan} showControls={true} onReset={() => tracker.clearGroupCompletions(section.id, groupTaskIds(group))} />
	{#if !tracker.isCollapsedBlock(groupId)}
		{#each group.timers || [] as timer (timer.id)}
			{@const rows = plotRows(group, timer)}
			{#if (group.timers || []).length > 1}
				<TaskRow id={`timers::parent::${timer.id}`} name={timer.name} wiki={timer.wiki || ''} detailLines={durationNote(timer) ? [{ kind: 'duration', text: durationNote(timer) }] : []} completed={completed({ id: `timers::parent::${timer.id}`, sectionKey: section.id })} hidden={hidden({ id: `timers::parent::${timer.id}`, sectionKey: section.id })} pinned={pinned({ id: `timers::parent::${timer.id}`, sectionKey: section.id })} sectionKey={section.id} extraClass="farming-parent-row" />
			{/if}
			{#each rows as row (row.id)}
				<TaskRow id={row.id} name={row.name} wiki={row.wiki} detailLines={row.detailLines} completed={completed(row)} hidden={hidden(row)} pinned={pinned(row)} sectionKey={section.id} extraClass="farming-child-row farming-location-row" />
			{/each}
		{/each}
	{/if}
{/each}
