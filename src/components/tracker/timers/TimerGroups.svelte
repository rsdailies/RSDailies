<script lang="ts">
	import SubgroupHeader from '../SubgroupHeader.svelte';
	import TaskRow from '../TaskRow.svelte';
	import { tracker } from '../../../stores/tracker.svelte.ts';
	import { getTimerMinutes } from '../../../lib/features/timers/timer-math.ts';
	import { load } from '../../../lib/shared/storage/storage-service.ts';

	let { section, groups = [], colspan = 3 } = $props();

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

	function durationNote(timer: any) {
		if (typeof timer?.durationNote === 'string' && timer.durationNote.trim()) return timer.durationNote.trim();
		const settings = load('settings', {});
		const minutes = getTimerMinutes(timer, settings);
		return minutes > 0 ? `Growth: ${formatMinutes(minutes)}` : '';
	}

	function plotRows(group: any, timer: any) {
		const plots = Array.isArray(timer?.plots) && timer.plots.length > 0 ? timer.plots : group.plots || [];
		const note = durationNote(timer);
		return plots.map((plot: any) => ({
			id: `timers::${timer.id}::${plot.id}`,
			name: plot.name,
			wiki: plot.wiki || timer.wiki || '',
			sectionKey: section.id,
			detailLines: [
				...(note ? [{ kind: 'duration', text: note }] : []),
				...(plot.locationNote || plot.note ? [{ kind: 'location', text: plot.locationNote || plot.note }] : []),
			],
		}));
	}

	function groupTaskIds(group: any) {
		return (group.timers || []).flatMap((timer: any) => plotRows(group, timer).map((row: any) => row.id));
	}

	function timerTaskIds(group: any, timer: any) {
		return plotRows(group, timer).map((row: any) => row.id);
	}

	function completed(task: any) { return !!tracker.completed[task.sectionKey || section.id]?.[task.id]; }
	function hidden(task: any) { return !!tracker.hidden[task.sectionKey || section.id]?.[task.id]; }
	function pinned(task: any) { return !!tracker.pins[`${task.sectionKey || section.id}::${task.id}`]; }
</script>

{#each groups as group (group.id)}
	{@const groupId = `timer-group-${group.id}`}
	<SubgroupHeader id={groupId} label={`<div class="text-center w-100">${group.label || group.name || group.id}</div>`} {colspan} showControls={true} onReset={() => tracker.clearGroupCompletions(section.id, groupTaskIds(group))} />
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
