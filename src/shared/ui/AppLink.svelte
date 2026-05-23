<script lang="ts">
let {
	href = '',
	variant = 'nav',
	active = false,
	className = '',
	target = '',
	rel = '',
	title = '',
	prefetch = false,
	onclick,
	children,
} = $props<{
	href?: string;
	variant?: 'nav' | 'button' | 'menu' | 'inline' | 'tracker-row';
	active?: boolean;
	className?: string;
	target?: string;
	rel?: string;
	title?: string;
	prefetch?: boolean;
	onclick?: ((event: MouseEvent) => void) | undefined;
	children?: import('svelte').Snippet;
}>();

const variantClass = $derived(
	variant === 'button'
		? 'ds-button ds-button-secondary'
		: variant === 'menu'
			? 'ds-menu-item'
			: variant === 'nav'
				? 'ds-nav-link'
				: variant === 'tracker-row'
					? 'ds-link-reset ds-tracker-row-link'
					: '',
);
</script>

<a
	{href}
	class={`${variantClass} ${className}`.trim()}
	class:active
	{target}
	{rel}
	{title}
	data-astro-prefetch={prefetch ? true : undefined}
	{onclick}
>
	{@render children?.()}
</a>
