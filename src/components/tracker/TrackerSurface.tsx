import React, { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { TRACKER_SECTIONS } from '../../lib/domain/static-content';
import {
	type OverviewTask,
	type TrackerPage,
	type TrackerSection,
	type TrackerTask,
	type TimerDefinition,
	type TimerGroup,
	getTrackerSectionsForPage,
	normalizeTrackerView,
	resolveOverviewModel,
} from '../../lib/domain/tracker-content';
import { removeCustomTask, upsertCustomTask } from '../../lib/features/custom-tasks/custom-task-service';
import { getSettings } from '../../lib/features/settings/settings-service';
import { clearTimer, getTimers, startTimer, TIMER_SECTION_KEY } from '../../lib/features/timers/timer-service';
import { resetSectionView } from '../../lib/logic/reset-orchestrator';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '../../lib/shared/time/boundaries';
import { formatDurationMs } from '../../lib/shared/time/formatters';
import { StorageKeyBuilder } from '../../lib/shared/storage/keys-builder';
import { STORAGE_EVENT_NAME } from '../../lib/shared/storage/namespace';
import * as StorageService from '../../lib/shared/storage/storage-service';

interface TrackerSurfaceProps {
	page: TrackerPage;
	pages: TrackerPage[];
	sections: TrackerSection[];
	currentGame: 'rs3' | 'osrs';
}

interface SectionState {
	completed: Record<string, boolean>;
	hiddenRows: Record<string, boolean>;
	removedRows: Record<string, boolean>;
	hidden: boolean;
	showHidden: boolean;
}

interface ViewItem {
	label: string;
	href: string;
}

interface ViewGroup {
	heading: string;
	items: ViewItem[];
}

function readSectionState(sectionId: string): SectionState {
	return {
		completed: StorageService.load(StorageKeyBuilder.sectionCompletion(sectionId), {}),
		hiddenRows: StorageService.load(StorageKeyBuilder.sectionHiddenRows(sectionId), {}),
		removedRows: StorageService.load(StorageKeyBuilder.sectionRemovedRows(sectionId), {}),
		hidden: !!StorageService.load(StorageKeyBuilder.sectionHidden(sectionId), false),
		showHidden: !!StorageService.load(StorageKeyBuilder.sectionShowHidden(sectionId), false),
	};
}

function useRefreshSignal() {
	const [value, setValue] = useState(0);

	useEffect(() => {
		const bump = () => setValue((current) => current + 1);
		window.addEventListener(STORAGE_EVENT_NAME, bump as EventListener);
		window.addEventListener('rsdailies:heartbeat', bump as EventListener);
		window.addEventListener('rsdailies:reset', bump as EventListener);

		return () => {
			window.removeEventListener(STORAGE_EVENT_NAME, bump as EventListener);
			window.removeEventListener('rsdailies:heartbeat', bump as EventListener);
			window.removeEventListener('rsdailies:reset', bump as EventListener);
		};
	}, []);

	return value;
}

function taskHref(route: string, view?: string) {
	return view ? `${route}?view=${encodeURIComponent(view)}` : route;
}

function getViewGroups(game: 'rs3' | 'osrs'): ViewGroup[] {
	const overviewRoute = `/${game}/overview`;
	const tasksRoute = `/${game}/tasks`;
	const groups: ViewGroup[] = [
		{
			heading: 'Views',
			items: [
				{ label: 'Overview', href: overviewRoute },
				{ label: 'Tasks', href: taskHref(tasksRoute, 'all') },
				{ label: 'Dailies', href: taskHref(tasksRoute, 'daily') },
				{ label: 'Weeklies', href: taskHref(tasksRoute, 'weekly') },
				{ label: 'Monthlies', href: taskHref(tasksRoute, 'monthly') },
			],
		},
	];

	if (game === 'rs3') {
		groups.push({
			heading: 'Gathering',
			items: [
				{ label: 'Daily Gathering', href: taskHref('/rs3/gathering', 'daily') },
				{ label: 'Weekly Gathering', href: taskHref('/rs3/gathering', 'weekly') },
			],
		});
		groups.push({
			heading: 'Timers',
			items: [{ label: 'Farming', href: '/rs3/timers' }],
		});
	}

	return groups;
}

function getCountdownTarget(section: TrackerSection) {
	const cadence = String(section.resetFrequency || '').toLowerCase();
	if (cadence === 'weekly') return nextWeeklyBoundary();
	if (cadence === 'monthly') return nextMonthlyBoundary();
	if (cadence === 'daily') return nextDailyBoundary();
	return null;
}

function isVisibleTask(taskId: string, sectionState: SectionState, showCompletedTasks: boolean) {
	if (sectionState.removedRows[taskId]) return false;
	if (sectionState.hiddenRows[taskId] && !sectionState.showHidden) return false;
	if (sectionState.completed[taskId] && !showCompletedTasks) return false;
	return true;
}

function getPinState(sectionId: string, taskId: string) {
	const pins = StorageService.load<Record<string, boolean | number>>(StorageKeyBuilder.overviewPins(), {});
	return !!pins[StorageKeyBuilder.overviewPinStorageId(sectionId, taskId)];
}

function toggleCompleted(sectionId: string, taskId: string, nextValue?: boolean) {
	const completed = {
		...StorageService.load<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(sectionId), {}),
	};

	const target = typeof nextValue === 'boolean' ? nextValue : !completed[taskId];
	if (target) {
		completed[taskId] = true;
	} else {
		delete completed[taskId];
	}

	StorageService.save(StorageKeyBuilder.sectionCompletion(sectionId), completed);
}

