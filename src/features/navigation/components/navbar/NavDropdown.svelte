<script lang="ts">
import { AppLink, AppMenu } from '@shared/ui';

let { label, items = [], isOpen = false, onToggle, onItemClick, isActive } = $props();
</script>

<li class="ds-nav-entry ds-menu-shell">
	<button
		type="button"
		class="ds-nav-link ds-nav-button ds-nav-button-caret"
		aria-expanded={isOpen}
		onclick={onToggle}
	>
		{label}
	</button>
	<AppMenu open={isOpen}>
		{#each items as subItem}
			<AppLink
				variant="menu"
				active={isActive(subItem.mode)}
				href={subItem.href}
				prefetch={true}
				onclick={onItemClick}
			>
				{subItem.label}
			</AppLink>
		{/each}
	</AppMenu>
</li>
