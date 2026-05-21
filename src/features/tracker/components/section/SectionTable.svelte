<script lang="ts">
let { tableId = '', columns = [], collapsed = false, header, children } = $props();
</script>

<div class="table_container" data-hide={collapsed ? 'hide' : undefined}>
	<table class="activity_table ds-data-table" id={tableId}>
		<colgroup>
			{#each columns as col}
				<col class={col} />
			{/each}
		</colgroup>
		
		{#if header}
			{@render header()}
		{/if}

		<tbody class="activity_body">
			{@render children()}
		</tbody>
	</table>
</div>
