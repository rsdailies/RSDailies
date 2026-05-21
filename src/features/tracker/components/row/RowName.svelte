<script lang="ts">
import { usePenguinStore } from '@features/penguins/stores/penguin.svelte';
import { resolveWikiHref } from '@shared/utils/wiki';
import RowActions from './RowActions.svelte';

let { id, name, wiki = '', pinned, hidden, onPin, onHide } = $props();

const penguins = usePenguinStore();
const displayName = $derived(penguins.getLiveName(id, name));
const href = $derived(resolveWikiHref(wiki));
</script>

<td class="activity_name">
	{#if href}
		<a href={href} target="_blank" rel="noopener noreferrer">
			{displayName}
		</a>
	{:else}
		<span class="activity_name_text">{displayName}</span>
	{/if}

	<div class="row-actions">
		<RowActions {pinned} {hidden} onPin={onPin} onHide={onHide} />
	</div>
</td>
