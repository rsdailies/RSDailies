<script lang="ts">
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { buildExportToken, importProfileToken } from '@shared/storage/storage-service';
import ModalFrame from '@shared/ui/modal/ModalFrame.svelte';

let { isOpen, onClose } = $props();

let token = $state('');
let importValue = $state('');
let message = $state('');
let preview = $state<any>(null);

function handleExport() {
	token = buildExportToken();
	message = 'Token generated.';
}

function handleImportInput() {
	try {
		const data = JSON.parse(atob(importValue.trim()));
		if (data?.profileData) {
			preview = { profile: data.profile, tasks: Object.keys(data.profileData).length };
			message = '';
		} else {
			preview = null;
		}
	} catch {
		preview = null;
	}
}

function handleImport() {
	if (importProfileToken(importValue)) {
		message = 'Import complete. Please reload.';
		preview = null;
		importValue = '';
	} else {
		message = 'Import failed.';
	}
}
</script>

<ModalFrame id="token-modal" titleId="token-modal-title" title="Import / Export" {isOpen} {onClose}>
	<p class="ds-muted-copy ds-modal-copy">Transfer your tracker state between devices.</p>
	<div class="ds-callout ds-callout-muted">{tracker.serverSyncNotice}</div>
	
	<div class="ds-modal-field-block">
		<label class="ds-field-label" for="export-token">Export token</label>
		<textarea id="export-token" class="ds-field" rows="3" readonly bind:value={token}></textarea>
		<button type="button" class="ds-button ds-button-ghost-primary ds-mt-1" onclick={handleExport}>Generate Export</button>
	</div>

	<div class="ds-modal-field-block">
		<label class="ds-field-label" for="import-token">Import token</label>
		<textarea id="import-token" class="ds-field" rows="3" bind:value={importValue} oninput={handleImportInput}></textarea>
	</div>

	{#if preview}
		<div class="ds-callout ds-callout-info">
			<strong>Preview:</strong> {preview.profile} ({preview.tasks} tasks)
			<button type="button" class="ds-button ds-button-primary ds-mt-1" onclick={handleImport}>Confirm Import</button>
		</div>
	{/if}

	{#if message}<div class="ds-callout ds-callout-muted">{message}</div>{/if}

	<div class="ds-modal-footer ds-mt-2">
		<button type="button" class="ds-button ds-button-secondary" onclick={onClose}>Close</button>
	</div>
</ModalFrame>
