<script lang="ts">
let {
	variant = 'menu',
	className = '',
	id = '',
	role = 'none',
	labelledBy = '',
	children,
} = $props<{
	variant?: 'menu' | 'popover' | 'modal-section';
	className?: string;
	id?: string;
	role?: string;
	labelledBy?: string;
	children?: import('svelte').Snippet;
}>();

const variantClass = $derived(variant === 'menu' ? 'ds-menu' : 'ds-ui-panel');
</script>

<div
	{id}
	class={`${variantClass} ${className}`.trim()}
	role={role}
	aria-labelledby={labelledBy || undefined}
>
	{@render children?.()}
</div>
