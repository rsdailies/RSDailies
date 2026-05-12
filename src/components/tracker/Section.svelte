<script lang="ts">
	import { onMount } from 'svelte';
	import TaskRow from './TaskRow.svelte';
	import SubgroupHeader from './SubgroupHeader.svelte';
	import TimerGroups from './timers/TimerGroups.svelte';
	import { tracker } from '../../stores/tracker.svelte.ts';
	import { load } from '../../lib/shared/storage/storage-service.ts';
	import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '../../lib/shared/time/boundaries.ts';
	import { formatDurationMs } from '../../lib/shared/time/formatters.ts';

	let { section, tasks = [] } = $props();

	const shell = $derived(section.shell || {});
	const columns = $derived(shell.columns || ['activity_col_name', 'activity_col_notes', 'activity_col_status']);
	const extraTableClasses = $derived((shell.extraTableClasses || []).join(' '));
	const sectionKey = $derived(section.id);
	const taskGroups = $derived(getGroups(injectPenguinData(tasks), section));
	const hiddenCount = $derived(Object.values(tracker.hidden[sectionKey] || {}).length);
	const isCollapsed = $derived(tracker.isCollapsedBlock(sectionKey));
	let countdownText = $state('');

	onMount(() => {
		tracker.loadSection(sectionKey);
		return startCountdownTicker();
	});

	function injectPenguinData(sourceTasks: any[]) {
		if (section.id !== 'rs3weekly' || typeof window === 'undefined') return sourceTasks;
		const penguinData = load('penguinWeeklyData', {});
		return sourceTasks.map((task) => {
			if (task.id !== 'penguins' || !task.childRows) return task;
			return {
				...task,
				childRows: task.childRows.map((child: any) => ({
					...child,
					name: penguinData?.[child.id]?.name || child.name,
					note: penguinData?.[child.id]?.note || child.note,
				})),
			};
		});
	}

	function getGroups(sourceTasks: any[], sourceSection: any) {
		if (sourceSection.renderVariant === 'grouped-sections') {
			const groups = new Map<string, any[]>();
			for (const task of sourceTasks) {
				const groupName = task.group || (task.reset === 'weekly' ? 'Weekly' : 'Daily');
				if (!groups.has(groupName)) groups.set(groupName, []);
				groups.get(groupName)?.push(task);
			}
			return Array.from(groups.entries()).map(([name, groupTasks]) => ({
				id: `${sourceSection.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
				name,
				tasks: groupTasks,
			}));
		}
		return [{ id: `${sourceSection.id}-root`, name: '', tasks: sourceTasks }];
	}

	function taskSectionKey(task: any) {
		return task.sectionKey || sectionKey;
	}

	function isTaskCompleted(task: any) {
		return !!tracker.completed[taskSectionKey(task)]?.[task.id];
	}

	function isTaskHidden(task: any) {
		return !!tracker.hidden[taskSectionKey(task)]?.[task.id];
	}

	function isTaskPinned(task: any, parentId = '') {
		const key = taskSectionKey(task);
		return !!tracker.pins[`${key}::${parentId ? `${parentId}::` : ''}${task.id}`] || !!tracker.pins[`${key}::${task.id}`];
	}

	function resetBoundaryForSection(sectionId: string) {
		const normalized = String(sectionId || '').toLowerCase();
		if (normalized.includes('daily')) return nextDailyBoundary;
		if (normalized.includes('weekly')) return nextWeeklyBoundary;
		if (normalized.includes('monthly')) return nextMonthlyBoundary;
		return null;
	}

	function updateCountdownText() {
		if (!shell.countdownId) {
			countdownText = '';
			return;
		}
		const boundaryResolver = resetBoundaryForSection(sectionKey);
		if (!boundaryResolver) {
			countdownText = '';
			return;
		}
		countdownText = formatDurationMs(boundaryResolver(new Date()).getTime() - Date.now());
	}

	function startCountdownTicker() {
		if (typeof window === 'undefined' || !shell.countdownId) return undefined;
		updateCountdownText();
		const intervalId = window.setInterval(updateCountdownText, 1000);
		return () => window.clearInterval(intervalId);
	}

	function resetSection() {
		tracker.clearCompletions(sectionKey);
	}

	function resetTaskIds(taskIds: string[], key = sectionKey) {
		tracker.clearGroupCompletions(key, taskIds);
	}

	function restoreAll() {
		tracker.restoreAll(sectionKey);
	}

	function toggleCollapsed() {
		tracker.setCollapsedBlock(sectionKey, !isCollapsed);
	}
</script>

<div class="col-12 table_container" id={section.containerId || `${section.id}-container`} data-section-id={section.id} data-hide={isCollapsed ? 'hide' : 'show'} data-show-hidden="false">
	<table class={`activity_table table table-dark table-hover ${extraTableClasses}`} id={section.tableId || `${section.id}-table`}>
		<colgroup>
			{#each columns as col}
				<col class={col} />
			{/each}
		</colgroup>
		<thead>
			<tr class="header_like_row section-panel-header">
				<td colspan={columns.length} class="header_like_color">
					<div class="header_like_inner">
						<div class="activity_name header_like_name section-panel-title">
							<span class="header_like_text">{section.label}</span>
						</div>
						<div class="header_like_controls section-panel-controls">
							{#if shell.countdownId}
								<span id={shell.countdownId} class="header_like_status countdown badge bg-secondary section-panel-countdown">{countdownText || '--:--:--'}</span>
							{/if}
							{#if shell.showAddButton}
								<button id={`${section.id}_add_button`} type="button" class="btn btn-primary btn-sm active primitive-btn section-panel-add-button" data-bs-toggle="modal" data-bs-target="#custom-task-modal">+ Add</button>
							{/if}
							{#if shell.showResetButton !== false}
								<div class="dropdown d-inline-block">
									<button id={`${section.id}_reset_button`} type="button" class={`btn btn-secondary btn-sm active primitive-btn section-panel-reset-button ${hiddenCount >= 1 ? 'dropdown-toggle no-caret' : ''}`} data-bs-toggle={hiddenCount >= 1 ? 'dropdown' : undefined} aria-expanded="false" onclick={resetSection}>♻</button>
									{#if hiddenCount >= 1}
										<ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end section-restore-dropdown" aria-labelledby={`${section.id}_reset_button`}>
											<li><button class="dropdown-item section-restore-all-btn" type="button" onclick={restoreAll}>Restore Hidden Rows</button></li>
											<li><hr class="dropdown-divider" /></li>
											<li><button class="dropdown-item section-clear-completion-btn" type="button" onclick={resetSection}>Clear Completed</button></li>
										</ul>
									{/if}
								</div>
							{/if}
							<button id={`${section.id}_hide_button`} type="button" class="btn btn-secondary btn-sm active primitive-btn hide_button section-panel-toggle-button" onclick={toggleCollapsed} title="Collapse section">▼</button>
							<button id={`${section.id}_unhide_button`} type="button" class="btn btn-secondary btn-sm active primitive-btn unhide_button section-panel-toggle-button" onclick={toggleCollapsed} title="Expand section">▶</button>
						</div>
					</div>
				</td>
			</tr>
		</thead>
		{#if !isCollapsed}
			<tbody class="activity_body">
				{#if section.renderVariant === 'timer-groups'}
					<TimerGroups {section} groups={section.groups || []} colspan={columns.length} />
				{:else}
					{#each taskGroups as group (group.id)}
						{#if group.name && section.renderVariant === 'grouped-sections'}
							<SubgroupHeader id={group.id} label={`<div class="text-center w-100">${group.name}</div>`} colspan={columns.length} showControls={true} onReset={() => resetTaskIds(group.tasks.map((task: any) => task.id))} />
						{/if}
						{#if !tracker.isCollapsedBlock(group.id)}
							{#each group.tasks as task (task.id)}
								{#if Array.isArray(task.childRows) && task.childRows.length > 0}
									<SubgroupHeader id={task.id} label={task.name} colspan={columns.length} showControls={true} onReset={() => resetTaskIds(task.childRows.map((child: any) => child.id), task.sectionKey || sectionKey)} />
									{#if !tracker.isCollapsedBlock(task.id)}
										{#each task.childRows as child (child.id)}
											<TaskRow id={child.id} name={child.name} wiki={child.wiki || task.wiki} note={child.note} completed={isTaskCompleted(child)} hidden={isTaskHidden(child)} pinned={isTaskPinned(child, task.id)} sectionKey={child.sectionKey || task.sectionKey || sectionKey} extraClass="child-row" />
										{/each}
									{/if}
								{:else}
									<TaskRow id={task.id} name={task.name} wiki={task.wiki} note={task.note} detailLines={task.detailLines || []} completed={isTaskCompleted(task)} hidden={isTaskHidden(task)} pinned={isTaskPinned(task)} sectionKey={taskSectionKey(task)} />
								{/if}
							{/each}
						{/if}
					{/each}
				{/if}
			</tbody>
		{/if}
	</table>
</div>
