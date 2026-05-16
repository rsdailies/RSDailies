<script lang="ts">
	import { tracker } from '@features/tracker';
	let { label, colspan, rightText = '', id = '', showControls = false, onReset = null } = $props();
	const isCollapsed = $derived(id ? tracker.isCollapsedBlock(id) : false);
	function toggle() {
		if (id) tracker.setCollapsedBlock(id, !isCollapsed);
	}
	function reset(event: MouseEvent) {
		event.stopPropagation();
		if (typeof onReset === 'function') onReset();
	}
</script>

<tr class="header_like_row subgroup-header-row" data-subgroup-id={id}>
	<td colspan={colspan} class="header_like_color">
		<div class="header_like_inner">
			<div class="activity_name header_like_name">
				<span class="header_like_text">{@html label}</span>
			</div>
			<div class="header_like_controls">
				{#if rightText}<span class="header_like_status countdown ds-status-chip ds-status-chip-muted">{rightText}</span>{/if}
				{#if showControls}
					{#if onReset}<button type="button" class="ds-button ds-button-secondary ds-button-small mini-reset-control ds-button-primitive" onclick={reset} title="Reset group">&#8635;</button>{/if}
					{#if id}
						<button type="button" class="ds-button ds-button-secondary ds-button-small mini-collapse-control ds-button-primitive" onclick={toggle}>
							{#if isCollapsed}&#9654;{:else}&#9660;{/if}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	</td>
</tr>
