export function createMemoryStorage() {
	const map = new Map();

	return {
		get length() {
			return map.size;
		},
		clear() {
			map.clear();
		},
		getItem(key) {
			return map.has(key) ? map.get(key) : null;
		},
		key(index) {
			return Array.from(map.keys())[index] ?? null;
		},
		removeItem(key) {
			map.delete(key);
		},
		setItem(key, value) {
			map.set(key, String(value));
		},
	};
}
