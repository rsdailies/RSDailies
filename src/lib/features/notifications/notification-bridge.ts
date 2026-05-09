import { getSettings as getHostedSettings } from '../settings/settings-service.ts';
import {
	getTaskNextReset as getHostedTaskNextReset,
	maybeBrowserNotify as hostedMaybeBrowserNotify,
	maybeWebhookNotify as hostedMaybeWebhookNotify,
} from '../../logic/notifications.ts';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;
type RemoveFn = (key: string) => void;

export function maybeBrowserNotify(title: string, body: string) {
	return hostedMaybeBrowserNotify(title, body, getHostedSettings());
}

export async function maybeWebhookNotify(taskName: string) {
	return hostedMaybeWebhookNotify(taskName, getHostedSettings());
}

export function getTaskAlertConfig(task: any) {
	const days = Number.isFinite(task?.alertDaysBeforeReset) ? Math.max(0, task.alertDaysBeforeReset) : 0;
	return { alertDaysBeforeReset: days };
}

export function getTaskNextReset(task: any) {
	return getHostedTaskNextReset(String(task?.reset || ''));
}

export function getTaskAlertTarget(task: any) {
	const nextReset = getTaskNextReset(task);
	const { alertDaysBeforeReset } = getTaskAlertConfig(task);
	return new Date(nextReset.getTime() - alertDaysBeforeReset * 86400000);
}

export function maybeNotifyTaskAlert(
	task: any,
	sectionKey: string,
	{ load, save }: { load: LoadFn; save: SaveFn }
) {
	if (!task?.reset) return;

	const target = getTaskAlertTarget(task);
	if (Date.now() < target.getTime()) return;

	const notified = load(`notified:${sectionKey}`, {});
	const stamp = target.toISOString();

	if (notified[task.id] === stamp) return;

	maybeBrowserNotify('RSDailies', `${task.name} is due.`);
	maybeWebhookNotify(task.name);

	notified[task.id] = stamp;
	save(`notified:${sectionKey}`, notified);
}

export function cleanupTaskNotificationsForReset(
	sectionKey: string,
	{ removeKey }: { removeKey?: RemoveFn } = {}
) {
	removeKey?.(`notified:${sectionKey}`);
}
