<script lang="ts">
	import { appShellState } from '@app/state/shell.svelte';
	import { buildExportToken, importProfileToken } from '@shared/storage/storage-service';

	let token = $state('');
	let importValue = $state('');
	let message = $state('');
	let importPreview = $state<any>(null);

	const importExportOpen = $derived(appShellState.isModalOpen('import-export'));
	const customTaskOpen = $derived(appShellState.isModalOpen('custom-task'));

	function closeModal() {
		appShellState.closeModal();
		importPreview = null;
		importValue = '';
		message = '';
	}

	function exportToken() {
		token = buildExportToken();
		message = 'Export token generated.';
	}

	function handleImportInput() {
		try {
			const decoded = atob(importValue.trim());
			const data = JSON.parse(decoded);
			if (data && typeof data === 'object' && data.profileData) {
				importPreview = {
					profile: data.profile || 'unknown',
					tasks: Object.keys(data.profileData).length,
					date: data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'unknown'
				};
				message = '';
			} else {
				importPreview = null;
			}
		} catch {
			importPreview = null;
		}
	}

	function confirmImport() {
		const ok = importProfileToken(importValue);
		if (ok) {
			message = 'Import complete. Reload the page to see imported state.';
			importPreview = null;
			importValue = '';
		} else {
			message = 'Import failed. Check the token and try again.';
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) closeModal();
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.classList.toggle('modal-open', appShellState.activeModal !== null);
		return () => document.body.classList.remove('modal-open');
	});

	$effect(() => {
		if (typeof document === 'undefined' || appShellState.activeModal === null) return;
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeModal();
		};
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if importExportOpen}
	<div id="token-modal" class="ds-modal-shell" tabindex="-1" role="presentation" onclick={handleBackdropClick}>
		<div class="ds-modal-frame ds-modal-frame-centered ds-modal-frame-wide">
			<div class="ds-modal-card" role="dialog" aria-modal="true" aria-labelledby="token-modal-title">
				<div class="ds-modal-header">
					<h2 id="token-modal-title" class="ds-modal-title">Import / Export Token</h2>
					<button type="button" class="ds-modal-close" aria-label="Close" onclick={closeModal}></button>
				</div>
				<div class="ds-modal-body">
					<p class="ds-muted-copy ds-modal-copy">Export your local tracker state or import a token into this browser profile.</p>
					<div class="ds-modal-field-block">
						<label for="token-output" class="ds-field-label">Export token</label>
						<textarea id="token-output" class="ds-field" rows="4" readonly bind:value={token}></textarea>
					</div>
					<div class="ds-modal-field-block">
						<label for="token-input" class="ds-field-label">Import token</label>
						<textarea id="token-input" class="ds-field" rows="4" bind:value={importValue} oninput={handleImportInput}></textarea>
					</div>

					{#if importPreview}
						<div class="ds-callout ds-callout-info ds-modal-preview">
							<strong>Token Preview:</strong><br/>
							Profile: {importPreview.profile}<br/>
							Tasks: {importPreview.tasks}<br/>
							Exported: {importPreview.date}<br/>
							<p class="ds-warning-text ds-mt-1">Warning: Importing will overwrite local data for this profile.</p>
						</div>
					{/if}

					{#if message}<div class="ds-callout ds-callout-muted ds-modal-status">{message}</div>{/if}
				</div>
				<div class="ds-modal-footer">
					<button type="button" class="ds-button ds-button-secondary" onclick={closeModal}>Close</button>
					<button type="button" class="ds-button ds-button-ghost-primary" onclick={exportToken}>Export</button>
					{#if importPreview}
						<button type="button" class="ds-button ds-button-primary" onclick={confirmImport}>Confirm Import</button>
					{:else}
						<button type="button" class="ds-button ds-button-primary" disabled>Import</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if customTaskOpen}
	<div id="custom-task-modal" class="ds-modal-shell" tabindex="-1" role="presentation" onclick={handleBackdropClick}>
		<div class="ds-modal-frame ds-modal-frame-centered ds-modal-frame-wide">
			<div class="ds-modal-card" role="dialog" aria-modal="true" aria-labelledby="custom-task-modal-title">
				<div class="ds-modal-header">
					<h2 id="custom-task-modal-title" class="ds-modal-title">Custom Tasks</h2>
					<button type="button" class="ds-modal-close" aria-label="Close" onclick={closeModal}></button>
				</div>
				<div class="ds-modal-body">
					<p class="ds-muted-copy ds-modal-copy ds-modal-copy-tight">Custom task editing is intentionally parked until the Svelte tracker state is fully verified. Existing saved custom-task data is preserved in local storage.</p>
				</div>
				<div class="ds-modal-footer"><button type="button" class="ds-button ds-button-secondary" onclick={closeModal}>Close</button></div>
			</div>
		</div>
	</div>
{/if}
