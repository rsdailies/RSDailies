<script lang="ts">
import { usePenguinStore } from '@features/penguins/stores/penguin.svelte';

type MenuTaskEntry = {
	id: string;
	name: string;
	sectionKey?: string;
};

let {
	open = $bindable(false),
	completedTasks = [],
	hiddenTasks = [],
	onToggleComplete,
	onRestore,
	onResetAll,
	onRestoreAll,
	buttonClass = '',
} = $props<{
	open?: boolean;
	completedTasks?: MenuTaskEntry[];
	hiddenTasks?: MenuTaskEntry[];
	onToggleComplete: (task: MenuTaskEntry) => void;
	onRestore: (task: MenuTaskEntry) => void;
	onResetAll: () => void;
	onRestoreAll: () => void;
	buttonClass?: string;
}>();

const penguins = usePenguinStore();

let triggerButton = $state<HTMLButtonElement | null>(null);
let panelElement = $state<HTMLDivElement | null>(null);

function closeDropdown() {
	open = false;
}

function toggleDropdown(event: MouseEvent) {
	event.stopPropagation();
	open = !open;
}

function handleWindowClick(event: MouseEvent) {
	if (!open) return;
	const target = event.target;
	if (
		triggerButton instanceof Node &&
		target instanceof Node &&
		(triggerButton.contains(target) || panelElement?.contains(target))
	) {
		return;
	}
	closeDropdown();
}

function handleEscape(event: KeyboardEvent) {
	if (event.key === 'Escape' && open) closeDropdown();
}

function handleToggleComplete(task: MenuTaskEntry) {
	onToggleComplete(task);
	closeDropdown();
}

function handleRestore(task: MenuTaskEntry) {
	onRestore(task);
	closeDropdown();
}

function handleResetAll() {
	onResetAll();
	closeDropdown();
}

function handleRestoreAll() {
	onRestoreAll();
	closeDropdown();
}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleEscape} />

<div class:menu-open={open} class="ds-menu-shell tracker-header-menu-shell" role="none">
	<button
		bind:this={triggerButton}
		type="button"
		class={`ds-button ds-button-secondary ${buttonClass}`.trim()}
		onclick={toggleDropdown}
		title="Manage completed and removed tasks"
		aria-expanded={open}
	>
		&#8635;
	</button>
	{#if open}
		<div
			bind:this={panelElement}
			class="ds-menu ds-menu-end tracker-header-menu"
		>
			<div class="ds-menu-header">Completed</div>
			<div class="ds-menu-divider"></div>
			<div class="ds-menu-header">Tasks</div>
			{#each completedTasks as task}
				<button class="ds-menu-item" onclick={() => handleToggleComplete(task)}>
					{penguins.getLiveName(task.id, task.name)}
				</button>
			{/each}
			{#if completedTasks.length === 0}
				<div class="ds-menu-item tracker-header-menu-item-muted">None</div>
			{/if}
			<div class="ds-menu-divider"></div>
			<button class="ds-menu-item tracker-header-menu-item-emphasis" onclick={handleResetAll}>
				Reset All Completed
			</button>

			<div class="ds-menu-header tracker-header-menu-section-gap">Removed</div>
			<div class="ds-menu-divider"></div>
			<div class="ds-menu-header">Tasks</div>
			{#each hiddenTasks as task}
				<button class="ds-menu-item" onclick={() => handleRestore(task)}>
					{penguins.getLiveName(task.id, task.name)}
				</button>
			{/each}
			{#if hiddenTasks.length === 0}
				<div class="ds-menu-item tracker-header-menu-item-muted">None</div>
			{/if}
			<div class="ds-menu-divider"></div>
			<button class="ds-menu-item tracker-header-menu-item-emphasis" onclick={handleRestoreAll}>
				Reset All Removed
			</button>
		</div>
	{/if}
</div>
