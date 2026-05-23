<script lang="ts">
import type { TaskGroup, TrackerSection, TrackerTask } from '@entities/task/types';
import { usePenguinStore } from '@features/penguins/stores/penguin.svelte';
import { clearTimer } from '@features/timers';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { load, save } from '@shared/storage/storage-service';
import { nextDailyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
import { formatDurationMs } from '@shared/time/formatters';
import { timeStore } from '@shared/time/time-store';
import TaskRow from '../TaskRow.svelte';
import TrackerHeader from '../TrackerHeader.svelte';
import RowName from '../row/RowName.svelte';
import RowStatus from '../row/RowStatus.svelte';

let {
	section,
	taskGroups = [] as TaskGroup[],
	columns = [] as string[],
} = $props<{
	section: TrackerSection;
	taskGroups?: TaskGroup[];
	columns?: string[];
}>();

const penguins = usePenguinStore();

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

const PENGUIN_GROUP_ID = $derived(`${section.id}-penguins`);

function isCompleted(sectionId: string, taskId: string) {
	return !!tracker.completed[sectionId]?.[taskId];
}

function isHidden(sectionId: string, taskId: string) {
	return !!tracker.hiddenRows[sectionId]?.[taskId];
}

function isPinned(sectionId: string, taskId: string) {
	return !!tracker.overviewPins[`${sectionId}::${taskId}`];
}

function isPenguinTask(taskId: string) {
	return PENGUIN_IDS.has(taskId);
}

function resetPenguins() {
	const completedPenguinIds = Array.from(PENGUIN_IDS).filter((id) => tracker.completed[section.id]?.[id]);
	if (completedPenguinIds.length > 0) {
		tracker.clearGroupCompletions(section.id, completedPenguinIds);
	}
}

function resetGroup(sectionId: string, groupTasks: TrackerTask[]) {
	const completedIds = groupTasks.map((t) => t.id).filter((id) => tracker.completed[sectionId]?.[id]);

	if (completedIds.length > 0) {
		tracker.clearGroupCompletions(sectionId, completedIds);
	}

	for (const task of groupTasks) {
		if (task.timerId) {
			clearTimer(task.timerId, { load, save });
		}
	}
}

const isPenguinGroupCollapsed = $derived(tracker.isCollapsedBlock(PENGUIN_GROUP_ID));

const currentTime = $derived($timeStore);

const groupCountdown = $derived.by(() => {
	const now = new Date(currentTime);
	const dailyDiff = nextDailyBoundary(now).getTime() - currentTime;
	const weeklyDiff = nextWeeklyBoundary(now).getTime() - currentTime;

	return {
		[`${section.id}-daily`]: formatDurationMs(dailyDiff),
		[`${section.id}-weekly`]: formatDurationMs(weeklyDiff),
	} as Record<string, string>;
});
</script>

{#each taskGroups as group (group.id)}
	{@const groupCollapsed = group.id !== 'default' ? tracker.isCollapsedBlock(group.id) : false}
	{@const penguinTasks = group.tasks.filter((task) => isPenguinTask(task.id))}
	{@const normalTasks = group.tasks.filter((task) => !isPenguinTask(task.id))}

	{#if group.name}
		<TrackerHeader
			type="subgroup"
			id={group.id}
			label={group.name}
			colspan={columns.length}
			showControls={true}
			rightText={group.id ? groupCountdown[group.id] : ''}
			onReset={() => resetGroup(section.id, group.tasks)}
			sectionId={section.id}
			tasks={group.tasks}
		/>
	{/if}

	{#if !groupCollapsed}
		{#each normalTasks as task (task.id)}
			<TaskRow
				id={task.id}
				name={task.name}
				wiki={task.wiki}
				note={task.note}
				detailLines={task.detailLines}
				completed={isCompleted(section.id, task.id)}
				hidden={isHidden(section.id, task.id)}
				pinned={isPinned(section.id, task.id)}
				sectionKey={section.id}
				cooldownMinutes={task.cooldownMinutes}
				timerId={task.timerId}
				notesColspan={columns.length - 2}
			/>
		{/each}
	{/if}

	{#if penguinTasks.length > 0}
		<TrackerHeader
			type="subgroup"
			id={PENGUIN_GROUP_ID}
			label="Penguins"
			colspan={columns.length}
			showControls={true}
			onReset={resetPenguins}
			extraClass="subgroup-attached-header"
			sectionId={section.id}
			tasks={penguinTasks}
		/>
		{#if !isPenguinGroupCollapsed}
			{#each penguinTasks as task (task.id)}
				{#if !isHidden(section.id, task.id)}
					{@const liveTask = penguins.getLiveTask(task.id)}
					{@const isDone = isCompleted(section.id, task.id)}
					<tr class="ds-task-row penguin-row" class:completed={isDone} data-task-id={task.id} data-completed={isDone}>
						<RowName
							id={task.id}
							name={task.name}
							wiki={task.wiki}
							pinned={isPinned(section.id, task.id)}
							hidden={isHidden(section.id, task.id)}
							onPin={() => tracker.togglePin(section.id, task.id)}
							onHide={() => tracker.hide(section.id, task.id)}
						/>

						<td class="activity_points">
							{liveTask?.points || (task.id === 'penguin-polar-bear' ? '2 points' : '1 point')}
						</td>

						<td class="activity_notes" onclick={() => tracker.toggleComplete(section.id, task.id)}>
							<div class="notes-container">
								{#if liveTask}
									{@const parts = [liveTask.disguise, liveTask.location].filter(Boolean)}
									<span class="note-text">{parts.join(' | ')}</span>
								{:else if task.note}
									<span class="detail-line location">{task.note}</span>
								{/if}
							</div>
						</td>

						<td class="activity_warning" onclick={() => tracker.toggleComplete(section.id, task.id)}>
							<div class="warning-container" style="display: flex; flex-direction: column; gap: 2px;">
								{#if liveTask?.warning}
									<span>{liveTask.warning}</span>
								{/if}
								{#if liveTask?.req}
									<span>{liveTask.req}</span>
								{/if}
							</div>
						</td>

						<RowStatus
							completed={isDone}
							onToggle={() => tracker.toggleComplete(section.id, task.id)}
							ariaLabel={`${isDone ? 'Mark task incomplete' : 'Mark task complete'}: ${task.name}`}
						/>
					</tr>
				{/if}
			{/each}
		{/if}
	{/if}
{/each}
