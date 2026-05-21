<script lang="ts">
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
	{#if isOpen}
		<div class="ds-menu">
			{#each items as subItem}
				<a
					class="ds-menu-item"
					class:active={isActive(subItem.mode)}
					href={subItem.href}
					data-astro-prefetch
					onclick={onItemClick}
				>
					{subItem.label}
				</a>
			{/each}
		</div>
	{/if}
</li>
