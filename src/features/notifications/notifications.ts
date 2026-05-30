import type { Settings } from '@features/settings/settings-defaults.ts';
import { nextDailyBoundary, nextMonthlyBoundary, nextWeeklyBoundary } from '@shared/time/boundaries';
import { APP_DEFAULT_WEBHOOK_MESSAGE } from '../../shared/app-meta.js';

export function maybeBrowserNotify(title: string, body: string, settings: Settings) {
	if (typeof window === 'undefined') return;
	if (!settings.browserNotif) return;
	if (!('Notification' in window)) return;
	if (Notification.permission !== 'granted') return;

	try {
		new Notification(title, { body });
	} catch {
		// noop
	}
}

export function applyWebhookTemplate(template: string, taskName: string) {
	const safeTemplate = String(template || APP_DEFAULT_WEBHOOK_MESSAGE);
	const safeTaskName = String(taskName || 'Task');
	return safeTemplate.replace(/\{task\}/g, safeTaskName);
}

export async function maybeWebhookNotify(taskName: string, settings: Settings) {
	if (!settings.webhookUrl) return;

	const mention = settings.webhookUserId ? `<@${settings.webhookUserId}> ` : '';
	const content = `${mention}${applyWebhookTemplate(settings.webhookMessageTemplate, taskName)}`.trim();

	try {
		await fetch(settings.webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content }),
		});
	} catch {
		// noop
	}
}

export function getTaskNextReset(cadence: string) {
	const normalized = String(cadence || '').toLowerCase();
	if (normalized === 'weekly') return nextWeeklyBoundary();
	if (normalized === 'monthly') return nextMonthlyBoundary();
	return nextDailyBoundary();
}
