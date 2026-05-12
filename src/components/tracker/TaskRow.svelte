<script lang="ts">
	import { tracker } from '../../stores/tracker.svelte.ts';
	let { id, name, wiki = '', note = '', detailLines = [], completed = false, pinned = false, hidden = false, isCustom = false, extraClass = '', renderNameOnRight = false, sectionKey = '' } = $props();
	function disableLink(event: MouseEvent) {
		if (!wiki) event.preventDefault();
	}
	function toggle() { tracker.toggleComplete(sectionKey, id); }
	function pin(event: MouseEvent) { event.stopPropagation(); tracker.togglePin(sectionKey, id); }
	function hideRow(event: MouseEvent) { event.stopPropagation(); tracker.hide(sectionKey, id); }
</script>

<tr draggable="true" data-id={id} data-completed={hidden ? 'hide' : completed ? 'true' : 'false'} class={`${extraClass} ${isCustom ? 'custom-activity-row' : ''} ${renderNameOnRight ? 'child-row' : ''}`}>
	<td class="activity_name" draggable="false">
		<a href={wiki || '#'} target={wiki ? '_blank' : undefined} rel={wiki ? 'noopener noreferrer' : undefined} draggable="false" onclick={disableLink}>{name}</a>
		<div class="row-actions">
			<button type="button" class="pin-button btn btn-secondary btn-sm" class:active={pinned} title="Pin to Overview" aria-label="Pin to Overview" onclick={pin}>☆</button>
			<button type="button" class="hide-button btn btn-danger btn-sm active" title="Hide row" aria-label="Hide row" onclick={hideRow}>×</button>
		</div>
	</td>
	<td class="activity_notes" onclick={toggle}>
		<span class="activity_desc">
			{#if detailLines && detailLines.length > 0}
				{#each detailLines as line}
					<span class={`activity_note_line ${line.kind === 'location' ? 'activity_location_note' : ''} ${line.kind === 'duration' ? 'activity_duration_note' : ''}`}>{line.text}</span>
				{/each}
			{:else}
				{note || '\u00A0'}
			{/if}
		</span>
	</td>
	<td class="activity_status" onclick={toggle}>
		<span class="activity_check_off">☐</span>
		<span class="activity_check_on">☑</span>
	</td>
</tr>
