<script lang="ts">
	import { buildExportToken, importProfileToken } from '../../lib/shared/storage/storage-service.ts';
	let token = $state('');
	let importValue = $state('');
	let message = $state('');
	function exportToken() { token = buildExportToken(); message = 'Export token generated.'; }
	function importToken() {
		const ok = importProfileToken(importValue);
		message = ok ? 'Import complete. Reload the page to see imported state.' : 'Import failed. Check the token and try again.';
	}
</script>

<div id="token-modal" class="modal fade" tabindex="-1">
	<div class="modal-dialog modal-dialog-centered modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Import / Export Token</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<p class="text-muted">Export your local tracker state or import a token into this browser profile.</p>
				<div class="mb-3">
					<label for="token-output" class="form-label">Export token</label>
					<textarea id="token-output" class="form-control" rows="4" readonly bind:value={token}></textarea>
				</div>
				<div class="mb-3">
					<label for="token-input" class="form-label">Import token</label>
					<textarea id="token-input" class="form-control" rows="4" bind:value={importValue}></textarea>
				</div>
				{#if message}<div class="alert alert-secondary py-2">{message}</div>{/if}
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				<button type="button" class="btn btn-outline-primary" onclick={exportToken}>Export</button>
				<button type="button" class="btn btn-primary" onclick={importToken}>Import</button>
			</div>
		</div>
	</div>
</div>

<div id="custom-task-modal" class="modal fade" tabindex="-1">
	<div class="modal-dialog modal-dialog-centered modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Custom Tasks</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<p class="text-muted mb-0">Custom task editing is intentionally parked until the Svelte tracker state is fully verified. Existing saved custom-task data is preserved in local storage.</p>
			</div>
			<div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div>
		</div>
	</div>
</div>
