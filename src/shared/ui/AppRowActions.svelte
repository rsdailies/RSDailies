<script lang="ts">
import AppButton from './AppButton.svelte';

let {
	pinned = false,
	hidden = false,
	showHide = true,
	onPin,
	onHide,
} = $props<{
	pinned?: boolean;
	hidden?: boolean;
	showHide?: boolean;
	onPin?: () => void;
	onHide?: () => void;
}>();

function handleAction(fn?: () => void) {
	return (event: MouseEvent) => {
		event.stopPropagation();
		fn?.();
	};
}
</script>

<AppButton
	variant="secondary"
	size="sm"
	iconOnly={true}
	className="pin-button"
	active={pinned}
	title={pinned ? 'Unpin from overview' : 'Pin to overview'}
	ariaLabel={pinned ? 'Unpin from overview' : 'Pin to overview'}
	onclick={handleAction(onPin)}
>
	📌
</AppButton>

{#if showHide && !hidden}
	<AppButton
		variant="secondary"
		size="sm"
		iconOnly={true}
		className="hide-button"
		title="Hide task"
		ariaLabel="Hide task"
		onclick={handleAction(onHide)}
	>
		✕
	</AppButton>
{/if}
