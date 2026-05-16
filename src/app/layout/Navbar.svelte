<script lang="ts">
	import { onMount } from 'svelte';
	import { tracker } from '@features/tracker';
	import { getSettings, saveSettings, type Settings } from '@features/settings';
	import {
		deleteProfile,
		getActiveProfile,
		getAllProfilesGlobal,
		setActiveProfile,
	} from '@shared/storage/storage-service';
	import { appShellState } from '@app/state/shell.svelte';

	type NavLinkItem = { mode: string; label: string; href: string };
	type NavItem =
		| { type: 'link'; mode: string; label: string; href: string }
		| { type: 'dropdown'; label: string; items: NavLinkItem[] };

	const resourceLinks = [
		{ href: 'https://runescape.wiki/w/Money_making_guide', label: 'Money Making Guide' },
		{ href: 'https://runescape.wiki/w/Distractions_and_Diversions', label: 'Distractions and Diversions' },
		{ href: 'https://pvme.github.io', label: 'PVM Encyclopedia' },
		{ href: 'https://runepixels.com/', label: 'Runepixels' },
		{ href: 'https://discord.gg/rs', label: 'Official RuneScape', group: 'RS3 Discords' },
		{ href: 'https://discord.gg/ahelp', label: 'Achievement Help', group: 'RS3 Discords' },
		{ href: 'https://discord.gg/whirlpooldnd', label: 'Deep Sea Fishing', group: 'RS3 Discords' },
		{ href: 'https://discord.gg/nnrmtTU', label: 'Player Owned Farms', group: 'RS3 Discords' },
	];

	let { game = 'rs3', mode = 'all', navItems = [] }: { game?: string; mode?: string; navItems?: NavItem[] } = $props();

	let mobileToggleButton: HTMLButtonElement | null = null;
	let lastMenuTrigger: HTMLButtonElement | null = null;
	let navOpen = $state(false);
	let profileOpen = $state(false);
	let settingsOpen = $state(false);
	let resourcesOpen = $state(false);
	let primaryDropdownOpen = $state<string | null>(null);
	let profiles = $state<string[]>(['default']);
	let activeProfile = $state('default');
	let newProfileName = $state('');
	let settings = $state<Settings>({
		splitDailyTables: true,
		splitWeeklyTables: true,
		showCompletedTasks: false,
		densityMode: 'compact',
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

	function closeMenus(options: { keepNav?: boolean; returnFocusTo?: HTMLButtonElement | null } = {}) {
		profileOpen = false;
		settingsOpen = false;
		resourcesOpen = false;
		primaryDropdownOpen = null;
		if (!options.keepNav) navOpen = false;
		if (options.returnFocusTo && typeof window !== 'undefined') {
			window.requestAnimationFrame(() => options.returnFocusTo?.focus());
		}
	}

	function handleNavLinkClick() {
		closeMenus();
	}

	function toggleNav() {
		navOpen = !navOpen;
		if (!navOpen) closeMenus({ keepNav: false });
	}

	function togglePrimaryDropdown(label: string, event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		lastMenuTrigger = button;
		const nextOpen = primaryDropdownOpen === label ? null : label;
		closeMenus({ keepNav: true });
		primaryDropdownOpen = nextOpen;
	}

	function toggleProfile(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		lastMenuTrigger = button;
		const nextOpen = !profileOpen;
		closeMenus({ keepNav: true });
		profileOpen = nextOpen;
	}

	function toggleSettings(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		lastMenuTrigger = button;
		const nextOpen = !settingsOpen;
		closeMenus({ keepNav: true });
		settingsOpen = nextOpen;
	}

	function toggleResources(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		lastMenuTrigger = button;
		const nextOpen = !resourcesOpen;
		closeMenus({ keepNav: true });
		resourcesOpen = nextOpen;
	}

	function openImportExport(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		closeMenus();
		appShellState.openModal('import-export', button);
	}

	function refreshProfiles() {
		profiles = getAllProfilesGlobal();
		activeProfile = getActiveProfile();
	}

	function selectProfile(profileName: string) {
		setActiveProfile(profileName);
		refreshProfiles();
		settings = getSettings();
		document.documentElement.dataset.density = settings.densityMode;
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
		settings = getSettings();
		document.documentElement.dataset.density = settings.densityMode;
		tracker.reloadAll();
		profileOpen = false;
	}

	function removeProfile(event: MouseEvent, profileName: string) {
		event.preventDefault();
		event.stopPropagation();
		deleteProfile(profileName);
		refreshProfiles();
		settings = getSettings();
		document.documentElement.dataset.density = settings.densityMode;
		tracker.reloadAll();
	}

	function persistSettings() {
		settings = saveSettings(settings);
		if (typeof document !== 'undefined') {
			document.documentElement.dataset.density = settings.densityMode;
		}
		settingsMessage = 'Settings saved.';
		window.setTimeout(() => {
			settingsMessage = '';
		}, 1800);
	}

	onMount(() => {
		refreshProfiles();
		settings = getSettings();
		document.documentElement.dataset.density = settings.densityMode;
		const handleDocumentClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			if (!target?.closest?.('#main-nav')) closeMenus();
		};
		const handleDocumentKeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			if (profileOpen || settingsOpen || resourcesOpen || primaryDropdownOpen) {
				closeMenus({ keepNav: true, returnFocusTo: lastMenuTrigger });
				return;
			}
			if (navOpen) {
				navOpen = false;
				if (mobileToggleButton && typeof window !== 'undefined') {
					window.requestAnimationFrame(() => mobileToggleButton?.focus());
				}
			}
		};
		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleDocumentKeydown);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});
