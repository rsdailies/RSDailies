<script lang="ts">
import { appShellState } from '@app/state/shell.svelte';
import { onMount } from 'svelte';
import NavBrand from './navbar/NavBrand.svelte';
import NavDropdown from './navbar/NavDropdown.svelte';
import NavLink from './navbar/NavLink.svelte';
import ProfileMenu from './navbar/ProfileMenu.svelte';
import ResourceMenu from './navbar/ResourceMenu.svelte';
import SettingsMenu from './navbar/SettingsMenu.svelte';

let { game = 'rs3', mode = 'all', navItems = [] } = $props();

let mobileToggleButton: HTMLButtonElement | null = null;
let lastMenuTrigger: HTMLButtonElement | null = null;
let navOpen = $state(false);
let activeMenu = $state<string | null>(null);

const switchHref = $derived(game === 'osrs' ? '/rs3/tasks' : '/osrs/tasks');
const switchLabel = $derived(game === 'osrs' ? 'RS3' : 'OSRS');

function closeMenus(options: { keepNav?: boolean; returnFocusTo?: HTMLButtonElement | null } = {}) {
	activeMenu = null;
	if (!options.keepNav) navOpen = false;
	if (options.returnFocusTo && typeof window !== 'undefined') {
		window.requestAnimationFrame(() => options.returnFocusTo?.focus());
	}
}

function toggleNav() {
	navOpen = !navOpen;
	if (!navOpen) closeMenus();
}

function toggleMenu(name: string) {
	activeMenu = activeMenu === name ? null : name;
}

function handleAction(name: string) {
	return (e: MouseEvent) => {
		e.stopPropagation();
		lastMenuTrigger = e.currentTarget as HTMLButtonElement;
		toggleMenu(name);
	};
}

function openImportExport(e: MouseEvent) {
	closeMenus();
	appShellState.openModal('import-export', e.currentTarget as HTMLButtonElement);
}

onMount(() => {
	const handleDocumentClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement | null;
		if (!target?.closest?.('#main-nav')) closeMenus();
	};

	const handleDocumentKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') return;
		if (activeMenu) {
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

	document.addEventListener('click', handleDocumentClick, true);
	document.addEventListener('keydown', handleDocumentKeydown);
	return () => {
		document.removeEventListener('click', handleDocumentClick, true);
		document.removeEventListener('keydown', handleDocumentKeydown);
	};
});
</script>

<nav class="ds-topbar" id="main-nav">
	<div class="ds-shell-container ds-topbar-shell">
		<NavBrand onClick={closeMenus} />

		<button
			class="ds-topbar-toggle"
			type="button"
			id="main-nav-toggle"
			aria-controls="main-nav-panel"
			aria-expanded={navOpen}
			aria-label="Toggle navigation"
			onclick={toggleNav}
			bind:this={mobileToggleButton}
		>
			<span class="ds-topbar-toggle-icon"></span>
		</button>

		<div class="ds-topbar-panel" class:is-open={navOpen} id="main-nav-panel">
			<ul class="ds-nav-list ds-nav-list-primary">
				{#each navItems as item}
					{#if item.type === 'dropdown'}
						<NavDropdown 
							label={item.label} 
							items={item.items} 
							isOpen={activeMenu === item.label} 
							onToggle={handleAction(item.label)}
							onItemClick={closeMenus}
							isActive={(m) => mode === m}
						/>
					{:else}
						<NavLink href={item.href} label={item.label} active={mode === item.mode} onClick={closeMenus} />
					{/if}
				{/each}
				<ResourceMenu isOpen={activeMenu === 'resources'} onToggle={handleAction('resources')} />
			</ul>

			<ul class="ds-nav-list ds-nav-list-secondary">
				{#if mode !== 'landing'}
					<li class="ds-nav-entry">
						<a class="ds-nav-link ds-nav-expand" href={switchHref} title="Switch game" onclick={closeMenus}>
							&#8646;<span class="ds-expand-label">&nbsp;{switchLabel}</span>
						</a>
					</li>
				{/if}

				<ProfileMenu isOpen={activeMenu === 'profile'} onToggle={handleAction('profile')} />
				<SettingsMenu isOpen={activeMenu === 'settings'} onToggle={handleAction('settings')} />

				<li class="ds-nav-entry">
					<button type="button" class="ds-nav-link ds-nav-expand ds-nav-button" id="token-button" title="Import / Export" onclick={openImportExport}>
						&#8644;<span class="ds-expand-label">&nbsp;Import / Export</span>
					</button>
				</li>
			</ul>
		</div>
	</div>
</nav>
