export function filterByGame(definitions, game) {
  return game ? definitions.filter((definition) => definition.game === game) : definitions;
}

export function createAliasLookup(definitions) {
  const aliases = new Map();

  definitions.forEach((definition) => {
    [definition.id, ...(definition.aliases || [])].forEach((alias) => {
      if (!aliases.has(alias)) {
        aliases.set(alias, definition.id);
      }
    });
  });

  return aliases;
}
