<script lang="ts">
let { completed, onToggle } = $props();
</script>

<td class="activity_status" onclick={onToggle}>
	<div class="activity_check_off">
		<span class="ds-icon-box"></span>
	</div>
	<div class="activity_check_on">
		<span class="ds-icon-check">✓</span>
	</div>
</td>
