import { HEADER_CLASSES, HEADER_CONTROL_TEXT } from './header.constants.js';
import { renderHeaderFrameHtml } from './header.frame.js';

function createControlButton(documentRef, id, className, text, variant = 'secondary', options = {}) {
  const btn = documentRef.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = `btn btn-${variant} btn-sm active primitive-btn ${className}`;
  if (options.dropdown) {
    btn.classList.add('dropdown-toggle', 'no-caret');
    btn.setAttribute('data-bs-toggle', 'dropdown');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.textContent = text;
  return btn;
}

function createRestoreDropdownItems(sectionId, hiddenRows, completed, tasks, documentRef) {
  const list = documentRef.createElement('ul');
  list.className = 'dropdown-menu dropdown-menu-dark dropdown-menu-end section-restore-dropdown';
  list.setAttribute('aria-labelledby', `${sectionId}_reset_button`);

  // 1. Restore All (Top)
  const restoreAllLi = documentRef.createElement('li');
  const restoreAllBtn = documentRef.createElement('button');
  restoreAllBtn.className = 'dropdown-item section-restore-all-btn';
  restoreAllBtn.type = 'button';
  restoreAllBtn.textContent = 'Restore All';
  restoreAllLi.appendChild(restoreAllBtn);
  list.appendChild(restoreAllLi);

  const topDividerLi = documentRef.createElement('li');
  topDividerLi.innerHTML = '<hr class="dropdown-divider">';
  list.appendChild(topDividerLi);

  // 2. Individual X'd out tasks (Middle - filter out completed ones)
  const hiddenIds = Object.keys(hiddenRows).filter(id => !completed[id]);
  
  if (hiddenIds.length > 0) {
    hiddenIds.forEach((id) => {
      const task = tasks.find((t) => t.id === id) || { name: hiddenRows[id] || id };
      const li = documentRef.createElement('li');
      const btn = documentRef.createElement('button');
      btn.className = 'dropdown-item section-restore-task-btn';
      btn.type = 'button';
      btn.dataset.taskId = id;
      btn.textContent = task.name;
      li.appendChild(btn);
      list.appendChild(li);
    });

    const bottomDividerLi = documentRef.createElement('li');
    bottomDividerLi.innerHTML = '<hr class="dropdown-divider">';
    list.appendChild(bottomDividerLi);
  }

  // 3. Clear Completed (Bottom)
  const resetLi = documentRef.createElement('li');
  const resetBtn = documentRef.createElement('button');
  resetBtn.className = 'dropdown-item section-clear-completion-btn';
  resetBtn.type = 'button';
  resetBtn.textContent = 'Clear Completed';
  resetLi.appendChild(resetBtn);
  list.appendChild(resetLi);

  return list.outerHTML;
}

function createHeaderControls(section, documentRef, deps = {}) {
  const { hiddenRows = {}, completed = {}, sectionTasks = [] } = deps;
  const hiddenCount = Object.keys(hiddenRows).length;
  const container = documentRef.createElement('div');
  const shell = section.shell || {};

  if (shell.countdownId) {
    const countdown = documentRef.createElement('span');
    countdown.id = shell.countdownId;
    countdown.className = `${HEADER_CLASSES.status} section-panel-countdown`;
    countdown.textContent = '--:--:--';
    container.appendChild(countdown);
  }

  if (shell.showAddButton) {
    container.appendChild(createControlButton(documentRef, `${section.id}_add_button`, 'section-panel-add-button', '+ Add', 'primary'));
  }

  if (shell.showResetButton) {
    if (hiddenCount >= 2) {
      const dropdownWrapper = documentRef.createElement('div');
      dropdownWrapper.className = 'dropdown d-inline-block';
      dropdownWrapper.appendChild(createControlButton(documentRef, `${section.id}_reset_button`, 'section-panel-reset-button', HEADER_CONTROL_TEXT.reset, 'secondary', { dropdown: true }));
      dropdownWrapper.innerHTML += createRestoreDropdownItems(section.id, hiddenRows, completed, sectionTasks, documentRef);
      container.appendChild(dropdownWrapper);
    } else {
      container.appendChild(createControlButton(documentRef, `${section.id}_reset_button`, 'section-panel-reset-button', HEADER_CONTROL_TEXT.reset));
    }
  }

  container.appendChild(createControlButton(documentRef, `${section.id}_hide_button`, 'hide_button section-panel-toggle-button', HEADER_CONTROL_TEXT.hide));
  container.appendChild(createControlButton(documentRef, `${section.id}_unhide_button`, 'unhide_button section-panel-toggle-button', HEADER_CONTROL_TEXT.show));

  return container.innerHTML; // Still returning innerHTML for compatibility with frame but content is now safe
}

export function renderSectionPanelHeader(section, colspan, deps = {}, documentRef = document) {
  return renderHeaderFrameHtml({
    label: section.label,
    colspan,
    controlsHtml: createHeaderControls(section, documentRef, deps),
    barClassName: 'section-panel-header',
    titleClassName: 'section-panel-title',
    controlsClassName: 'section-panel-controls'
  });
}

