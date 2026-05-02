function cleanNote(text) {
  if (!text) return '';
  return String(text)
    .replace(/<br\s*\/?>/gi, ' - ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createRs3Task(id, name, wiki, note, extra = {}) {
  return {
    id,
    name,
    wiki,
    note: cleanNote(note),
    ...extra,
  };
}

export function withResetDefaults(tasks, defaults) {
  return tasks.map((task) => ({ ...defaults, ...task }));
}
