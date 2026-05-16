<script lang="ts">
	import { tracker } from '@features/tracker';

	let {
		id,
		name,
		wiki = '',
		note = '',
		detailLines = [],
		completed = false,
		pinned = false,
		hidden = false,
		isCustom = false,
		extraClass = '',
		renderNameOnRight = false,
		sectionKey = '',
	} = $props();

	function toggle() {
		tracker.toggleComplete(sectionKey, id);
	}

	function pin(event: MouseEvent) {
		event.stopPropagation();
		tracker.togglePin(sectionKey, id);
	}

	function hideRow(event: MouseEvent) {
		event.stopPropagation();
		tracker.hide(sectionKey, id);
	}

	const statusLabel = $derived(hidden ? 'Hidden' : completed ? 'Complete' : 'Not started');
</script>

<tr data-id={id} data-completed={hidden ? 'hide' : completed ? 'true' : 'false'} class={`${extraClass} ${isCustom ? 'custom-activity-row' : ''} ${renderNameOnRight ? 'child-row' : ''}`}>
	<td class="activity_name" draggable="false">
		{#if wiki}
			<a href={wiki} target="_blank" rel="noopener noreferrer" draggable="false">{name}</a>
		{:else}
			<span class="activity_name_text">{name}</span>
		{/if}
		<div class="row-actions">
			<button type="button" class="pin-button ds-button ds-button-secondary ds-button-small" class:active={pinned} title="Pin to Overview" aria-label="Pin to Overview" onclick={pin}>&#9734;</button>
			<button type="button" class="hide-button ds-button ds-button-danger ds-button-small active" title="Hide row" aria-label="Hide row" onclick={hideRow}>&times;</button>
		</div>
	</td>
	<td class="activity_notes">
		<button
			type="button"
			class="activity-toggle-button ds-button-ghost"
			onclick={toggle}
			aria-pressed={completed}
			aria-label={`${completed ? 'Mark not started' : 'Mark complete'}: ${name}`}
		>
			<span class="activity_desc">
				{#if detailLines && detailLines.length > 0}
					{#each detailLines as line}
						<span class={`activity_note_line ${line.kind === 'location' ? 'activity_location_note' : ''} ${line.kind === 'duration' ? 'activity_duration_note' : ''}`}>{line.text}</span>
					{/each}
				{:else}
					{note || '\u00A0'}
				{/if}
			</span>
		</button>
	</td>
	<td class="activity_status">
		<button
			type="button"
			class="activity-status-button"
			onclick={toggle}
			aria-pressed={completed}
			aria-label={`${completed ? 'Mark not started' : 'Mark complete'}: ${name}`}
			title={statusLabel}
		>
			<span class="activity_check_off" aria-hidden="true">&#9744;</span>
			<span class="activity_check_on" aria-hidden="true">&#9745;</span>
			<span class="visually-hidden">{statusLabel}</span>
		</button>
	</td>
</tr>
