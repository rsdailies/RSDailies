<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { AppRow } from '@shared/ui';
import RowName from './row/RowName.svelte';
import RowNotes from './row/RowNotes.svelte';
import RowStatus from './row/RowStatus.svelte';

let {
	id,
	name,
	wiki = '',
	note = '',
	detailLines = [],
	completed = false,
	hidden = false,
	pinned = false,
	sectionKey = '',
	extraClass = '',
	cooldownMinutes = 0,
	timerId = '',
	notesColspan = 1,
} = $props();

function handleToggle() {
	tracker.toggleComplete(sectionKey, id);
}
function handlePin() {
	tracker.togglePin(sectionKey, id);
}
function handleHide() {
	tracker.hide(sectionKey, id);
}
</script>

<AppRow {id} {completed} {hidden} extraClass={extraClass}>
	<RowName
		{id}
		{name}
		{wiki}
		{pinned}
		{hidden}
		onPin={handlePin}
		onHide={handleHide}
	/>
	<RowNotes {id} {note} {detailLines} {timerId} {cooldownMinutes} {completed} {sectionKey} onToggle={handleToggle} colspan={notesColspan} />
	<RowStatus {completed} onToggle={handleToggle} ariaLabel={`${completed ? 'Mark task incomplete' : 'Mark task complete'}: ${name}`} />
</AppRow>
