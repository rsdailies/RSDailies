import {
	getSettings as getHostedSettings,
	normalizeSettings,
	saveSettings as saveHostedSettings,
	type Settings,
} from '../features/settings/settings-service.ts';
import { replaceInteractiveElement, setPanelOpenState } from '../ui/dom-controls.ts';
import { bindFloatingPanelTrigger } from '../ui/panel-controls.ts';
import { getSettingsFieldIds } from '../ui/settings-fields.ts';

export function applySettingsToDom(documentRef = document, settings: Settings = getHostedSettings()) {
	const fieldIds = getSettingsFieldIds();
	const splitDaily = documentRef.getElementById(fieldIds.splitDailyTables) as HTMLInputElement | null;
	const splitWeekly = documentRef.getElementById(fieldIds.splitWeeklyTables) as HTMLInputElement | null;
	const showCompleted = documentRef.getElementById(fieldIds.showCompletedTasks) as HTMLInputElement | null;
	const herbs3 = documentRef.getElementById(fieldIds.herbTicks) as HTMLInputElement | null;
	const growthOffset = documentRef.getElementById(fieldIds.growthOffset) as HTMLInputElement | null;
	const browserNotif = documentRef.getElementById(fieldIds.browserNotif) as HTMLInputElement | null;
	const webhook = documentRef.getElementById(fieldIds.webhookUrl) as HTMLInputElement | null;
	const webhookUserId = documentRef.getElementById(fieldIds.webhookUserId) as HTMLInputElement | null;
	const webhookTemplate = documentRef.getElementById(fieldIds.webhookMessageTemplate) as HTMLInputElement | null;

	if (splitDaily) splitDaily.checked = settings.splitDailyTables !== false;
	if (splitWeekly) splitWeekly.checked = settings.splitWeeklyTables !== false;
	if (showCompleted) showCompleted.checked = settings.showCompletedTasks === true || settings.showCompletedTasks === 'true';
	if (herbs3) herbs3.checked = settings.herbTicks === 3;
	if (browserNotif) browserNotif.checked = !!settings.browserNotif;
	if (webhook) webhook.value = settings.webhookUrl || '';
	if (webhookUserId) webhookUserId.value = settings.webhookUserId || '';
	if (webhookTemplate) webhookTemplate.value = settings.webhookMessageTemplate || 'RSDailies: {task} is due.';

	if (growthOffset) {
		growthOffset.value = String(settings.growthOffsetMinutes || 0);
		const settingsBlock = growthOffset.closest('.settings-block') as HTMLElement | null;
		if (settingsBlock) {
			settingsBlock.style.display = 'none';
			settingsBlock.style.visibility = 'hidden';
		}
	}
}

export function collectSettingsFromDom(documentRef = document) {
	const fieldIds = getSettingsFieldIds();
	const herbTicks = (documentRef.getElementById(fieldIds.herbTicks) as HTMLInputElement | null)?.checked ? 3 : 4;

	return normalizeSettings({
		splitDailyTables: !!(documentRef.getElementById(fieldIds.splitDailyTables) as HTMLInputElement | null)?.checked,
		splitWeeklyTables: !!(documentRef.getElementById(fieldIds.splitWeeklyTables) as HTMLInputElement | null)?.checked,
		showCompletedTasks: !!(documentRef.getElementById(fieldIds.showCompletedTasks) as HTMLInputElement | null)?.checked,
		herbTicks,
		browserNotif: !!(documentRef.getElementById(fieldIds.browserNotif) as HTMLInputElement | null)?.checked,
		webhookUrl: ((documentRef.getElementById(fieldIds.webhookUrl) as HTMLInputElement | null)?.value || '').trim(),
		webhookUserId: ((documentRef.getElementById(fieldIds.webhookUserId) as HTMLInputElement | null)?.value || '').trim(),
		webhookMessageTemplate: ((documentRef.getElementById(fieldIds.webhookMessageTemplate) as HTMLInputElement | null)?.value || '').trim(),
		overviewVisible: true,
	});
}

export function getSettings() {
	return getHostedSettings();
}

export function saveSettings(settings: Partial<Settings>) {
	return saveHostedSettings(settings);
}

export function setupSettingsControl({
	renderApp = () => {},
	closeFloatingControls = () => {},
	documentRef = document,
} = {}) {
	const button = replaceInteractiveElement(documentRef.getElementById('settings-button'));
	const panel = documentRef.getElementById('settings-control');
	const saveBtn = replaceInteractiveElement(documentRef.getElementById('save-settings-btn'));

	if (!button || !panel || !saveBtn) return;

	applySettingsToDom(documentRef, getSettings());

	bindFloatingPanelTrigger({
		button,
		panel,
		closePanels: closeFloatingControls,
		onOpen: () => {
			setPanelOpenState(panel, true);
		},
	});

	saveBtn.addEventListener('click', async (event) => {
		event.preventDefault();
		event.stopPropagation();

		const settings = collectSettingsFromDom(documentRef);
		saveSettings(settings);

		if (settings.browserNotif && 'Notification' in window && Notification.permission === 'default') {
			try {
				await Notification.requestPermission();
			} catch {
				// noop
			}
		}

		setPanelOpenState(panel, false);
		renderApp();
	});
}
