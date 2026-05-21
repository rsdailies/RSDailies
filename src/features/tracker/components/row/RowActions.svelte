<script lang="ts">
let { pinned, hidden, onPin, onHide } = $props();

function handleAction(fn: () => void) {
	return (e: MouseEvent) => {
		e.stopPropagation();
		fn();
	};
}
</script>

<button 
	type="button"
	class="ds-button ds-button-secondary pin-button" 
	class:active={pinned} 
	onclick={handleAction(onPin)}
	title={pinned ? 'Unpin from overview' : 'Pin to overview'}
>
	📌
</button>
<button 
	type="button"
	class="ds-button ds-button-secondary hide-button" 
	onclick={handleAction(onHide)}
	title="Hide task"
>
	✕
</button>
