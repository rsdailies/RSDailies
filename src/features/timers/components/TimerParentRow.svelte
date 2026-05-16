<script lang="ts">
	// Reserved for the next visual pass if timer parent rows need richer controls than SubgroupHeader.
	let { name = '', note = '' } = $props();
</script>

<tr class="header_like_row subgroup-header-row farming-parent-row">
	<td colspan="3" class="header_like_color">
		<div class="header_like_inner">
			<div class="activity_name header_like_name"><span class="header_like_text">{name}</span></div>
			{#if note}<div class="header_like_controls"><span class="header_like_status countdown ds-status-chip ds-status-chip-muted">{note}</span></div>{/if}
		</div>
	</td>
</tr>
