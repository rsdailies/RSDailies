import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { initStorageService, load, save } from '../lib/shared/storage/storage-service.ts';
import { StorageKeyBuilder } from '../lib/shared/storage/keys-builder.ts';

function seedRouteState() {
	if (typeof window === 'undefined') return;
	const pathParts = window.location.pathname.split('/').filter(Boolean);
	const game = pathParts[0] === 'osrs' ? 'osrs' : 'rs3';
	const page = pathParts[1] || 'tasks';
	document.body.dataset.game = game;
	document.body.dataset.mode = page === 'tasks' ? 'all' : page;
}

function ensureStorage() {
	if (typeof window === 'undefined') return;
	initStorageService(load('activeProfile', 'default'));
	if (!load(StorageKeyBuilder.settings(), null)) {
		save(StorageKeyBuilder.settings(), {
			splitDailyTables: true,
			splitWeeklyTables: true,
			showCompletedTasks: false,
			herbTicks: 4,
			growthOffsetMinutes: 0,
			browserNotif: false,
			overviewVisible: true,
		});
	}
}

seedRouteState();
ensureStorage();
