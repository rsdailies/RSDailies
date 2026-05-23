<script lang="ts">
let {
	variant = 'section',
	label = '',
	statusText = '',
	extraClass = '',
	children,
	controls,
} = $props<{
	variant?: 'section' | 'subsection' | 'overview';
	label?: string;
	statusText?: string;
	extraClass?: string;
	children?: import('svelte').Snippet;
	controls?: import('svelte').Snippet;
}>();

const isSection = $derived(variant === 'section' || variant === 'overview');
</script>

<div class={`header_like_inner ${isSection ? 'ds-header-bar ds-header-bar-section' : 'ds-header-bar ds-header-bar-subsection'} ${extraClass}`.trim()}>
	<div class={`activity_name header_like_name ${isSection ? 'section-panel-title' : ''}`.trim()}>
		<span class="header_like_text">{@html label}</span>
	</div>

	<div class={`header_like_controls ${isSection ? 'section-panel-controls' : ''}`.trim()}>
		{#if statusText}
			<span class={`header_like_status countdown ds-status-chip ds-status-chip-muted ${isSection ? 'section-panel-countdown' : ''}`.trim()}>
				{statusText}
			</span>
		{/if}
		{@render controls?.()}
		{@render children?.()}
	</div>
</div>
