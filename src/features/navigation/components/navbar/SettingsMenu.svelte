<script lang="ts">
import { type Settings, getSettings, saveSettings } from '@features/settings';
import { AppButton, AppPanel } from '@shared/ui';

let { isOpen, onToggle } = $props();

let settings = $state<Settings>(getSettings());
let message = $state('');

function handleSave() {
	saveSettings(settings);
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.density = settings.densityMode;
	}
	message = 'Saved';
	setTimeout(() => (message = ''), 2000);
}
</script>

<li class="ds-nav-entry ds-menu-shell">
	<button
		type="button"
		class="ds-nav-link ds-nav-expand ds-nav-button"
		id="settings-button"
		title="Settings"
		aria-expanded={isOpen}
		aria-controls="settings-control"
		onclick={onToggle}
	>
		&#9881;<span class="ds-expand-label">&nbsp;Settings</span>
	</button>

	{#if isOpen}
		<AppPanel id="settings-control" variant="popover" className="ds-nav-popover" role="dialog">
			<strong>Settings</strong>
			<div class="ds-checkbox">
				<input type="checkbox" id="split-dailies" bind:checked={settings.splitDailyTables} />
				<label for="split-dailies">Split Dailies</label>
			</div>

			<div class="ds-checkbox">
				<label for="setting-density-mode">Density</label>
				<select id="setting-density-mode" bind:value={settings.densityMode}>
					<option value="compact">Compact</option>
					<option value="comfortable">Comfortable</option>
				</select>
			</div>

			<div class="ds-checkbox">
				<input
					type="checkbox"
					id="speedy-growth"
					checked={settings.herbTicks === 3}
					onchange={(e) => (settings.herbTicks = e.currentTarget.checked ? 3 : 4)}
				/>
				<label for="speedy-growth">Speedy Growth</label>
			</div>

			<div class="settings-actions">
				<AppButton id="save-settings-button" variant="primary" size="sm" onclick={handleSave}>Save</AppButton>
				{#if message}<span>{message}</span>{/if}
			</div>
		</AppPanel>
	{/if}
</li>
