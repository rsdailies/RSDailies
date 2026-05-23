<script lang="ts">
let {
	id = '',
	completed = false,
	hidden = false,
	variant = 'standard',
	extraClass = '',
	children,
} = $props<{
	id?: string;
	completed?: boolean;
	hidden?: boolean;
	variant?: 'standard' | 'overview' | 'timer-child' | 'special';
	extraClass?: string;
	children?: import('svelte').Snippet;
}>();

const variantClass = $derived(
	variant === 'timer-child'
		? 'farming-child-row'
		: variant === 'overview'
			? 'overview-row-compact'
			: variant === 'special'
				? 'ds-task-row-special'
				: '',
);
</script>

{#if !hidden}
	<tr
		class={`ds-task-row ${variantClass} ${extraClass}`.trim()}
		class:completed
		data-task-id={id || undefined}
		data-completed={completed}
	>
		{@render children?.()}
	</tr>
{/if}
