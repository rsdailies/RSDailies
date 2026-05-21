<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { buildSectionTaskGroups } from '@features/tracker/services/section-groups';
import { onMount } from 'svelte';
import SectionBody from './section/SectionBody.svelte';
import SectionHeader from './section/SectionHeader.svelte';
import SectionTable from './section/SectionTable.svelte';

let { section, tasks = [] } = $props();

onMount(() => {
	tracker.loadSection(section.id);
});

const PENGUIN_IDS = new Set([
	'penguin-1',
	'penguin-2',
	'penguin-3',
	'penguin-4',
	'penguin-5',
	'penguin-6',
	'penguin-7',
	'penguin-8',
	'penguin-9',
	'penguin-10',
	'penguin-11',
	'penguin-12',
	'penguin-polar-bear',
]);

function isPenguinTask(taskId: string) {
	return PENGUIN_IDS.has(taskId);
}

const normalTasks = $derived(tasks.filter((t: any) => !isPenguinTask(t.id)));
const penguinTasks = $derived(tasks.filter((t: any) => isPenguinTask(t.id)));

const taskGroups = $derived(buildSectionTaskGroups(section, normalTasks));
const penguinGroups = $derived([{ id: 'default', name: '', tasks: penguinTasks }]);

const columns = $derived(section.shell?.columns || ['activity_col_name', 'activity_col_notes', 'activity_col_status']);

const penguinColumns = [
	'penguin_col_name',
	'penguin_col_points',
	'penguin_col_notes',
	'penguin_col_warning',
	'penguin_col_status',
];

const isCollapsed = $derived(tracker.isCollapsedBlock(section.id));

function handleReset() {
	tracker.clearCompletions(section.id);
}
function handleRestore() {
	tracker.restoreAll(section.id);
}
function handleToggleCollapse() {
	tracker.setCollapsedBlock(section.id, !isCollapsed);
}
</script>

<section
	class="ds-section"
	id={section.containerId || `section-${section.id}`}
	data-game={section.game}
	data-section-id={section.id}
>
	{#if section.id === 'rs3weekly'}
		<div class="table_container" data-hide={isCollapsed ? 'hide' : undefined}>
			<!-- Main Weekly Table -->
			<table class="activity_table ds-data-table" id={section.tableId}>
				<colgroup>
					<col class="activity_col_name" />
					<col class="activity_col_notes" />
					<col class="activity_col_status" />
				</colgroup>
				<SectionHeader
					{section}
					columns={['activity_col_name', 'activity_col_notes', 'activity_col_status']}
					tasks={normalTasks}
					onReset={handleReset}
					onRestore={handleRestore}
					onToggleCollapse={handleToggleCollapse}
				/>
				<tbody class="activity_body">
					<SectionBody
						{section}
						taskGroups={taskGroups}
						columns={['activity_col_name', 'activity_col_notes', 'activity_col_status']}
					/>
				</tbody>
			</table>

			<!-- Penguins Subsection Table -->
			{#if penguinTasks.length > 0}
				<table class="activity_table ds-data-table penguin-table-group" id={`${section.tableId}-penguins`} style="margin-top: 0;">
					<colgroup>
						<col class="penguin_col_name" />
						<col class="penguin_col_points" />
						<col class="penguin_col_notes" />
						<col class="penguin_col_warning" />
						<col class="penguin_col_status" />
					</colgroup>
					<tbody class="activity_body">
						<SectionBody
							{section}
							taskGroups={penguinGroups}
							columns={penguinColumns}
						/>
					</tbody>
				</table>
			{/if}
		</div>
	{:else}
		<SectionTable tableId={section.tableId} {columns} collapsed={isCollapsed}>
			{#snippet header()}
				<SectionHeader {section} {columns} {tasks} onReset={handleReset} onRestore={handleRestore} onToggleCollapse={handleToggleCollapse} />
			{/snippet}
			{#snippet children()}
				<SectionBody {section} {taskGroups} {columns} />
			{/snippet}
		</SectionTable>
	{/if}
</section>
