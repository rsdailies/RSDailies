<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import TrackerHeaderMenu from './TrackerHeaderMenu.svelte';
let {
	label,
	colspan,
	rightText = '',
	id = '',
	showControls = false,
	onReset = null,
	extraClass = '',
	sectionId = '',
	tasks = [],
} = $props();

const isCollapsed = $derived(id ? tracker.isCollapsedBlock(id) : false);

let dropdownOpen = $state(false);

function toggle() {
	if (id) tracker.setCollapsedBlock(id, !isCollapsed);
}

const completedTaskIds = $derived(
	Object.keys(tracker.completed[sectionId] || {}).filter((taskId) => tracker.completed[sectionId][taskId]),
);
const hiddenTaskIds = $derived(
	Object.keys(tracker.hiddenRows[sectionId] || {}).filter((taskId) => tracker.hiddenRows[sectionId][taskId]),
);

const completedTasks = $derived(tasks.filter((t: any) => completedTaskIds.includes(t.id)));
const hiddenTasks = $derived(tasks.filter((t: any) => hiddenTaskIds.includes(t.id)));

function restoreAll() {
	for (const task of hiddenTasks) {
		tracker.restore(sectionId, task.id);
	}
	dropdownOpen = false;
}
</script>

<tr class:dropdown-active={dropdownOpen} class="header_like_row subgroup-header-row {extraClass}" data-subgroup-id={id}>
	<td colspan={colspan} class="header_like_color">
		<div class="header_like_inner">
			<div class="activity_name header_like_name">
				<span class="header_like_text">{@html label}</span>
			</div>
			<div class="header_like_controls">
				{#if rightText}<span class="header_like_status countdown ds-status-chip ds-status-chip-muted">{rightText}</span>{/if}
				{#if showControls}
					{#if onReset}
						<TrackerHeaderMenu
							bind:open={dropdownOpen}
							buttonClass="ds-button-small mini-reset-control ds-button-primitive"
							{completedTasks}
							{hiddenTasks}
							onToggleComplete={(task) => tracker.toggleComplete(sectionId, task.id)}
							onRestore={(task) => tracker.restore(sectionId, task.id)}
							onResetAll={() => {
								if (typeof onReset === 'function') onReset();
							}}
							onRestoreAll={restoreAll}
						/>
					{/if}
					{#if id}
						<button type="button" class="ds-button ds-button-secondary ds-button-small mini-collapse-control ds-button-primitive" onclick={toggle}>
							{#if isCollapsed}&#9654;{:else}&#9660;{/if}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	</td>
</tr>
