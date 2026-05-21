<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
import { formatDurationMs } from '@shared/time/formatters';
import { timeStore } from '@shared/time/time-store';
import TrackerHeaderMenu from '../TrackerHeaderMenu.svelte';

let { section, onReset, onRestore, columns = [], tasks = [], onToggleCollapse } = $props();

let dropdownOpen = $state(false);

const completedTaskIds = $derived(
	Object.keys(tracker.completed[section.id] || {}).filter((id) => tracker.completed[section.id][id]),
);
const hiddenTaskIds = $derived(
	Object.keys(tracker.hiddenRows[section.id] || {}).filter((id) => tracker.hiddenRows[section.id][id]),
);

const completedTasks = $derived(tasks.filter((t) => completedTaskIds.includes(t.id)));
const hiddenTasks = $derived(tasks.filter((t) => hiddenTaskIds.includes(t.id)));

const currentTime = $derived($timeStore);

const nextBoundary = $derived(
	section.shell?.showCountdown
		? section.id.includes('daily')
			? nextDailyBoundary(new Date(currentTime))
			: section.id.includes('weekly')
				? nextWeeklyBoundary(new Date(currentTime))
				: section.id.includes('monthly')
					? nextMonthlyBoundary(new Date(currentTime))
					: null
		: null,
);

const formattedCountdown = $derived(nextBoundary ? formatDurationMs(nextBoundary.getTime() - currentTime) : '');
</script>

<thead>
	<tr class:dropdown-active={dropdownOpen} class="header_like_row section-panel-header" id={section.id}>
		<td colspan={columns.length} class="header_like_color">
			<div class="header_like_inner">
				<div class="activity_name header_like_name section-panel-title">
					<span class="header_like_text">{section.label}</span>
				</div>
				
				<div class="header_like_controls section-panel-controls">
					{#if section.shell?.showCountdown && formattedCountdown}
						<span class="header_like_status countdown ds-status-chip ds-status-chip-muted section-panel-countdown">
							{formattedCountdown}
						</span>
					{/if}
					
					{#if section.shell?.showResetButton}
						<TrackerHeaderMenu
							bind:open={dropdownOpen}
							buttonClass="section-panel-reset-button"
							{completedTasks}
							{hiddenTasks}
							onToggleComplete={(task) => tracker.toggleComplete(section.id, task.id)}
							onRestore={(task) => tracker.restore(section.id, task.id)}
							onResetAll={onReset}
							onRestoreAll={onRestore}
						/>
					{/if}
					
					<button 
						type="button" 
						class="ds-button ds-button-secondary section-panel-collapse-button" 
						onclick={onToggleCollapse} 
						title="Collapse section"
					>
						&#9654;
					</button>
					<button 
						type="button" 
						class="ds-button ds-button-secondary section-panel-expand-button" 
						onclick={onToggleCollapse} 
						title="Expand section"
					>
						&#9660;
					</button>
				</div>
			</div>
		</td>
	</tr>
</thead>
