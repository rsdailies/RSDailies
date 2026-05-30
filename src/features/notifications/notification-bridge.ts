import { APP_NOTIFICATION_TITLE } from '../../shared/app-meta.js';
import { getSettings as getHostedSettings } from '../settings/settings-service.ts';
import {
	getTaskNextReset as getHostedTaskNextReset,
	maybeBrowserNotify as hostedMaybeBrowserNotify,
	maybeWebhookNotify as hostedMaybeWebhookNotify,
} from './notifications.ts';

type LoadFn = <T>(key: string, fallback: T) => T;
type SaveFn = (key: string, value: unknown) => void;
type RemoveFn = (key: string) => void;
type AlertTask = {
	id?: string;
	name?: string;
	reset?: string;
	alertDaysBeforeReset?: number;
};

export function maybeBrowserNotify(title: string, body: string) {
	return hostedMaybeBrowserNotify(title, body, getHostedSettings());
}

export async function maybeWebhookNotify(taskName: string) {
	return hostedMaybeWebhookNotify(taskName, getHostedSettings());
}

export function getTaskAlertConfig(task: AlertTask) {
	const days = Number.isFinite(task?.alertDaysBeforeReset) ? Math.max(0, Number(task.alertDaysBeforeReset)) : 0;
	return { alertDaysBeforeReset: days };
}

export function getTaskNextReset(task: AlertTask) {
	return getHostedTaskNextReset(String(task?.reset || ''));
}

export function getTaskAlertTarget(task: AlertTask) {
	const nextReset = getTaskNextReset(task);
	const { alertDaysBeforeReset } = getTaskAlertConfig(task);
	return new Date(nextReset.getTime() - alertDaysBeforeReset * 86400000);
}

export function maybeNotifyTaskAlert(
	task: AlertTask,
	sectionKey: string,
	{ load, save }: { load: LoadFn; save: SaveFn },
) {
	if (!task?.reset) return;

	const target = getTaskAlertTarget(task);
	if (Date.now() < target.getTime()) return;

	const notified: Record<string, string> = load(`notified:${sectionKey}`, {});
	const stamp = target.toISOString();
	const taskIdKey = String(task.id);

	if (notified[taskIdKey] === stamp) return;

	maybeBrowserNotify(APP_NOTIFICATION_TITLE, `${task.name} is due.`);
	maybeWebhookNotify(task.name || 'Task');

	notified[taskIdKey] = stamp;
	save(`notified:${sectionKey}`, notified);
}

export function cleanupTaskNotificationsForReset(sectionKey: string, { removeKey }: { removeKey?: RemoveFn } = {}) {
	removeKey?.(`notified:${sectionKey}`);
}