function togglePinned(sectionId: string, taskId: string) {
	const pins = {
		...StorageService.load<Record<string, boolean | number>>(StorageKeyBuilder.overviewPins(), {}),
	};
	const storageId = StorageKeyBuilder.overviewPinStorageId(sectionId, taskId);

	if (pins[storageId]) {
		delete pins[storageId];
	} else {
		pins[storageId] = Date.now();
	}

	StorageService.save(StorageKeyBuilder.overviewPins(), pins);
}

function toggleHiddenRow(sectionId: string, taskId: string) {
	const hiddenRows = {
		...StorageService.load<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(sectionId), {}),
	};

	if (hiddenRows[taskId]) {
		delete hiddenRows[taskId];
	} else {
		hiddenRows[taskId] = true;
	}

	StorageService.save(StorageKeyBuilder.sectionHiddenRows(sectionId), hiddenRows);
}

function toggleSectionCollapsed(sectionId: string) {
	const current = !!StorageService.load(StorageKeyBuilder.sectionHidden(sectionId), false);
	StorageService.save(StorageKeyBuilder.sectionHidden(sectionId), !current);
}

function toggleSectionShowHidden(sectionId: string) {
	const current = !!StorageService.load(StorageKeyBuilder.sectionShowHidden(sectionId), false);
	StorageService.save(StorageKeyBuilder.sectionShowHidden(sectionId), !current);
}

function renderTaskRows(
	sectionId: string,
	task: TrackerTask,
	sectionState: SectionState,
	showCompletedTasks: boolean,
	indent = false,
	allowPin = true
): React.ReactNode {
	if (!isVisibleTask(task.id, sectionState, showCompletedTasks)) {
		return null;
	}

	const completed = !!sectionState.completed[task.id];
	const pinned = allowPin ? getPinState(sectionId, task.id) : false;

	return (
		<React.Fragment key={`${sectionId}:${task.id}`}>
			<tr data-task-id={task.id} data-completed={completed ? 'true' : 'false'} className={indent ? 'overview-row-compact' : ''}>
				<td className="activity_name">
					<div className="d-flex align-items-center gap-2">
						<input
							aria-label={`Toggle ${task.name}`}
							type="checkbox"
							checked={completed}
							onChange={() => toggleCompleted(sectionId, task.id)}
						/>
						<a href={task.wiki || '#'} target="_blank" rel="noreferrer noopener">
							{task.name}
						</a>
					</div>
				</td>
				<td className="activity_notes">
					<span className="activity_desc">{task.note || '\u00A0'}</span>
				</td>
				<td className="activity_status text-end">
					<div className="d-inline-flex gap-1">
						{allowPin ? (
							<button type="button" className="btn btn-secondary btn-sm" onClick={() => togglePinned(sectionId, task.id)}>
								{pinned ? '★' : '☆'}
							</button>
						) : null}
						<button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleHiddenRow(sectionId, task.id)}>
							{sectionState.hiddenRows[task.id] ? 'Restore' : 'Hide'}
						</button>
					</div>
				</td>
			</tr>
			{(task.children || task.childRows || []).map((child) =>
				renderTaskRows(sectionId, child, sectionState, showCompletedTasks, true, allowPin)
			)}
		</React.Fragment>
	);
}

