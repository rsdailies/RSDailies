export function resolveWikiHref(wiki?: string) {
	const value = String(wiki || '').trim();
	if (!value) return '';
	if (/^https?:\/\//i.test(value)) return value;
	return `https://runescape.wiki/w/${value.replace(/^\/+/, '')}`;
}
