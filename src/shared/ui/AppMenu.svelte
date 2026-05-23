<script lang="ts">
import { tick } from 'svelte';
import AppPanel from './AppPanel.svelte';

let {
	open = false,
	align = 'start',
	portal = false,
	className = '',
	panelClass = '',
	id = '',
	anchor = null,
	labelledBy = '',
	children,
} = $props<{
	open?: boolean;
	align?: 'start' | 'end';
	portal?: boolean;
	className?: string;
	panelClass?: string;
	id?: string;
	anchor?: HTMLElement | null;
	labelledBy?: string;
	children?: import('svelte').Snippet;
}>();

let panelElement = $state<HTMLDivElement | null>(null);
let panelStyle = $state('');

function portalAction(node: HTMLElement) {
	if (!portal || typeof document === 'undefined') return;
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		},
	};
}

async function updatePosition() {
	if (!open || !portal || !anchor || !panelElement || typeof window === 'undefined') return;
	await tick();
	const anchorRect = anchor.getBoundingClientRect();
	const panelRect = panelElement.getBoundingClientRect();
	const gap = 6;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	let left = align === 'end' ? anchorRect.right - panelRect.width : anchorRect.left;
	left = Math.max(8, Math.min(left, viewportWidth - panelRect.width - 8));

	let top = anchorRect.bottom + gap;
	if (top + panelRect.height > viewportHeight - 8) {
		top = Math.max(8, anchorRect.top - panelRect.height - gap);
	}

	panelStyle = `position: fixed; left: ${left}px; top: ${top}px;`;
}

$effect(() => {
	if (!open || !portal || typeof window === 'undefined') return;
	updatePosition();
	const handleViewport = () => updatePosition();
	window.addEventListener('resize', handleViewport);
	window.addEventListener('scroll', handleViewport, true);
	return () => {
		window.removeEventListener('resize', handleViewport);
		window.removeEventListener('scroll', handleViewport, true);
	};
});
</script>

<div class={`ds-menu-shell ${className}`.trim()} role="none">
	{#if open}
		<div bind:this={panelElement} use:portalAction style={panelStyle}>
			<AppPanel
				id={id}
				variant="menu"
				role="menu"
				labelledBy={labelledBy}
				className={`${align === 'end' ? 'ds-menu-end' : ''} ${portal ? 'ds-menu-portal' : ''} ${panelClass}`.trim()}
			>
				{@render children?.()}
			</AppPanel>
		</div>
	{/if}
</div>