function OverviewHeader({ game }: { game: 'rs3' | 'osrs' }) {
	const [open, setOpen] = useState(false);
	const groups = useMemo(() => getViewGroups(game), [game]);

	return (
		<div className="overview_header">
			<div className="overview_title">Overview</div>
			<div className="overview_actions">
				<button
					id="views-button-panel"
					type="button"
					className="btn btn-secondary btn-sm expanding_button active"
					title="Views"
					aria-label="Open page views"
					onClick={() => setOpen((current) => !current)}
				>
					&#9776;<span className="expanding_text">&nbsp;Views</span>
				</button>
			</div>

			<div
				id="views-control"
				style={{ display: open ? 'block' : 'none', visibility: open ? 'visible' : 'hidden' }}
				data-display={open ? 'block' : 'none'}
			>
				<strong>Views</strong>
				<ul id="views-list" className="list-unstyled mb-0">
					{groups.flatMap((group) => [
						<li key={`${group.heading}-heading`} className="profile-row" style={{ fontWeight: 700, opacity: 0.9, paddingTop: '6px' }}>
							{group.heading}
						</li>,
						...group.items.map((item) => (
							<li key={item.href} className="profile-row">
								<a href={item.href} className="profile-link">
									{item.label}
								</a>
							</li>
						)),
					])}
				</ul>
			</div>
		</div>
	);
}

