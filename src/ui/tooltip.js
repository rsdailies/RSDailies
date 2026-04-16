export function getTooltipElement(documentRef = document) {
    return documentRef.getElementById('tooltip');
  }
  
  export function showTooltip(text, anchorRect, { documentRef = document, windowRef = window } = {}) {
    const tooltip = getTooltipElement(documentRef);
    if (!tooltip || !text) return;
  
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.visibility = 'visible';
  
    const pad = 10;
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
  
    let left = anchorRect.left + windowRef.scrollX;
    let top = anchorRect.bottom + windowRef.scrollY + 8;
  
    const maxLeft = windowRef.scrollX + documentRef.documentElement.clientWidth - width - pad;
    if (left > maxLeft) left = maxLeft;
    if (left < pad) left = pad;
  
    const maxTop = windowRef.scrollY + documentRef.documentElement.clientHeight - height - pad;
    if (top > maxTop) {
      top = anchorRect.top + windowRef.scrollY - height - 8;
    }
  
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
  
  export function hideTooltip(documentRef = document) {
    const tooltip = getTooltipElement(documentRef);
    if (!tooltip) return;
  
    tooltip.style.display = 'none';
    tooltip.style.visibility = 'hidden';
    tooltip.textContent = '';
  }
  
  export function buildTooltipText(task) {
    const parts = [];
    if (task?.name) parts.push(task.name);
    if (task?.note) parts.push(task.note);
    return parts.join('\n');
  }
  
  export function attachTooltip(targetElement, task, { documentRef = document, windowRef = window } = {}) {
    const text = buildTooltipText(task);
    if (!targetElement || !text) return;
  
    targetElement.dataset.tooltipText = text;
  
    const onEnter = () => showTooltip(text, targetElement.getBoundingClientRect(), { documentRef, windowRef });
    const onLeave = () => hideTooltip(documentRef);
    const onMove = () => showTooltip(text, targetElement.getBoundingClientRect(), { documentRef, windowRef });
  
    targetElement.addEventListener('mouseenter', onEnter);
    targetElement.addEventListener('mouseleave', onLeave);
    targetElement.addEventListener('mousemove', onMove);
    targetElement.addEventListener('focus', onEnter);
    targetElement.addEventListener('blur', onLeave);
  }