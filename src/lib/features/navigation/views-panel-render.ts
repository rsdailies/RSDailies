export function renderViewsList(
	list: HTMLElement,
	groups: Array<{ heading: string; items: Array<{ mode: string; label: string }> }>,
	onSelectView: (mode: string) => void
) {
	list.innerHTML = '';

	groups.forEach((group) => {
		// Only show heading if more than 1 item in group
		if (group.items.length > 1) {
			const heading = document.createElement('li');
			heading.className = 'profile-row';
			heading.style.fontWeight = '700';
			heading.style.opacity = '0.9';
			heading.style.paddingTop = '6px';
			heading.textContent = group.heading;
			list.appendChild(heading);
		}

		group.items.forEach((view) => {
			const item = document.createElement('li');
			item.className = 'profile-row';
			const link = document.createElement('a');
			link.href = '#';
			link.className = 'profile-link';
			link.textContent = view.label;
			link.addEventListener('click', (event) => {
				event.preventDefault();
				onSelectView?.(view.mode);
			});
			item.appendChild(link);
			list.appendChild(item);
		});
	});
}

export function syncViewsButtonLabel(button: HTMLElement | null, label: string) {
	if (!button) return;
	button.textContent = label;
}
