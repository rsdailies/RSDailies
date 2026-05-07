export function resolvePenguinTask(task, weeklyData = {}) {
  const sourceChildren = Array.isArray(task.childRows)
    ? task.childRows
    : Array.isArray(task.children)
      ? task.children
      : null;

  if (task.id !== 'penguins' || !sourceChildren) {
    return task;
  }

  const mergedChildren = sourceChildren.map((child) => {
    const override = weeklyData[child.id] || {};
    return {
      ...child,
      name: override.name || child.name,
      note: override.note || child.note,
    };
  });

  return {
    ...task,
    children: mergedChildren,
  };
}
