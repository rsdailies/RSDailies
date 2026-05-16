<script lang="ts">
	import { onMount } from 'svelte';
	import TaskRow from './TaskRow.svelte';
	import SubgroupHeader from './SubgroupHeader.svelte';
	import { TimerGroups } from '@features/timers';
	import { tracker } from '@features/tracker';
	import { load } from '@shared/storage/storage-service';
	import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
	import { formatDurationMs } from '@shared/time/formatters';
	import { appShellState } from '@app/state/shell.svelte';
	import { transformTasks } from '../services/task-transforms';

	let { section, tasks = [] } = $props();
	let restoreMenuButton = $state<HTMLButtonElement | null>(null);
	let restoreMenuOpen = $state(false);

	const shell = $derived(section.shell || {});
	const columns = $derived(shell.columns || ['activity_col_name', 'activity_col_notes', 'activity_col_status']);
	const extraTableClasses = $derived((shell.extraTableClasses || []).join(' '));
	const sectionKey = $derived(section.id);
	const taskGroups = $derived(getGroups(transformTasks(tasks, sectionKey), section));
	const hiddenCount = $derived(Object.values(tracker.hidden[sectionKey] || {}).length);
	const isCollapsed = $derived(tracker.isCollapsedBlock(sectionKey));
	const isOsrsPlaceholder = $derived(section.game === 'osrs' && section.renderVariant !== 'timer-groups' && taskGroups.every((group) => (group.tasks || []).length === 0));
	let countdownText = $state('');

	onMount(() => {
		tracker.loadSection(sectionKey);
		const stopTicker = startCountdownTicker();
		const handleDocumentClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			if (!restoreMenuOpen) return;
			if (!target?.closest?.(`[data-section-id="${section.id}"]`)) restoreMenuOpen = false;
		};
		const handleDocumentKeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || !restoreMenuOpen) return;
			restoreMenuOpen = false;
			if (restoreMenuButton && typeof window !== 'undefined') {
				window.requestAnimationFrame(() => restoreMenuButton?.focus());
			}
		};
		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleDocumentKeydown);
		return () => {
			stopTicker?.();
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});


	function getGroups(sourceTasks: TrackerTask[], sourceSection: TrackerSection): TaskGroup[] {
		if (sourceSection.renderVariant === 'grouped-sections') {
			const groups = new Map<string, TrackerTask[]>();
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

	function taskSectionKey(task: { sectionKey?: string }) {
		return task.sectionKey || sectionKey;
	}

	function isTaskCompleted(task: { id: string; sectionKey?: string }) {
		return !!tracker.completed[taskSectionKey(task)]?.[task.id];
	}

	function isTaskHidden(task: { id: string; sectionKey?: string }) {
		return !!tracker.hidden[taskSectionKey(task)]?.[task.id];
	}

	function isTaskPinned(task: { id: string; sectionKey?: string }, parentId = '') {
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
		restoreMenuOpen = false;
	}

	function resetTaskIds(taskIds: string[], key = sectionKey) {
		tracker.clearGroupCompletions(key, taskIds);
	}

	function restoreAll() {
		tracker.restoreAll(sectionKey);
		restoreMenuOpen = false;
	}

	function toggleCollapsed() {
		tracker.setCollapsedBlock(sectionKey, !isCollapsed);
	}

	function openCustomTaskModal(event: MouseEvent) {
		appShellState.openModal('custom-task', event.currentTarget as HTMLElement | null);
	}

	function toggleRestoreMenu(event: MouseEvent) {
		event.stopPropagation();
		if (hiddenCount < 1) {
			resetSection();
			return;
		}
		restoreMenuOpen = !restoreMenuOpen;
	}


</script>

<div class="ds-layout-full table_container" id={section.containerId || `${section.id}-container`} data-section-id={section.id} data-hide={isCollapsed ? 'hide' : 'show'} data-show-hidden="false">
	<table class={`activity_table ds-data-table ${extraTableClasses}`} id={section.tableId || `${section.id}-table`}>
		<colgroup>
			{#each columns as col}
				<col class={col} />
			{/each}
		</colgroup>
		<thead>
			<tr class="header_like_row section-panel-header">
				<th colspan={columns.length} class="header_like_color">
					<div class="header_like_inner">
						<div class="activity_name header_like_name section-panel-title">
							<span class="header_like_text">{section.label}</span>
						</div>
						<div class="header_like_controls section-panel-controls">
							{#if shell.countdownId}
								<span id={shell.countdownId} class="header_like_status countdown ds-status-chip ds-status-chip-muted section-panel-countdown">{countdownText || '--:--:--'}</span>
							{/if}
							{#if shell.showAddButton}
								<button id={`${section.id}_add_button`} type="button" class="ds-button ds-button-primary ds-button-small active ds-button-primitive section-panel-add-button" onclick={openCustomTaskModal}>+ Add</button>
							{/if}
							{#if shell.showResetButton !== false}
								<div class="section-panel-menu-shell">
									<button
										id={`${section.id}_reset_button`}
										type="button"
										class="ds-button ds-button-secondary ds-button-small active ds-button-primitive section-panel-reset-button"
										aria-expanded={hiddenCount >= 1 ? restoreMenuOpen : undefined}
										aria-haspopup={hiddenCount >= 1 ? 'menu' : undefined}
										title={hiddenCount >= 1 ? 'Section actions' : 'Clear completed'}
										aria-label={hiddenCount >= 1 ? 'Section actions' : 'Clear completed tasks'}
										onclick={toggleRestoreMenu}
										bind:this={restoreMenuButton}
									>
										&#8635;
									</button>
									{#if hiddenCount >= 1 && restoreMenuOpen}
										<ul class="ds-menu ds-menu-end section-restore-menu" aria-labelledby={`${section.id}_reset_button`} role="menu">
											<li><button class="ds-menu-item section-restore-all-action" type="button" role="menuitem" onclick={restoreAll}>Restore Hidden Rows</button></li>
											<li><hr class="ds-menu-divider" /></li>
											<li><button class="ds-menu-item section-clear-completion-action" type="button" role="menuitem" onclick={resetSection}>Clear Completed</button></li>
										</ul>
									{/if}
								</div>
							{/if}
							<button id={`${section.id}_hide_button`} type="button" class="ds-button ds-button-secondary ds-button-small active ds-button-primitive section-panel-collapse-button section-panel-toggle-button" onclick={toggleCollapsed} title="Collapse section" aria-label="Collapse section">&#9660;</button>
							<button id={`${section.id}_unhide_button`} type="button" class="ds-button ds-button-secondary ds-button-small active ds-button-primitive section-panel-expand-button section-panel-toggle-button" onclick={toggleCollapsed} title="Expand section" aria-label="Expand section">&#9654;</button>
						</div>
					</div>
				</th>
			</tr>
		</thead>
		{#if !isCollapsed}
			<tbody class="activity_body">
				{#if section.renderVariant === 'timer-groups'}
					<TimerGroups {section} groups={section.groups || []} colspan={columns.length} />
				{:else}
					{#if isOsrsPlaceholder}
						<tr class="custom-empty-row">
							<td colspan={columns.length} class="activity_notes">
								<span class="activity_desc">OSRS task data will appear here as sections are added.</span>
							</td>
						</tr>
					{:else}
					{#each taskGroups as group (group.id)}
						{#if group.name && section.renderVariant === 'grouped-sections'}
							<SubgroupHeader id={group.id} label={`<div class="section-group-heading">${group.name}</div>`} colspan={columns.length} showControls={true} onReset={() => resetTaskIds(group.tasks.map((task: any) => task.id))} />
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
				{/if}
			</tbody>
		{/if}
	</table>
</div>
