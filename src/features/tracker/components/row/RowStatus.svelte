<script lang="ts">
let { completed, onToggle, ariaLabel = 'Toggle task completion' } = $props();
</script>

<td class="activity_status">
	<button type="button" class="activity-status-button" onclick={onToggle} aria-pressed={completed} aria-label={ariaLabel}>
		<div class="activity_check_off">
			<span class="ds-icon-box"></span>
		</div>
		<div class="activity_check_on">
			<span class="ds-icon-check">&#10003;</span>
		</div>
	</button>
</td>
