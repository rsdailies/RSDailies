export function upsertPrimaryNavLinks(
	documentRef: Document,
	items: any[],
	onSelectMode: (mode: string) => void
) {
	const navList = documentRef.querySelector('#navbarSupportedContent .navbar-nav.me-auto');
	if (!navList) return;

	navList.querySelectorAll('[data-primary-page-link="true"]').forEach((node) => node.remove());
	const resourcesItem = navList.querySelector('.nav-item.dropdown');

	items.forEach((definition) => {
		const li = documentRef.createElement('li');
		li.dataset.primaryPageLink = 'true';

		if (definition.type === 'dropdown') {
			li.className = 'nav-item dropdown';
			const toggle = documentRef.createElement('a');
			toggle.className = 'nav-link dropdown-toggle';
			toggle.href = '#';
			toggle.role = 'button';
			toggle.textContent = definition.label;

			const menu = documentRef.createElement('ul');
			menu.className = 'dropdown-menu';

			toggle.addEventListener('click', (event) => {
				event.preventDefault();
				const nextOpen = !li.classList.contains('show');
				li.classList.toggle('show', nextOpen);
				menu.classList.toggle('show', nextOpen);
			});

			definition.items.forEach((itemDef: { mode: string; label: string }) => {
				const item = documentRef.createElement('li');
				const link = documentRef.createElement('a');
				link.className = 'dropdown-item';
				link.href = '#';
				link.textContent = itemDef.label;
				link.addEventListener('click', (event) => {
					event.preventDefault();
					li.classList.remove('show');
					menu.classList.remove('show');
					onSelectMode(itemDef.mode);
				});
				item.appendChild(link);
				menu.appendChild(item);
			});
			li.appendChild(toggle);
			li.appendChild(menu);
		} else {
			li.className = 'nav-item';
			const link = documentRef.createElement('a');
			link.className = 'nav-link';
			link.href = '#';
			link.textContent = definition.label;
			link.addEventListener('click', (event) => {
				event.preventDefault();
				onSelectMode(definition.mode);
			});
			li.appendChild(link);
		}

		if (resourcesItem) navList.insertBefore(li, resourcesItem);
		else navList.appendChild(li);
	});
}
