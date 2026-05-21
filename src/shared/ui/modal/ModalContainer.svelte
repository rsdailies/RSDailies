<script lang="ts">
import { appShellState } from '@app/state/shell.svelte';
import CustomTaskModal from '@features/custom-tasks/components/CustomTaskModal.svelte';
import ImportExportModal from '@features/import-export/components/ImportExportModal.svelte';

function closeModal() {
	appShellState.closeModal();
}

$effect(() => {
	if (typeof document === 'undefined') return;
	document.body.classList.toggle('modal-open', appShellState.activeModal !== null);
	return () => document.body.classList.remove('modal-open');
});
</script>

<ImportExportModal 
	isOpen={appShellState.isModalOpen('import-export')} 
	onClose={closeModal} 
/>

<CustomTaskModal 
	isOpen={appShellState.isModalOpen('custom-task')} 
	onClose={closeModal} 
/>
