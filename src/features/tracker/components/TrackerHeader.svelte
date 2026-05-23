<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
import { formatDurationMs } from '@shared/time/formatters';
import { timeStore } from '@shared/time/time-store';
import { AppButton, AppSectionHeader, AppSubsectionHeader } from '@shared/ui';
import TrackerHeaderMenu from './TrackerHeaderMenu.svelte';

type MenuTaskEntry = {
	id: string;
	name: string;
	sectionKey?: string;
};

let {
	type = 'section', // 'section' | 'subgroup' | 'overview'
	id = '',
	label = '',
	colspan = 3,
	tasks = [] as MenuTaskEntry[],
	sectionId = '', // used for standard section/subgroup to look up completion/hidden tasks
	rightText = '',
	extraClass = '',
	showCountdown = true,
	showResetButton = true,
	onReset = null,
	onRestore = null,
	onToggleCollapse = null,
	showControls = true,
} = $props<{
	type?: 'section' | 'subgroup' | 'overview';
	id?: string;
	label?: string;
	colspan?: number;
	tasks?: MenuTaskEntry[];
	sectionId?: string;
	rightText?: string;
	extraClass?: string;
	showCountdown?: boolean;
	showResetButton?: boolean;
	onReset?: (() => void) | null;
	onRestore?: (() => void) | null;
	onToggleCollapse?: (() => void) | null;
	showControls?: boolean;
}>();

let dropdownOpen = $state(false);

const isCollapsed = $derived(id ? tracker.isCollapsedBlock(id) : false);

// Determine completed and hidden tasks reactively based on variant
const completedTasks = $derived(
	tasks.filter((t) => {
		const sId = t.sectionKey || sectionId;
		return sId ? !!tracker.completed[sId]?.[t.id] : false;
	}),
);

const hiddenTasks = $derived(
	tasks.filter((t) => {
		const sId = t.sectionKey || sectionId;
		return sId ? !!tracker.hiddenRows[sId]?.[t.id] : false;
	}),
);

// Countdown calculation (only for main section header if countdown is enabled)
const currentTime = $derived($timeStore);
const nextBoundary = $derived.by(() => {
	if (type !== 'section' || !showCountdown || !id) return null;
	const now = new Date(currentTime);
	if (id.includes('daily')) {
		return nextDailyBoundary(now);
	} else if (id.includes('weekly')) {
		return nextWeeklyBoundary(now);
	} else if (id.includes('monthly')) {
		return nextMonthlyBoundary(now);
	}
	return null;
});

const formattedCountdown = $derived(nextBoundary ? formatDurationMs(nextBoundary.getTime() - currentTime) : '');

// Handle reset and restore callbacks internally if not provided as props
function handleResetAll() {
	if (onReset) {
		onReset();
	} else {
		// Default section/overview reset logic
		if (type === 'overview') {
			// Overview: reset completions across different sections
			const bySection: Record<string, string[]> = {};
			for (const t of completedTasks) {
				const sKey = t.sectionKey || sectionId;
				if (sKey) {
					if (!bySection[sKey]) bySection[sKey] = [];
					bySection[sKey].push(t.id);
				}
			}
			for (const [sectionKey, ids] of Object.entries(bySection)) {
				tracker.clearGroupCompletions(sectionKey, ids);
			}
		} else if (sectionId || id) {
			const sId = sectionId || id;
			tracker.clearCompletions(sId);
		}
	}
}

function handleRestoreAll() {
	if (onRestore) {
		onRestore();
	} else {
		// Default section/overview restore logic
		const bySection: Record<string, string[]> = {};
		for (const t of hiddenTasks) {
			const sKey = t.sectionKey || sectionId;
			if (sKey) {
				if (!bySection[sKey]) bySection[sKey] = [];
				bySection[sKey].push(t.id);
			}
		}
		for (const [sectionKey, ids] of Object.entries(bySection)) {
			tracker.restoreGroup(sectionKey, ids);
		}
	}
}

function handleToggle() {
	if (onToggleCollapse) {
		onToggleCollapse();
	} else if (id) {
		tracker.setCollapsedBlock(id, !isCollapsed);
	}
}
</script>

{#if type === 'section' || type === 'overview'}
	<AppSectionHeader
		{id}
		{colspan}
		{label}
		statusText={formattedCountdown}
		{extraClass}
		dropdownActive={dropdownOpen}
	>
		{#snippet controls()}
			{#if showControls && showResetButton}
				<TrackerHeaderMenu
					bind:open={dropdownOpen}
					buttonClass="section-panel-reset-button"
					{completedTasks}
					{hiddenTasks}
					onToggleComplete={(task) => tracker.toggleComplete(task.sectionKey || sectionId || id, task.id)}
					onRestore={(task) => tracker.restore(task.sectionKey || sectionId || id, task.id)}
					onResetAll={handleResetAll}
					onRestoreAll={handleRestoreAll}
				/>
			{/if}
			{#if id && showControls}
				<AppButton
					variant="secondary"
					className="section-panel-toggle-button"
					title={isCollapsed ? 'Expand section' : 'Collapse section'}
					ariaLabel={isCollapsed ? 'Expand section' : 'Collapse section'}
					onclick={handleToggle}
				>
					{#if isCollapsed}&#9654;{:else}&#9660;{/if}
				</AppButton>
			{/if}
		{/snippet}
	</AppSectionHeader>
{:else}
	<AppSubsectionHeader
		{id}
		{colspan}
		{label}
		statusText={rightText}
		{extraClass}
		dropdownActive={dropdownOpen}
	>
		{#snippet controls()}
			{#if showControls && onReset}
				<TrackerHeaderMenu
					bind:open={dropdownOpen}
					buttonClass="mini-reset-control ds-button-primitive"
					{completedTasks}
					{hiddenTasks}
					onToggleComplete={(task) => tracker.toggleComplete(task.sectionKey || sectionId || id, task.id)}
					onRestore={(task) => tracker.restore(task.sectionKey || sectionId || id, task.id)}
					onResetAll={handleResetAll}
					onRestoreAll={handleRestoreAll}
				/>
			{/if}
			{#if id && showControls}
				<AppButton
					variant="secondary"
					size="sm"
					primitive={true}
					className="mini-collapse-control"
					title={isCollapsed ? 'Expand section' : 'Collapse section'}
					ariaLabel={isCollapsed ? 'Expand section' : 'Collapse section'}
					onclick={handleToggle}
				>
					{#if isCollapsed}&#9654;{:else}&#9660;{/if}
				</AppButton>
			{/if}
		{/snippet}
	</AppSubsectionHeader>
{/if}
