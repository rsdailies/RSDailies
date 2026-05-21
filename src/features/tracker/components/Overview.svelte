<script lang="ts">
import type { PinnedTask } from '@entities/task/types';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { onMount } from 'svelte';
import { mapPinnedTasks } from '../services/pins-manager';
import SubgroupHeader from './SubgroupHeader.svelte';
import TaskRow from './TaskRow.svelte';
import OverviewEmpty from './overview/OverviewEmpty.svelte';
import OverviewHeader from './overview/OverviewHeader.svelte';

let { allSections = [] } = $props();
let ready = $state(false);

onMount(() => {
	for (const entry of allSections) tracker.loadSection(entry.data.id);
	ready = true;
});

const pinnedTasks = $derived.by(() => {
	if (!ready) return [] as PinnedTask[];
	return mapPinnedTasks(allSections, tracker.overviewPins);
});

const sectionsMap = $derived.by(() => {
	// @ts-ignore
	return Object.fromEntries(
		allSections.map((s) => [s.data.id, s.data.label || s.data.title || s.data.name || s.data.id]),
	);
});

const groupedPinnedTasks = $derived.by(() => {
	const groups: Record<string, PinnedTask[]> = {};
	for (const t of pinnedTasks) {
		if (!groups[t.sectionKey]) groups[t.sectionKey] = [];
		groups[t.sectionKey].push(t);
	}
	return Object.entries(groups).map(([key, tasks]) => ({
		sectionKey: key,
		sectionLabel: sectionsMap[key] || key,
		tasks,
	}));
});

function isCompleted(task: PinnedTask) {
	return !!tracker.completed[task.sectionKey]?.[task.id];
}
function isHidden(task: PinnedTask) {
	return !!tracker.hiddenRows[task.sectionKey]?.[task.id];
}
function isPinned(task: PinnedTask) {
	return !!tracker.overviewPins[`${task.sectionKey}::${task.id}`];
}
const isCollapsed = $derived(tracker.isCollapsedBlock('overview'));
</script>

<div class="ds-layout-row" id="overview-root">
	<div class="ds-layout-full table_container overview-container" id="overview-container" data-section-id="overview" data-hide={isCollapsed ? 'hide' : undefined}>
		<OverviewHeader {pinnedTasks} />

		<div class="overview-panel-body">
			<div class="overview-note">Pinned tasks appear here for quick access across all tracker pages.</div>
			<div class="overview-divider" aria-hidden="true"></div>

			{#if pinnedTasks.length > 0}
				<table class="activity_table ds-data-table overview-pins-table" aria-label="Pinned overview tasks">
					<colgroup>
						<col class="activity_col_name" />
						<col class="activity_col_notes" />
						<col class="activity_col_status" />
					</colgroup>
					<tbody class="activity_body">
						{#each groupedPinnedTasks as group (group.sectionKey)}
							<SubgroupHeader label={group.sectionLabel} colspan={3} />
							{#each group.tasks as task (task.sectionKey + '-' + task.id)}
								<TaskRow 
									id={task.id} 
									name={task.name} 
									wiki={task.wiki} 
									note={task.note} 
									detailLines={task.detailLines || []} 
									completed={isCompleted(task)} 
									hidden={isHidden(task)} 
									pinned={isPinned(task)} 
									sectionKey={task.sectionKey} 
								/>
							{/each}
						{/each}
					</tbody>
				</table>
			{:else}
				<OverviewEmpty />
			{/if}
		</div>
	</div>
</div>
