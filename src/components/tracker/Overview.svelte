<script lang="ts">
	import { onMount } from 'svelte';
	import Section from './Section.svelte';
	import { tracker } from '../../stores/tracker.svelte.ts';
	let { allSections = [] } = $props();
	let ready = $state(false);

	onMount(() => {
		for (const entry of allSections) tracker.loadSection(entry.data.id);
		tracker.loadPins();
		ready = true;
	});

	const pinnedTasks = $derived.by(() => {
		if (!ready) return [];
		const rows: any[] = [];
		for (const entry of allSections) {
			const section = entry.data;
			for (const task of section.items || []) {
				const key = `${section.id}::${task.id}`;
				if (tracker.pins[key]) rows.push({ ...task, sectionKey: section.id, note: task.note || section.label });
				for (const child of task.childRows || []) {
					const childKey = `${section.id}::${child.id}`;
					if (tracker.pins[childKey]) rows.push({ ...child, sectionKey: section.id, note: child.note || task.name });
				}
			}
		}
		return rows;
	});

	const overviewSection = $derived({
		id: 'overview',
		label: 'Overview',
		game: 'rs3',
		renderVariant: 'standard',
		containerId: 'overview-container',
		tableId: 'overview-table',
		shell: { columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'], extraTableClasses: [], showAddButton: false, showResetButton: true, showCountdown: false },
		items: pinnedTasks.length ? pinnedTasks : [{ id: 'overview-empty', name: 'No tasks pinned', note: 'Use ☆ on any row to pin it here.', reset: 'never', sectionKey: 'overview' }],
	});
</script>

<div class="row" id="overview-root">
	<Section section={overviewSection} tasks={overviewSection.items} />
</div>
