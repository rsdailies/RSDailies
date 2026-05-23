<script lang="ts">
let {
	tableId = '',
	columns = [],
	collapsed = false,
	containerClass = '',
	tableClass = '',
	header,
	children,
} = $props<{
	tableId?: string;
	columns?: string[];
	collapsed?: boolean;
	containerClass?: string;
	tableClass?: string;
	header?: import('svelte').Snippet;
	children?: import('svelte').Snippet;
}>();
</script>

<div class={`table_container ${containerClass}`.trim()} data-hide={collapsed ? 'hide' : undefined}>
	<table class={`activity_table ds-data-table ${tableClass}`.trim()} id={tableId || undefined}>
		<colgroup>
			{#each columns as col}
				<col class={col} />
			{/each}
		</colgroup>
		{@render header?.()}
		<tbody class="activity_body">
			{@render children?.()}
		</tbody>
	</table>
</div>
