<script lang="ts">
	import { onMount } from 'svelte';
	import { tracker } from '../../stores/tracker.svelte.ts';
	import { getSettings, saveSettings, type Settings } from '../../lib/features/settings/settings-service.ts';
	import {
		deleteProfile,
		getActiveProfile,
		getAllProfilesGlobal,
		setActiveProfile,
	} from '../../lib/shared/storage/storage-service.ts';

	type NavItem =
		| { type: 'link'; mode: string; label: string; href: string }
		| { type: 'dropdown'; label: string; items: { mode: string; label: string; href: string }[] };

	let { game = 'rs3', mode = 'all', navItems = [] }: { game?: string; mode?: string; navItems?: NavItem[] } = $props();

	let profileOpen = $state(false);
	let settingsOpen = $state(false);
	let profiles = $state<string[]>(['default']);
	let activeProfile = $state('default');
	let newProfileName = $state('');
	let settings = $state<Settings>({
		splitDailyTables: true,
		splitWeeklyTables: true,
		showCompletedTasks: false,
		herbTicks: 4,
		growthOffsetMinutes: 0,
		browserNotif: false,
		webhookUrl: '',
		webhookUserId: '',
		webhookMessageTemplate: 'RSDailies: {task} is due.',
		overviewVisible: true,
	});
	let settingsMessage = $state('');

	const switchHref = $derived(game === 'osrs' ? '/rs3/tasks' : '/osrs/tasks');
	const switchLabel = $derived(game === 'osrs' ? 'RS3' : 'OSRS');

	function isActive(itemMode: string) {
		return mode === itemMode;
	}

	function closeMenus() {
		profileOpen = false;
		settingsOpen = false;
	}

	function toggleProfile(event: MouseEvent) {
		event.preventDefault();
		profileOpen = !profileOpen;
		settingsOpen = false;
	}

	function toggleSettings(event: MouseEvent) {
		event.preventDefault();
		settingsOpen = !settingsOpen;
		profileOpen = false;
	}

	function refreshProfiles() {
		profiles = getAllProfilesGlobal();
		activeProfile = getActiveProfile();
	}

	function selectProfile(profileName: string) {
		setActiveProfile(profileName);
		refreshProfiles();
		tracker.reloadAll();
		profileOpen = false;
	}

	function addProfile(event: SubmitEvent) {
		event.preventDefault();
		const name = newProfileName.trim();
		if (!name) return;
		setActiveProfile(name);
		newProfileName = '';
		refreshProfiles();
		tracker.reloadAll();
		profileOpen = false;
	}

	function removeProfile(event: MouseEvent, profileName: string) {
		event.preventDefault();
		event.stopPropagation();
		deleteProfile(profileName);
		refreshProfiles();
		tracker.reloadAll();
	}

	function persistSettings() {
		settings = saveSettings(settings);
		settingsMessage = 'Settings saved.';
		window.setTimeout(() => { settingsMessage = ''; }, 1800);
	}

	onMount(() => {
		refreshProfiles();
		settings = getSettings();
		const handleDocumentClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			if (!target?.closest?.('.nav-right')) closeMenus();
		};
		document.addEventListener('click', handleDocumentClick);
		return () => document.removeEventListener('click', handleDocumentClick);
	});
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="main-nav">
	<div class="container-fluid">
		<a class="navbar-brand" href="/" id="navbar-logo" onclick={closeMenus}>
			<img src="/img/dailyscape.png" alt="RSDailies" width="24" height="24" class="d-inline-block align-text-top" />
			RSDailies
		</a>

		<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto">
				{#each navItems as item}
					{#if item.type === 'dropdown'}
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">{item.label}</a>
							<div class="dropdown-menu">
								{#each item.items as subItem}
									<a class={`dropdown-item ${isActive(subItem.mode) ? 'active' : ''}`} href={subItem.href}>{subItem.label}</a>
								{/each}
							</div>
						</li>
					{:else}
						<li class="nav-item"><a class={`nav-link ${isActive(item.mode) ? 'active' : ''}`} href={item.href}>{item.label}</a></li>
					{/if}
				{/each}
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">More Resources</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="https://runescape.wiki/w/Money_making_guide" target="_blank" rel="noreferrer noopener">Money Making Guide</a>
						<a class="dropdown-item" href="https://runescape.wiki/w/Distractions_and_Diversions" target="_blank" rel="noreferrer noopener">Distractions and Diversions</a>
						<a class="dropdown-item" href="https://pvme.github.io" target="_blank" rel="noreferrer noopener">PVM Encyclopedia</a>
						<a class="dropdown-item" href="https://runepixels.com/" target="_blank" rel="noreferrer noopener">Runepixels</a>
						<div class="dropdown-divider"></div>
						<h6 class="dropdown-header">RS3 Discords</h6>
						<a class="dropdown-item" href="https://discord.gg/rs" target="_blank" rel="noreferrer noopener">Official RuneScape</a>
						<a class="dropdown-item" href="https://discord.gg/ahelp" target="_blank" rel="noreferrer noopener">Achievement Help</a>
						<a class="dropdown-item" href="https://discord.gg/whirlpooldnd" target="_blank" rel="noreferrer noopener">Deep Sea Fishing</a>
						<a class="dropdown-item" href="https://discord.gg/nnrmtTU" target="_blank" rel="noreferrer noopener">Player Owned Farms</a>
					</div>
				</li>
			</ul>

			<ul class="navbar-nav nav-pills ms-auto nav-right">
				{#if mode !== 'landing'}
					<li class="nav-item">
						<a class="nav-link expanding_button" href={switchHref} title="Switch game">
							⇆<span class="expanding_text">&nbsp;{switchLabel}</span>
						</a>
					</li>
				{/if}

				<li class="nav-item dropdown">
					<a class="nav-link expanding_button" href="#" id="profile-button" title="Profiles" onclick={toggleProfile} aria-expanded={profileOpen}>
						<span id="profile-name" style="display:none; visibility:hidden;">{activeProfile}</span>👤<span class="expanding_text">&nbsp;Profiles</span>
					</a>
					<div id="profile-control" style={`display:${profileOpen ? 'block' : 'none'}; visibility:${profileOpen ? 'visible' : 'hidden'};`} data-display={profileOpen ? 'block' : 'none'}>
						<strong>Profiles</strong>
						<ul id="profile-list">
							{#each profiles as profile}
								<li class="profile-row">
									<a href="#" class="profile-link" class:active={profile === activeProfile} onclick={(event) => { event.preventDefault(); selectProfile(profile); }}>{profile}</a>
									{#if profile !== 'default'}
										<button type="button" class="btn btn-sm btn-outline-danger profile-delete" aria-label={`Delete ${profile}`} onclick={(event) => removeProfile(event, profile)}>×</button>
									{/if}
								</li>
							{/each}
						</ul>
						<form id="profile-form" autocomplete="off" onsubmit={addProfile}>
							<div class="row g-3 align-items-right">
								<div class="col-auto form-check" style="padding: 0 0 0 5px;">
									<input type="text" class="form-control" id="profileName" name="profileName" placeholder="New Profile Name" maxlength="25" bind:value={newProfileName} required />
									<div class="invalid-feedback">Enter a profile name.</div>
								</div>
								<div class="col-auto" style="padding: 0 5px 0 0;">
									<button type="submit" class="btn btn-primary">+</button>
								</div>
							</div>
						</form>
					</div>
				</li>

				<li class="nav-item dropdown">
					<a class="nav-link expanding_button" href="#" id="settings-button" title="Settings" onclick={toggleSettings} aria-expanded={settingsOpen}>
						⚙<span class="expanding_text">&nbsp;Settings</span>
					</a>
					<div id="settings-control" style={`display:${settingsOpen ? 'block' : 'none'}; visibility:${settingsOpen ? 'visible' : 'hidden'};`} data-display={settingsOpen ? 'block' : 'none'}>
						<strong>Settings</strong>
						<div class="form-check">
							<input class="form-check-input" type="checkbox" id="setting-split-daily-tables" bind:checked={settings.splitDailyTables} />
							<label class="form-check-label" for="setting-split-daily-tables">Split Dailies and Gathering</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="checkbox" id="setting-split-weekly-tables" bind:checked={settings.splitWeeklyTables} />
							<label class="form-check-label" for="setting-split-weekly-tables">Split Weeklies inside Gathering</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="checkbox" id="setting-3tick-herbs" checked={settings.herbTicks === 3} onchange={(event) => { settings.herbTicks = (event.currentTarget as HTMLInputElement).checked ? 3 : 4; }} />
							<label class="form-check-label" for="setting-3tick-herbs">Speedy Growth Upgrade</label>
						</div>
						<div class="form-check settings-block">
							<input class="form-check-input" type="checkbox" id="setting-browser-notif" bind:checked={settings.browserNotif} />
							<label class="form-check-label" for="setting-browser-notif">Browser notifications on reset / ready timers</label>
						</div>
						<div class="form-group settings-block">
							<label for="setting-webhook-url">Discord Webhook URL (optional)</label>
							<input type="text" class="form-control" id="setting-webhook-url" placeholder="https://discord.com/api/webhooks/..." bind:value={settings.webhookUrl} />
						</div>
						<div class="form-group settings-block">
							<label for="setting-webhook-user-id">Discord User ID to mention (optional)</label>
							<input type="text" class="form-control" id="setting-webhook-user-id" placeholder="123456789012345678" bind:value={settings.webhookUserId} />
						</div>
						<div class="form-group settings-block">
							<label for="setting-webhook-message-template">Webhook message template (optional)</label>
							<input type="text" class="form-control" id="setting-webhook-message-template" placeholder="RSDailies: task is due." bind:value={settings.webhookMessageTemplate} />
							<small class="form-text text-muted">Use {`{task}`} for the task name.</small>
						</div>
						<div class="settings-actions">
							<button id="save-settings-btn" type="button" class="btn btn-primary btn-sm" onclick={persistSettings}>Save Settings</button>
							{#if settingsMessage}<span class="settings-message">{settingsMessage}</span>{/if}
						</div>
					</div>
				</li>

				<li class="nav-item">
					<a class="nav-link expanding_button" href="#" id="token-button" title="Import / Export" data-bs-toggle="modal" data-bs-target="#token-modal" onclick={closeMenus}>
						⇄<span class="expanding_text">&nbsp;Import / Export</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</nav>
