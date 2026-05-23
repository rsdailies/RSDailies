<script lang="ts">
let {
	type = 'button',
	variant = 'secondary',
	size = 'md',
	primitive = false,
	iconOnly = false,
	active = false,
	className = '',
	title = '',
	id = '',
	disabled = false,
	element = $bindable<HTMLButtonElement | null>(null),
	ariaExpanded,
	ariaControls = '',
	ariaLabel = '',
	onclick,
	children,
} = $props<{
	type?: 'button' | 'submit' | 'reset';
	variant?: 'primary' | 'secondary' | 'accent' | 'ghost-primary' | 'danger' | 'ghost-danger';
	size?: 'sm' | 'md' | 'lg';
	primitive?: boolean;
	iconOnly?: boolean;
	active?: boolean;
	className?: string;
	title?: string;
	id?: string;
	disabled?: boolean;
	element?: HTMLButtonElement | null;
	ariaExpanded?: boolean;
	ariaControls?: string;
	ariaLabel?: string;
	onclick?: ((event: MouseEvent) => void) | undefined;
	children?: import('svelte').Snippet;
}>();

const sizeClass = $derived(size === 'sm' ? 'ds-button-small' : size === 'lg' ? 'ds-button-large' : '');
const classValue = $derived(
	[
		'ds-button',
		`ds-button-${variant}`,
		sizeClass,
		primitive ? 'ds-button-primitive' : '',
		iconOnly ? 'ds-button-icon-only' : '',
		className,
	]
		.filter(Boolean)
		.join(' '),
);
</script>

<button
	{id}
	bind:this={element}
	{type}
	class={classValue}
	class:active
	{title}
	{disabled}
	aria-expanded={ariaExpanded}
	aria-controls={ariaControls || undefined}
	aria-label={ariaLabel || undefined}
	{onclick}
>
	{@render children?.()}
</button>
