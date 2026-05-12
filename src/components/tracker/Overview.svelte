<script lang="ts">
	import { onMount } from 'svelte';
	import TaskRow from './TaskRow.svelte';
	import { tracker } from '../../stores/tracker.svelte.ts';

	let { allSections = [] } = $props();
	let ready = $state(false);

	onMount(() => {
		for (const entry of allSections) tracker.loadSection(entry.data.id);
		tracker.loadPins();
		ready = true;
	});

	const game = $derived(allSections?.[0]?.data?.game || 'rs3');
	const tasksHref = $derived(`/${game}/tasks`);

	const pinnedTasks = $derived.by(() => {
		if (!ready) return [];
		const rows: any[] = [];
		for (const entry of allSections) {
			const section = entry.data;
			for (const task of section.items || []) {
				const key = `${section.id}::${task.id}`;
				if (tracker.pins[key]) rows.push({ ...task, sectionKey: section.id, note: task.note || section.label });
				for (const child of task.childRows || []) {
					const childKey = `${section.id}::${child.id}`;
					if (tracker.pins[childKey]) rows.push({ ...child, sectionKey: section.id, note: child.note || task.name });
				}
			}
		}
		return rows;
	});

	function isTaskCompleted(task: any) {
		return !!tracker.completed[task.sectionKey]?.[task.id];
	}

	function isTaskHidden(task: any) {
		return !!tracker.hidden[task.sectionKey]?.[task.id];
	}

	function isTaskPinned(task: any) {
		return !!tracker.pins[`${task.sectionKey}::${task.id}`];
	}
</script>

<div class="row" id="overview-root">
	<div class="col-12 table_container overview-container" id="overview-container" data-section-id="overview">
		<table class="activity_table table table-dark table-hover overview-header-table" id="overview-table">
			<colgroup>
				<col class="activity_col_name" />
				<col class="activity_col_notes" />
				<col class="activity_col_status" />
			</colgroup>
			<thead>
				<tr class="header_like_row section-panel-header overview-panel-header">
					<td colspan="3" class="header_like_color">
						<div class="header_like_inner">
							<div class="activity_name header_like_name overview-panel-title">
								<span class="header_like_text">Overview</span>
							</div>
							<div class="header_like_controls overview-panel-controls">
								<a class="btn btn-secondary btn-sm active primitive-btn overview-tasks-button" href={tasksHref}>Tasks</a>
							</div>
						</div>
					</td>
				</tr>
			</thead>
		</table>

		<div class="overview-dropdown-panel">
			<div class="overview-note">Will pin all in main page for visual. Only top 5 will preview on other pages.</div>
			<div class="overview-divider" aria-hidden="true"></div>

			{#if pinnedTasks.length > 0}
				<table class="activity_table table table-dark table-hover overview-pins-table" aria-label="Pinned overview tasks">
					<colgroup>
						<col class="activity_col_name" />
						<col class="activity_col_notes" />
						<col class="activity_col_status" />
					</colgroup>
					<tbody class="activity_body">
						{#each pinnedTasks.slice(0, game === 'rs3' ? pinnedTasks.length : 5) as task (task.sectionKey + '-' + task.id)}
							<TaskRow id={task.id} name={task.name} wiki={task.wiki} note={task.note} detailLines={task.detailLines || []} completed={isTaskCompleted(task)} hidden={isTaskHidden(task)} pinned={isTaskPinned(task)} sectionKey={task.sectionKey} />
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="overview-empty-message">Pin any task with the star icon to surface it here.</div>
			{/if}
		</div>
	</div>
</div>
