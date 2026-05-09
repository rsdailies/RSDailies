import { appendRows, centeredHeaderLabel, markLastVisibleRow } from './section-common.ts';
import { renderUnifiedSection } from './section-engine.ts';
import { buildRestoreEntries, resetTaskList, restoreHiddenRow } from './section-storage.ts';

export function renderStandardSection(tbody: HTMLElement, sectionKey: string, tasks: any[], { createRow, context }: any) {
	if (!tbody) return;

	const rows: HTMLElement[] = [];
	tasks.forEach((task) => {
		const row = createRow(sectionKey, task, {
			isCustom: sectionKey === 'custom',
			context,
		});
		if (row) rows.push(row);
	});

	markLastVisibleRow(rows);
	appendRows(tbody, rows);
}

export function renderWeekliesWithChildren(
	tbody: HTMLElement,
	tasks: any[],
	{ isCollapsedBlock, createHeaderRow, createRow, context }: any
) {
	if (!tbody) return;

	let penguinTask: any = null;
	const normalTasks: any[] = [];

	tasks.forEach((task) => {
		if (task.id === 'penguins') {
			penguinTask = task;
			return;
		}
		normalTasks.push(task);
	});

	const blocks: any[] = [
		{
			id: 'weekly-standard',
			kind: 'rows',
			tasks: normalTasks,
		},
	];

	if (penguinTask && Array.isArray(penguinTask.children) && penguinTask.children.length > 0) {
		const blockId = `row-collapse-${penguinTask.id}`;
		const restoreOptions = buildRestoreEntries(
			'rs3weekly',
			penguinTask.children.map((child: any) => child.id),
			context
		);

		blocks.push({
			id: blockId,
			kind: 'subgroup',
			title: centeredHeaderLabel(penguinTask.name),
			tasks: penguinTask.children.map((child: any) => ({ ...child, wiki: child.wiki || penguinTask.wiki || '' })),
			headerMode: 'attached',
			onResetClick: () => resetTaskList('rs3weekly', penguinTask.children, context),
			restoreOptions,
			onRestoreSelect: (taskId: string) => restoreHiddenRow('rs3weekly', taskId, context),
		});
	}

	renderUnifiedSection(tbody, blocks, {
		sectionKey: 'rs3weekly',
		createRow,
		createHeaderRow,
		isCollapsedBlock,
		context,
	});
}

export function renderGroupedGathering(
	tbody: HTMLElement,
	tasks: any[],
	{ isCollapsedBlock, createHeaderRow, createRow, context, getGroupCountdown }: any
) {
	if (!tbody) return;

	const grouped = new Map<string, any[]>();

	tasks
		.filter((task) => task.id !== 'herb-run-reminder')
		.forEach((task) => {
			const groupName = task.group || (task.reset === 'weekly' ? 'Weekly' : 'General');
			if (!grouped.has(groupName)) grouped.set(groupName, []);
			grouped.get(groupName)?.push(task);
		});

	const blocks = [...grouped.entries()].map(([groupName, groupTasks]) => {
		const blockId = `group-collapse-gathering-${groupName}`;
		const restoreOptions = buildRestoreEntries(
			'gathering',
			groupTasks.map((task) => task.id),
			context
		);

		return {
			id: blockId,
			kind: 'subgroup',
			title: centeredHeaderLabel(groupName),
			tasks: groupTasks,
			headerMode: 'default',
			rightText: getGroupCountdown?.(groupName) || '',
			onResetClick: () => resetTaskList('gathering', groupTasks, context),
			restoreOptions,
			onRestoreSelect: (taskId: string) => restoreHiddenRow('gathering', taskId, context),
		};
	});

	renderUnifiedSection(tbody, blocks, {
		sectionKey: 'gathering',
		createRow,
		createHeaderRow,
		isCollapsedBlock,
		context,
	});
}
