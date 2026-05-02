import { getPrimaryNavItems } from '../../../../../ui/components/views/views-menu.js';

function createPrimaryNavDropdown(documentRef, definition, onSelectMode) {
  const li = documentRef.createElement('li');
  li.className = 'nav-item dropdown';
  li.dataset.primaryPageLink = 'true';

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

  definition.items.forEach((itemDefinition) => {
    const item = documentRef.createElement('li');
    const link = documentRef.createElement('a');
    link.className = 'dropdown-item';
    link.href = '#';
    link.textContent = itemDefinition.label;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      li.classList.remove('show');
      menu.classList.remove('show');
      onSelectMode(itemDefinition.mode);
    });
    item.appendChild(link);
    menu.appendChild(item);
  });

  li.appendChild(toggle);
  li.appendChild(menu);
  return li;
}

function createPrimaryNavLink(documentRef, definition, onSelectMode) {
  const item = documentRef.createElement('li');
  item.className = 'nav-item';
  item.dataset.primaryPageLink = 'true';

  const link = documentRef.createElement('a');
  link.className = 'nav-link';
  link.href = '#';
  link.textContent = definition.label;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    onSelectMode(definition.mode);
  });

  item.appendChild(link);
  return item;
}

export function upsertPrimaryNavLinks(documentRef, onSelectMode, game) {
  const navList = documentRef.querySelector('#navbarSupportedContent .navbar-nav.me-auto');
  if (!navList) return;

  navList.querySelectorAll('[data-primary-page-link="true"]').forEach((node) => node.remove());
  const resourcesItem = navList.querySelector('.nav-item.dropdown');

  getPrimaryNavItems(game).forEach((definition) => {
    const item = definition.type === 'dropdown'
      ? createPrimaryNavDropdown(documentRef, definition, onSelectMode)
      : createPrimaryNavLink(documentRef, definition, onSelectMode);

    if (resourcesItem) navList.insertBefore(item, resourcesItem);
    else navList.appendChild(item);
  });
}
