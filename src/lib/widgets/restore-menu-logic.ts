export function closeRestoreMenu(menu: HTMLElement | null, trigger: HTMLElement | null) {
	if (!menu || !trigger) return;
	menu.style.display = 'none';
	trigger.setAttribute('aria-expanded', 'false');
}

export function openRestoreMenu(menu: HTMLElement | null, trigger: HTMLElement | null) {
	if (!menu || !trigger) return;
	menu.style.display = 'flex';
	trigger.setAttribute('aria-expanded', 'true');
}
