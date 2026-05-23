<script lang="ts">
import type { PinnedTask } from '@entities/task/types';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { onMount } from 'svelte';
import { mapPinnedTasks } from '../services/pins-manager';
import TaskRow from './TaskRow.svelte';
import TrackerHeader from './TrackerHeader.svelte';
import OverviewEmpty from './overview/OverviewEmpty.svelte';

type SectionEntry = {
	data: {
		id: string;
		label?: string;
		items?: unknown[];
		groups?: unknown[];
	};
};

let { allSections = [] as SectionEntry[] } = $props<{
	allSections?: SectionEntry[];
}>();
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
	return allSections.reduce<Record<string, string>>((sections, sectionEntry) => {
		sections[sectionEntry.data.id] = sectionEntry.data.label || sectionEntry.data.id;
		return sections;
	}, {});
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
		<table class="activity_table ds-data-table" id="overview-table">
			<colgroup>
				<col class="activity_col_name" />
				<col class="activity_col_notes" />
				<col class="activity_col_status" />
			</colgroup>
			<TrackerHeader
				type="overview"
				id="overview"
				label="Overview"
				colspan={3}
				tasks={pinnedTasks}
			/>

			<tbody class="activity_body">
				<tr class="overview-info-row">
					<td colspan="3" class="overview-info-cell">
						<div class="overview-note">Pinned tasks appear here for quick access across all tracker pages.</div>
						<div class="overview-divider" aria-hidden="true"></div>
					</td>
				</tr>

				{#if pinnedTasks.length > 0}
					{#each groupedPinnedTasks as group (group.sectionKey)}
						<TrackerHeader
							type="subgroup"
							label={group.sectionLabel}
							colspan={3}
						/>
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
				{:else}
					<tr class="overview-empty-row">
						<td colspan="3" class="overview-empty-cell">
							<OverviewEmpty />
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
