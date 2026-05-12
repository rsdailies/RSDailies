<script lang="ts">
	import TaskRow from '../TaskRow.svelte';
	let props = $props();
</script>

<TaskRow {...props} extraClass={`farming-child-row farming-location-row ${props.extraClass || ''}`} />
