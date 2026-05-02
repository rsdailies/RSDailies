import { getViewsPanelGroups } from '../../../../../ui/components/views/views-menu.js';

export function renderViewsList(list, onSelectView, game) {
  if (!list) return;

  list.innerHTML = '';
  getViewsPanelGroups(game).forEach((group) => {
    const heading = document.createElement('li');
    heading.className = 'profile-row';
    heading.style.fontWeight = '700';
    heading.style.opacity = '0.9';
    heading.style.paddingTop = '6px';
    heading.textContent = group.heading;
    list.appendChild(heading);

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