</script>

<nav class="ds-topbar" id="main-nav">
	<div class="ds-shell-container-wide ds-topbar-shell">
		<a class="ds-topbar-brand" href="/" id="site-logo" data-astro-prefetch onclick={handleNavLinkClick}>
			<img src="/img/dailyscape.png" alt="RSDailies" width="24" height="24" class="ds-brand-mark" />
			RSDailies
		</a>

		<button
			class="ds-topbar-toggle"
			type="button"
			aria-controls="main-nav-panel"
			aria-expanded={navOpen}
			aria-label="Toggle navigation"
			onclick={toggleNav}
			bind:this={mobileToggleButton}
		>
			<span class="ds-topbar-toggle-icon"></span>
		</button>

		<div class={`ds-topbar-panel ${navOpen ? 'is-open' : ''}`} id="main-nav-panel">
			<ul class="ds-nav-list ds-nav-list-primary">
				{#each navItems as item}
					{#if item.type === 'dropdown'}
						<li class="ds-nav-entry ds-menu-shell">
							<button
								type="button"
								class="ds-nav-link ds-nav-button ds-nav-button-caret"
								aria-expanded={primaryDropdownOpen === item.label}
								onclick={(event) => togglePrimaryDropdown(item.label, event)}
							>
								{item.label}
							</button>
							{#if primaryDropdownOpen === item.label}
								<div class="ds-menu">
									{#each item.items as subItem}
										<a
											class={`ds-menu-item ${isActive(subItem.mode) ? 'active' : ''}`}
											href={subItem.href}
											data-astro-prefetch
											onclick={handleNavLinkClick}
										>
											{subItem.label}
										</a>
									{/each}
								</div>
							{/if}
						</li>
					{:else}
						<li class="ds-nav-entry">
							<a
								class={`ds-nav-link ${isActive(item.mode) ? 'active' : ''}`}
								href={item.href}
								data-astro-prefetch
								onclick={handleNavLinkClick}
							>
								{item.label}
							</a>
						</li>
					{/if}
				{/each}
				<li class="ds-nav-entry ds-menu-shell">
					<button
						type="button"
						class="ds-nav-link ds-nav-button ds-nav-button-caret"
						id="resources-button"
						aria-expanded={resourcesOpen}
						onclick={toggleResources}
					>
						More Resources
					</button>
					{#if resourcesOpen}
						<div class="ds-menu" aria-labelledby="resources-button">
							{#each resourceLinks.slice(0, 4) as link}
								<a class="ds-menu-item" href={link.href} target="_blank" rel="noreferrer noopener">{link.label}</a>
							{/each}
							<div class="ds-menu-divider"></div>
							<h6 class="ds-menu-header">RS3 Discords</h6>
							{#each resourceLinks.slice(4) as link}
								<a class="ds-menu-item" href={link.href} target="_blank" rel="noreferrer noopener">{link.label}</a>
							{/each}
						</div>
					{/if}
				</li>
			</ul>

			<ul class="ds-nav-list ds-nav-list-secondary">
				{#if mode !== 'landing'}
					<li class="ds-nav-entry">
						<a class="ds-nav-link ds-nav-expand" href={switchHref} title="Switch game" data-astro-prefetch onclick={handleNavLinkClick}>
							&#8646;<span class="ds-expand-label">&nbsp;{switchLabel}</span>
						</a>
					</li>
				{/if}

				<li class="ds-nav-entry ds-menu-shell">
					<button
						type="button"
						class="ds-nav-link ds-nav-expand ds-nav-button"
						id="profile-button"
						title="Profiles"
						aria-expanded={profileOpen}
						aria-controls="profile-control"
						onclick={toggleProfile}
					>
						<span id="profile-name">{activeProfile}</span>&#128100;<span class="ds-expand-label">&nbsp;Profiles</span>
					</button>
					{#if profileOpen}
						<div id="profile-control">
							<strong>Profiles</strong>
							<ul id="profile-list">
								{#each profiles as profile}
									<li class="profile-row">
										<button type="button" class="profile-link" class:active={profile === activeProfile} onclick={() => selectProfile(profile)}>
											{profile}
										</button>
										{#if profile !== 'default'}
											<button type="button" class="ds-button ds-button-small ds-button-ghost-danger profile-delete" aria-label={`Delete ${profile}`} onclick={(event) => removeProfile(event, profile)}>
												&times;
											</button>
										{/if}
									</li>
								{/each}
							</ul>
							<form id="profile-form" autocomplete="off" onsubmit={addProfile}>
								<div class="profile-form-row">
									<div class="profile-form-input">
										<input type="text" class="ds-field" id="profileName" name="profileName" placeholder="New Profile Name" maxlength="25" bind:value={newProfileName} required />
										<div class="ds-feedback">Enter a profile name.</div>
									</div>
									<div class="profile-form-submit">
										<button type="submit" class="ds-button ds-button-primary">+</button>
									</div>
								</div>
							</form>
						</div>
					{/if}
				</li>

				<li class="ds-nav-entry ds-menu-shell">
					<button
						type="button"
						class="ds-nav-link ds-nav-expand ds-nav-button"
						id="settings-button"
						title="Settings"
						aria-expanded={settingsOpen}
						aria-controls="settings-control"
						onclick={toggleSettings}
					>
						&#9881;<span class="ds-expand-label">&nbsp;Settings</span>
					</button>
					{#if settingsOpen}
						<div id="settings-control">
							<strong>Settings</strong>
							<div class="ds-checkbox">
								<input class="ds-checkbox-input" type="checkbox" id="setting-split-daily-tables" bind:checked={settings.splitDailyTables} />
								<label class="ds-checkbox-label" for="setting-split-daily-tables">Split Dailies and Gathering</label>
							</div>
							<div class="ds-checkbox">
								<input class="ds-checkbox-input" type="checkbox" id="setting-split-weekly-tables" bind:checked={settings.splitWeeklyTables} />
								<label class="ds-checkbox-label" for="setting-split-weekly-tables">Split Weeklies inside Gathering</label>
							</div>
							<div class="ds-checkbox ds-settings-density">
								<label class="ds-checkbox-label" for="setting-density-mode">Density</label>
								<select class="ds-select ds-select-small ds-settings-density-select" id="setting-density-mode" bind:value={settings.densityMode}>
									<option value="compact">Compact</option>
									<option value="comfortable">Comfortable</option>
								</select>
							</div>
							<div class="ds-checkbox">
								<input
									class="ds-checkbox-input"
									type="checkbox"
									id="setting-3tick-herbs"
									checked={settings.herbTicks === 3}
									onchange={(event) => {
										settings.herbTicks = (event.currentTarget as HTMLInputElement).checked ? 3 : 4;
									}}
								/>
								<label class="ds-checkbox-label" for="setting-3tick-herbs">Speedy Growth Upgrade</label>
							</div>
							<div class="ds-checkbox settings-block">
								<input class="ds-checkbox-input" type="checkbox" id="setting-browser-notif" bind:checked={settings.browserNotif} />
								<label class="ds-checkbox-label" for="setting-browser-notif">Browser notifications on reset / ready timers</label>
							</div>
							<div class="ds-field-group settings-block">
								<label class="ds-field-label" for="setting-webhook-url">Discord Webhook URL (optional)</label>
								<input type="text" class="ds-field" id="setting-webhook-url" placeholder="https://discord.com/api/webhooks/..." bind:value={settings.webhookUrl} />
							</div>
							<div class="ds-field-group settings-block">
								<label class="ds-field-label" for="setting-webhook-user-id">Discord User ID to mention (optional)</label>
								<input type="text" class="ds-field" id="setting-webhook-user-id" placeholder="123456789012345678" bind:value={settings.webhookUserId} />
							</div>
							<div class="ds-field-group settings-block">
								<label class="ds-field-label" for="setting-webhook-message-template">Webhook message template (optional)</label>
								<input type="text" class="ds-field" id="setting-webhook-message-template" placeholder="RSDailies: task is due." bind:value={settings.webhookMessageTemplate} />
								<small class="ds-help-text ds-muted-copy">Use {`{task}`} for the task name.</small>
							</div>
							<div class="settings-actions">
								<button id="save-settings-button" type="button" class="ds-button ds-button-primary ds-button-small" onclick={persistSettings}>Save Settings</button>
								{#if settingsMessage}<span class="settings-message">{settingsMessage}</span>{/if}
							</div>
						</div>
					{/if}
				</li>

				<li class="ds-nav-entry">
					<button type="button" class="ds-nav-link ds-nav-expand ds-nav-button" id="token-button" title="Import / Export" onclick={openImportExport}>
						&#8644;<span class="ds-expand-label">&nbsp;Import / Export</span>
					</button>
				</li>
			</ul>
		</div>
	</div>
</nav>
