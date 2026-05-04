import { loadContentPages } from './load-content.js';
import { getCanonicalSections } from './catalog.js';
import { resolvePenguinTask } from './resolvers/penguin.resolver.js';
import { resolveTimerGroups } from './resolvers/timer.resolver.js';
import { resolveCustomTasks } from './resolvers/custom.resolver.js';

function normalizeTaskItems(items, sectionId, penguinWeeklyData) {
  if (!Array.isArray(items)) {
    return [];
  }

  if (sectionId !== 'rs3weekly') {
    return items;
  }

  return items.map((task) => resolvePenguinTask(task, penguinWeeklyData));
}

function resolveSectionItems(section, deps) {
  if (section.id === 'custom') {
    return resolveCustomTasks(deps.getCustomTasks);
  }

  if (Array.isArray(section.groups)) {
    return resolveTimerGroups(section.groups);
  }

  return normalizeTaskItems(section.items, section.id, deps.getPenguinWeeklyData());
}

export function resolveTrackerSections({
  pages = loadContentPages(),
  game = null,
  getCustomTasks = () => [],
  getPenguinWeeklyData = () => ({}),
} = {}) {
  const deps = { getCustomTasks, getPenguinWeeklyData };

  return getCanonicalSections({ pages, game }).reduce((sections, section) => {
    sections[section.id] = resolveSectionItems(section, deps);
    return sections;
  }, {});
}

export function resolveTrackerPage(pageId, {
  pages = loadContentPages(),
  getCustomTasks = () => [],
  getPenguinWeeklyData = () => ({}),
} = {}) {
  const page = pages.find((entry) => entry.id === pageId);
  if (!page) {
    return null;
  }

  const deps = { getCustomTasks, getPenguinWeeklyData };

  return {
    ...page,
    sections: (page.sections || []).map((section) => ({
      ...section,
      resolvedItems: resolveSectionItems(section, deps),
    })),
  };
}

