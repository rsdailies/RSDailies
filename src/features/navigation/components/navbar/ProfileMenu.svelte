<script lang="ts">
import { getSettings } from '@features/settings';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import {
	deleteProfile,
	getActiveProfile,
	getAllProfilesGlobal,
	setActiveProfile,
} from '@shared/storage/storage-service';
import { AppButton, AppPanel } from '@shared/ui';

let { isOpen, onToggle } = $props();

let profiles = $state(getAllProfilesGlobal());
let activeProfile = $state(getActiveProfile());
let newProfileName = $state('');

function refresh() {
	profiles = getAllProfilesGlobal();
	activeProfile = getActiveProfile();
}

function handleSelect(name: string) {
	setActiveProfile(name);
	refresh();
	const settings = getSettings();
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.density = settings.densityMode;
	}
	tracker.reloadAll();
	onToggle();
}

function handleAdd(event: SubmitEvent) {
	event.preventDefault();
	const name = newProfileName.trim();
	if (!name) return;
	setActiveProfile(name);
	newProfileName = '';
	refresh();
	tracker.reloadAll();
	onToggle();
}

function handleRemove(event: MouseEvent, name: string) {
	event.stopPropagation();
	deleteProfile(name);
	refresh();
	tracker.reloadAll();
}
</script>

<li class="ds-nav-entry ds-menu-shell">
	<button
		type="button"
		class="ds-nav-link ds-nav-expand ds-nav-button"
		id="profile-button"
		title="Profiles"
		aria-expanded={isOpen}
		aria-controls="profile-control"
		onclick={onToggle}
	>
		<span id="profile-name">{activeProfile}</span>&#128100;<span class="ds-expand-label">&nbsp;Profiles</span>
	</button>

	{#if isOpen}
		<AppPanel id="profile-control" variant="popover" className="ds-nav-popover" role="dialog">
			<strong>Profiles</strong>
			<ul id="profile-list">
				{#each profiles as profile}
					<li class="profile-row">
						<button type="button" class="profile-link" class:active={profile === activeProfile} onclick={() => handleSelect(profile)}>
							{profile}
						</button>
						{#if profile !== 'default'}
							<AppButton variant="ghost-danger" size="sm" className="profile-delete" onclick={(e) => handleRemove(e, profile)}>
								×
							</AppButton>
						{/if}
					</li>
				{/each}
			</ul>
			<form id="profile-form" onsubmit={handleAdd}>
				<div class="profile-form-row">
					<input type="text" class="ds-field" placeholder="New Profile" bind:value={newProfileName} required />
					<AppButton type="submit" variant="primary">+</AppButton>
				</div>
			</form>
		</AppPanel>
	{/if}
</li>
