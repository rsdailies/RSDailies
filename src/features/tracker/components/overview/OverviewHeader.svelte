<script lang="ts">
import type { PinnedTask } from '@entities/task/types';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import TrackerHeaderMenu from '../TrackerHeaderMenu.svelte';

let { pinnedTasks = [] } = $props();

let dropdownOpen = $state(false);

const isCollapsed = $derived(tracker.isCollapsedBlock('overview'));

function handleToggleCollapse() {
	tracker.setCollapsedBlock('overview', !isCollapsed);
}

const completedTasks = $derived(pinnedTasks.filter((t: PinnedTask) => tracker.completed[t.sectionKey]?.[t.id]));
const hiddenTasks = $derived(pinnedTasks.filter((t: PinnedTask) => tracker.hiddenRows[t.sectionKey]?.[t.id]));

function resetAllCompleted() {
	for (const t of completedTasks) {
		tracker.toggleComplete(t.sectionKey, t.id);
	}
}

function resetAllRemoved() {
	for (const t of hiddenTasks) {
		tracker.restore(t.sectionKey, t.id);
	}
}
</script>

<table class="activity_table ds-data-table" id="overview-table">
	<colgroup>
		<col class="activity_col_name" />
		<col class="activity_col_notes" />
		<col class="activity_col_status" />
	</colgroup>
	<thead>
		<tr class:dropdown-active={dropdownOpen} class="header_like_row section-panel-header">
			<td colspan="3" class="header_like_color">
				<div class="header_like_inner">
					<div class="activity_name header_like_name section-panel-title">
						<span class="header_like_text">Overview</span>
					</div>
					
					<div class="header_like_controls section-panel-controls">
						<TrackerHeaderMenu
							bind:open={dropdownOpen}
							buttonClass="section-panel-reset-button"
							{completedTasks}
							{hiddenTasks}
							onToggleComplete={(task) => tracker.toggleComplete(task.sectionKey || '', task.id)}
							onRestore={(task) => tracker.restore(task.sectionKey || '', task.id)}
							onResetAll={resetAllCompleted}
							onRestoreAll={resetAllRemoved}
						/>

						<button 
							type="button" 
							class="ds-button ds-button-secondary section-panel-collapse-button" 
							onclick={handleToggleCollapse} 
							title="Collapse section"
						>
							&#9654;
						</button>
						<button 
							type="button" 
							class="ds-button ds-button-secondary section-panel-expand-button" 
							onclick={handleToggleCollapse} 
							title="Expand section"
						>
							&#9660;
						</button>
					</div>
				</div>
			</td>
		</tr>
	</thead>
</table>
