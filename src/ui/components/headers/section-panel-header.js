import { HEADER_CLASSES, HEADER_CONTROL_TEXT } from './header.constants.js';
import { renderHeaderFrameHtml } from './header.frame.js';

function createControlButton(documentRef, id, className, text, variant = 'secondary') {
  const btn = documentRef.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = `btn btn-${variant} btn-sm active primitive-btn ${className}`;
  btn.textContent = text;
  return btn;
}

function createHeaderControls(section, documentRef) {
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
    container.appendChild(createControlButton(documentRef, `${section.id}_reset_button`, 'section-panel-reset-button', HEADER_CONTROL_TEXT.reset));
  }

  container.appendChild(createControlButton(documentRef, `${section.id}_hide_button`, 'hide_button section-panel-toggle-button', HEADER_CONTROL_TEXT.hide));
  container.appendChild(createControlButton(documentRef, `${section.id}_unhide_button`, 'unhide_button section-panel-toggle-button', HEADER_CONTROL_TEXT.show));

  return container.innerHTML; // Still returning innerHTML for compatibility with frame but content is now safe
}

export function renderSectionPanelHeader(section, colspan, documentRef = document) {
  return renderHeaderFrameHtml({
    label: section.label,
    colspan,
    controlsHtml: createHeaderControls(section, documentRef),
    barClassName: 'section-panel-header',
    titleClassName: 'section-panel-title',
    controlsClassName: 'section-panel-controls'
  });
}

