import { readable } from 'svelte/store';

/**
 * A global ticker that updates every second.
 * Used to synchronize all live countdowns and timers across the application
 * without creating hundreds of individual intervals.
 */
export const timeStore = readable(Date.now(), (set) => {
	const interval = setInterval(() => {
		set(Date.now());
	}, 1000);

	return () => clearInterval(interval);
});
