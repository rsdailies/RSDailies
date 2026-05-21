<script lang="ts">
import ModalFrame from '@shared/ui/modal/ModalFrame.svelte';
let { isOpen, onClose } = $props();
</script>

<ModalFrame title="Custom Tasks" {isOpen} {onClose}>
	<p class="ds-muted-copy ds-modal-copy">
		Custom task editing is currently parked while we finalize the atomic tracker state. 
		Existing data is safely preserved.
	</p>
	<div class="ds-modal-footer ds-mt-2">
		<button type="button" class="ds-button ds-button-secondary" onclick={onClose}>Close</button>
	</div>
</ModalFrame>
