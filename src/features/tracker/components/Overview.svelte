<script lang="ts">
	import { onMount } from 'svelte';
	import TaskRow from './TaskRow.svelte';
	import { tracker } from '@features/tracker';
	import type { TrackerSection, TrackerTask, PinnedTask } from '@entities/task/types';

	let { allSections = [] }: { allSections: any[] } = $props();
	let ready = $state(false);

	onMount(() => {
		for (const entry of allSections) tracker.loadSection(entry.data.id);
		tracker.loadPins();
		ready = true;
	});

	const game = $derived(allSections?.[0]?.data?.game || 'rs3');

	const pinnedTasks = $derived.by(() => {
		if (!ready) return [] as PinnedTask[];
		const rows: PinnedTask[] = [];
		for (const entry of allSections) {
			const section: TrackerSection = entry.data;
			for (const task of section.items || []) {
				const key = `${section.id}::${task.id}`;
				if (tracker.pins[key]) rows.push({ ...task, sectionKey: section.id, note: task.note || section.label } as PinnedTask);
				for (const child of task.childRows || []) {
					const childKey = `${section.id}::${child.id}`;
					if (tracker.pins[childKey]) rows.push({ ...child, sectionKey: section.id, note: child.note || task.name } as PinnedTask);
				}
			}
		}
		return rows;
	});

	function isTaskCompleted(task: PinnedTask) {
		return !!tracker.completed[task.sectionKey]?.[task.id];
	}

	function isTaskHidden(task: PinnedTask) {
		return !!tracker.hidden[task.sectionKey]?.[task.id];
	}

	function isTaskPinned(task: PinnedTask) {
		return !!tracker.pins[`${task.sectionKey}::${task.id}`];
	}


</script>

<div class="ds-layout-row" id="overview-root">
	<div class="ds-layout-full table_container overview-container" id="overview-container" data-section-id="overview">
		<table class="activity_table ds-data-table overview-header-table" id="overview-table">
			<colgroup>
				<col class="activity_col_name" />
				<col class="activity_col_notes" />
				<col class="activity_col_status" />
			</colgroup>
			<thead>
				<tr class="header_like_row section-panel-header overview-panel-header">
					<th colspan="3" class="header_like_color">
						<div class="header_like_inner">
							<div class="activity_name header_like_name section-panel-title">
								<span class="header_like_text">Overview</span>
							</div>
							<div class="header_like_controls section-panel-controls">
								<!-- Controls removed to match Dailies style -->
							</div>
						</div>
					</th>
				</tr>
			</thead>
		</table>

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
						{#each pinnedTasks as task (task.sectionKey + '-' + task.id)}
							<TaskRow id={task.id} name={task.name} wiki={task.wiki} note={task.note} detailLines={task.detailLines || []} completed={isTaskCompleted(task)} hidden={isTaskHidden(task)} pinned={isTaskPinned(task)} sectionKey={task.sectionKey} />
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="overview-empty-message">
					<div>
						<strong>No pinned tasks yet.</strong>
						<div>Pin tasks from any section to build your personal daily overview.</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
