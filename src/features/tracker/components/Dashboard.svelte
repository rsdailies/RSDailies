<script lang="ts">
	import Section from './Section.svelte';
	import { tracker } from '@features/tracker';
	let { sections = [] } = $props();
</script>

<div class="ds-layout-row" id="dashboard-root">
	{#each sections as sectionEntry (sectionEntry.data.id)}
		<Section section={sectionEntry.data} tasks={sectionEntry.data.items || []} />
	{/each}
</div>
