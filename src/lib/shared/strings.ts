export function slugify(input: unknown) {
	return (
		String(input || '')
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '') || `custom-${Date.now()}`
	);
}

export function escapeHtml(unsafe: unknown) {
	return String(unsafe || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
