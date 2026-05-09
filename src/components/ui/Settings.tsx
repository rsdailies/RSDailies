import React, { useEffect, useState } from 'react';

import type { Settings as SettingsShape } from '../../lib/features/settings/settings-defaults';
import { getSettings, resetSettings, saveSettings } from '../../lib/features/settings/settings-service';

export const Settings: React.FC = () => {
	const [settings, setSettings] = useState<SettingsShape>(getSettings());

	useEffect(() => {
		setSettings(getSettings());
	}, []);

	function update<K extends keyof SettingsShape>(key: K, value: SettingsShape[K]) {
		setSettings((current) => ({
			...current,
			[key]: value,
		}));
	}

	const handleSave = () => {
		saveSettings(settings);
		window.location.reload();
	};

	const handleReset = () => {
		setSettings(resetSettings());
	};

	return (
		<div id="settings-control" style={{ display: 'none' }} data-display="none">
			<strong>Settings</strong>

			<div className="form-check">
				<input
					className="form-check-input"
					type="checkbox"
					id="setting-split-daily-tables"
					checked={settings.splitDailyTables}
					onChange={() => update('splitDailyTables', !settings.splitDailyTables)}
				/>
				<label className="form-check-label" htmlFor="setting-split-daily-tables">
					Split Dailies and Gathering
				</label>
			</div>

			<div className="form-check">
				<input
					className="form-check-input"
					type="checkbox"
					id="setting-split-weekly-tables"
					checked={settings.splitWeeklyTables}
					onChange={() => update('splitWeeklyTables', !settings.splitWeeklyTables)}
				/>
				<label className="form-check-label" htmlFor="setting-split-weekly-tables">
					Split Weeklies inside Gathering
				</label>
			</div>

			<div className="form-check">
				<input
					className="form-check-input"
					type="checkbox"
					id="setting-show-completed"
					checked={settings.showCompletedTasks}
					onChange={() => update('showCompletedTasks', !settings.showCompletedTasks)}
				/>
				<label className="form-check-label" htmlFor="setting-show-completed">
					Show Completed Tasks
				</label>
			</div>

			<div className="form-check">
				<input
					className="form-check-input"
					type="checkbox"
					id="setting-3tick-herbs"
					checked={settings.herbTicks === 3}
					onChange={() => update('herbTicks', settings.herbTicks === 3 ? 4 : 3)}
				/>
				<label className="form-check-label" htmlFor="setting-3tick-herbs">
					Speedy Growth Upgrade
				</label>
			</div>

			<div className="form-check settings-block">
				<input
					className="form-check-input"
					type="checkbox"
					id="setting-browser-notif"
					checked={settings.browserNotif}
					onChange={() => update('browserNotif', !settings.browserNotif)}
				/>
				<label className="form-check-label" htmlFor="setting-browser-notif">
					Browser notifications on reset / ready timers
				</label>
			</div>

			<div className="form-group settings-block">
				<label htmlFor="setting-webhook-url">Discord Webhook URL (optional)</label>
				<input
					type="text"
					className="form-control"
					id="setting-webhook-url"
					placeholder="https://discord.com/api/webhooks/..."
					value={settings.webhookUrl || ''}
					onChange={(event) => update('webhookUrl', event.target.value)}
				/>
			</div>

			<div className="form-group settings-block">
				<label htmlFor="setting-webhook-user-id">Discord User ID to mention (optional)</label>
				<input
					type="text"
					className="form-control"
					id="setting-webhook-user-id"
					placeholder="123456789012345678"
					value={settings.webhookUserId || ''}
					onChange={(event) => update('webhookUserId', event.target.value)}
				/>
			</div>

			<div className="form-group settings-block">
				<label htmlFor="setting-webhook-message-template">Webhook message template (optional)</label>
				<input
					type="text"
					className="form-control"
					id="setting-webhook-message-template"
					placeholder="RSDailies: {task} is due."
					value={settings.webhookMessageTemplate || ''}
					onChange={(event) => update('webhookMessageTemplate', event.target.value)}
				/>
				<small className="form-text text-muted">Use {'{task}'} for the task name.</small>
			</div>

			<div className="settings-actions d-flex gap-2 mt-3">
				<button id="save-settings-btn" type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
					Save Settings
				</button>
				<button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
					Reset
				</button>
			</div>
		</div>
	);
};
