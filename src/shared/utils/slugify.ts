export function slugify(input: unknown) {
	if (!input) return '';
	return String(input)
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-');
}
