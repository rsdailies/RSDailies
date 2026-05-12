<script lang="ts">
	import Section from './Section.svelte';
	let { sections = [] } = $props();
</script>

<div class="row" id="dashboard-root">
	{#each sections as sectionEntry (sectionEntry.data.id)}
		<Section section={sectionEntry.data} tasks={sectionEntry.data.items || []} />
	{/each}
</div>
