<script lang="ts">
let { id = '', title, titleId = '', isOpen, onClose, children } = $props();

function handleBackdropClick(e: MouseEvent) {
	if (e.target === e.currentTarget) onClose();
}

$effect(() => {
	if (typeof document === 'undefined' || !isOpen) return;
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') onClose();
	};
	document.addEventListener('keydown', handleKeydown);
	return () => document.removeEventListener('keydown', handleKeydown);
});
</script>

{#if isOpen}
	<div class="ds-modal-shell" id={id || undefined} tabindex="-1" role="presentation" onclick={handleBackdropClick}>
		<div class="ds-modal-frame ds-modal-frame-centered ds-modal-frame-wide">
			<div class="ds-modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId || undefined}>
				<div class="ds-modal-header">
					<h2 class="ds-modal-title" id={titleId || undefined}>{title}</h2>
					<button type="button" class="ds-modal-close" aria-label="Close" onclick={onClose}></button>
				</div>
				<div class="ds-modal-body">
					{@render children()}
				</div>
			</div>
		</div>
	</div>
{/if}
