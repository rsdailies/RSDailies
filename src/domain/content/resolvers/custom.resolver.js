export function resolveCustomTasks(getCustomTasks) {
  if (typeof getCustomTasks !== 'function') {
    return [];
  }
  return getCustomTasks();
}
