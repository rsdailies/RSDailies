<script lang="ts">
import { AppLink, AppMenu } from '@shared/ui';

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

let { isOpen, onToggle } = $props();
</script>

<li class="ds-nav-entry ds-menu-shell">
	<button
		type="button"
		class="ds-nav-link ds-nav-button ds-nav-button-caret"
		aria-expanded={isOpen}
		onclick={onToggle}
	>
		More Resources
	</button>
	<AppMenu open={isOpen}>
		{#each resourceLinks.slice(0, 4) as link}
			<AppLink variant="menu" href={link.href} target="_blank" rel="noreferrer noopener">
				{link.label}
			</AppLink>
		{/each}
		<div class="ds-menu-divider"></div>
		<h6 class="ds-menu-header">RS3 Discords</h6>
		{#each resourceLinks.slice(4) as link}
			<AppLink variant="menu" href={link.href} target="_blank" rel="noreferrer noopener">
				{link.label}
			</AppLink>
		{/each}
	</AppMenu>
</li>