function OverviewPreview({ tasks, compact }: { tasks: OverviewTask[]; compact: boolean }) {
	if (tasks.length === 0) {
		return <div className="overview-empty-message">Pin any task with the star icon to surface it here.</div>;
	}

	const items = compact ? tasks.slice(0, 5) : tasks;

	return (
		<div className={compact ? 'overview-card overview-card-compact' : 'overview-card overview-card-full'}>
			<table className="table table-dark table-hover rs3-table mb-0">
				<tbody>
					{items.map((entry) => (
						<tr key={entry.storageId} className={compact ? 'overview-row overview-row-compact' : 'overview-row'}>
							<td className="activity_name">
								{entry.task.name}
								{compact ? <span className="overview-section-badge">{entry.sectionId}</span> : null}
							</td>
							<td className="activity_notes">
								<span className="activity_desc">{entry.task.note || '\u00A0'}</span>
							</td>
							<td className="activity_status text-end">
								<button type="button" className="btn btn-secondary btn-sm" onClick={() => togglePinned(entry.sectionId, entry.taskId)}>
									Unpin
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function OverviewSurface({ currentGame }: { currentGame: 'rs3' | 'osrs' }) {
	const refreshSignal = useRefreshSignal();
	const [formState, setFormState] = useState({
		id: '',
		name: '',
		note: '',
		reset: 'daily',
	});
	void refreshSignal;

	const overview = resolveOverviewModel(currentGame, StorageService.getActiveProfile(), TRACKER_SECTIONS as TrackerSection[]);
	const customSectionState = readSectionState('custom');

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		upsertCustomTask({
			id: formState.id || undefined,
			name: formState.name,
			note: formState.note,
			reset: formState.reset as 'daily' | 'weekly' | 'monthly' | 'never',
			game: currentGame,
		});
		setFormState({ id: '', name: '', note: '', reset: 'daily' });
	}

	return (
		<div className="container-xl py-4">
			<OverviewHeader game={currentGame} />
			<div id="overview-content" className="overview_content">
				<div className="overview-shell">
					<div className="overview-note">Will pin all in main page for visual. Only top 5 will preview on other pages.</div>
					<div className="overview-divider"></div>
					<OverviewPreview tasks={overview.pinnedTasks} compact={false} />
				</div>

				<div className="table_container mt-4" id="custom-overview-container">
					<table className="activity_table tracker-table">
						<thead>
							<tr className="header_like_row">
								<td colSpan={3} className="header_like_color">
									<div className="header_like_inner section-panel-header">
										<div className="activity_name header_like_name section-panel-title">
											<span className="header_like_text">Custom Tasks</span>
										</div>
									</div>
								</td>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={3}>
									<form className="row g-2" onSubmit={handleSubmit}>
										<div className="col-12 col-lg-4">
											<input
												className="form-control"
												placeholder="Task name"
												value={formState.name}
												onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
											/>
										</div>
										<div className="col-12 col-lg-5">
											<input
												className="form-control"
												placeholder="Note"
												value={formState.note}
												onChange={(event) => setFormState((current) => ({ ...current, note: event.target.value }))}
											/>
										</div>
										<div className="col-8 col-lg-2">
											<select
												className="form-select"
												value={formState.reset}
												onChange={(event) => setFormState((current) => ({ ...current, reset: event.target.value }))}
											>
												<option value="daily">Daily</option>
												<option value="weekly">Weekly</option>
												<option value="monthly">Monthly</option>
												<option value="never">Never</option>
											</select>
										</div>
										<div className="col-4 col-lg-1">
											<button type="submit" className="btn btn-primary w-100">{formState.id ? 'Save' : '+'}</button>
										</div>
									</form>
								</td>
							</tr>
							{overview.customTasks.map((task) => (
								<tr key={task.id}>
									<td className="activity_name">
										<div className="d-flex align-items-center gap-2">
											<input type="checkbox" checked={!!customSectionState.completed[task.id]} onChange={() => toggleCompleted('custom', task.id)} />
											<span>{task.name}</span>
										</div>
									</td>
									<td className="activity_notes">
										<span className="activity_desc">{task.note || '\u00A0'}</span>
									</td>
									<td className="activity_status text-end">
										<div className="d-inline-flex gap-1">
											<button
												type="button"
												className="btn btn-secondary btn-sm"
												onClick={() => setFormState({ id: task.id, name: task.name, note: task.note || '', reset: task.reset || 'daily' })}
											>
												Edit
											</button>
											<button type="button" className="btn btn-secondary btn-sm" onClick={() => togglePinned('custom', task.id)}>
												{getPinState('custom', task.id) ? '★' : '☆'}
											</button>
											<button type="button" className="btn btn-danger btn-sm" onClick={() => removeCustomTask(task.id)}>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function StandardSection({ section, showCompletedTasks }: { section: TrackerSection; showCompletedTasks: boolean }) {
	const sectionState = readSectionState(section.id);
	const countdownTarget = section.shell?.showCountdown === false ? null : getCountdownTarget(section);
	const hiddenCount = Object.keys(sectionState.hiddenRows).length;

	return (
		<div className="col-12 mb-4 table_container" id={section.containerId || `${section.id}-container`}>
			<table className="activity_table tracker-table" id={section.tableId || `${section.id}-table`}>
				<thead>
					<tr className="header_like_row">
						<td colSpan={3} className="header_like_color">
							<div className="header_like_inner section-panel-header">
								<div className="activity_name header_like_name section-panel-title">
									<span className="header_like_text">{section.label}</span>
								</div>
								<div className="header_like_controls section-panel-controls d-flex gap-2 align-items-center">
									{countdownTarget ? <span className="header_like_status countdown badge bg-secondary">{formatDurationMs(countdownTarget.getTime() - Date.now())}</span> : null}
									{hiddenCount > 0 ? (
										<button type="button" className="btn btn-secondary btn-sm active primitive-btn" onClick={() => toggleSectionShowHidden(section.id)}>
											{sectionState.showHidden ? 'Hide Restored' : `Show Hidden (${hiddenCount})`}
										</button>
									) : null}
									<button
										type="button"
										className="btn btn-secondary btn-sm active primitive-btn"
										onClick={() => resetSectionView(section.id, { load: StorageService.load, save: StorageService.save, removeKey: StorageService.remove })}
									>
										↻
									</button>
									<button type="button" className="btn btn-secondary btn-sm active primitive-btn" onClick={() => toggleSectionCollapsed(section.id)}>
										{sectionState.hidden ? '▶' : '▼'}
									</button>
								</div>
							</div>
						</td>
					</tr>
				</thead>
				{!sectionState.hidden ? (
					<tbody>
						{section.items.map((task) => renderTaskRows(section.id, task, sectionState, showCompletedTasks))}
					</tbody>
				) : null}
			</table>
		</div>
	);
}

function TimerSection({ section, showCompletedTasks, now }: { section: TrackerSection; showCompletedTasks: boolean; now: number }) {
	const sectionState = readSectionState(section.id);

	return (
		<div className="col-12 mb-4 table_container" id={section.containerId || `${section.id}-container`}>
			<table className="activity_table tracker-table" id={section.tableId || `${section.id}-table`}>
				<thead>
					<tr className="header_like_row">
						<td colSpan={3} className="header_like_color">
							<div className="header_like_inner section-panel-header">
								<div className="activity_name header_like_name section-panel-title">
									<span className="header_like_text">{section.label}</span>
								</div>
								<div className="header_like_controls section-panel-controls d-flex gap-2 align-items-center">
									<button
										type="button"
										className="btn btn-secondary btn-sm active primitive-btn"
										onClick={() => resetSectionView(section.id, { load: StorageService.load, save: StorageService.save, removeKey: StorageService.remove })}
									>
										↻
									</button>
									<button type="button" className="btn btn-secondary btn-sm active primitive-btn" onClick={() => toggleSectionCollapsed(section.id)}>
										{sectionState.hidden ? '▶' : '▼'}
									</button>
								</div>
							</div>
						</td>
					</tr>
				</thead>
				{!sectionState.hidden ? (
					<tbody>
						{(section.groups || []).map((group: TimerGroup) => (
							<React.Fragment key={group.id}>
								<tr className="table-secondary">
									<td colSpan={3}>
										<strong>{group.label}</strong>
										{group.note ? <span className="small text-muted ms-2">{group.note}</span> : null}
									</td>
								</tr>
								{(group.timers || []).map((timer: TimerDefinition) => {
									const activeTimer = getTimers()[timer.id];
									const remaining = activeTimer ? activeTimer.readyAt - now : 0;
									const ready = !!activeTimer && remaining <= 0;
									const plotRows = (group.plots || []).length > 0 ? group.plots || [] : timer.plots || [];

									return (
										<React.Fragment key={timer.id}>
											<tr data-timer-id={timer.id}>
												<td className="activity_name">
													<a href={timer.wiki || '#'} target="_blank" rel="noreferrer noopener">{timer.name}</a>
												</td>
												<td className="activity_notes">
													<span className="activity_desc">
														{activeTimer ? (ready ? 'READY' : `Ready in ${formatDurationMs(remaining)}`) : (timer.note || 'Not started')}
													</span>
												</td>
												<td className="activity_status text-end">
													{activeTimer ? (
														<button type="button" className="btn btn-danger btn-sm" onClick={() => clearTimer(timer.id)}>Clear</button>
													) : (
														<button type="button" className="btn btn-primary btn-sm" onClick={() => startTimer(timer)}>Start</button>
													)}
												</td>
											</tr>
											{plotRows.map((plot) =>
												renderTaskRows(TIMER_SECTION_KEY, { ...plot, id: `${timer.id}::${plot.id}` }, sectionState, showCompletedTasks, true, false)
											)}
										</React.Fragment>
									);
								})}
							</React.Fragment>
						))}
					</tbody>
				) : null}
			</table>
		</div>
	);
}

export function TrackerSurface({ page, pages, sections, currentGame }: TrackerSurfaceProps) {
	const refreshSignal = useRefreshSignal();
	const [currentView, setCurrentView] = useState('');
	const [now, setNow] = useState(Date.now());
	void pages;

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setCurrentView(normalizeTrackerView(page, params.get('view')));
	}, [page]);

	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const settings = getSettings();
	const overview = resolveOverviewModel(currentGame, StorageService.getActiveProfile(), TRACKER_SECTIONS as TrackerSection[]);
	const resolvedSections = getTrackerSectionsForPage(currentGame, page.id, currentView, sections.length ? pages : pages, sections);
	void refreshSignal;

	if (page.layout === 'overview') {
		return <OverviewSurface currentGame={currentGame} />;
	}

	return (
		<div className="container-xl py-4">
			<OverviewHeader game={currentGame} />
			<div id="overview-content" className="overview_content mb-4">
				<div className="overview-shell">
					<div className="overview-note">Will pin all in main page for visual. Only top 5 will preview on other pages.</div>
					<div className="overview-divider"></div>
					<OverviewPreview tasks={overview.pinnedTasks} compact />
				</div>
			</div>
			<div className="row">
				{resolvedSections.map((section) =>
					section.renderVariant === 'timer-groups' ? (
						<TimerSection key={section.id} section={section} showCompletedTasks={settings.showCompletedTasks} now={now} />
					) : (
						<StandardSection key={section.id} section={section} showCompletedTasks={settings.showCompletedTasks} />
					)
				)}
			</div>
		</div>
	);
}

export default TrackerSurface;
