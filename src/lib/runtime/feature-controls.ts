import { setSelectedGame } from './game-context.ts';
import { tracker } from '../../stores/tracker.svelte';

export function setupFeatureControls({
	setupProfileControlFeature,
	setupSettingsControlFeature,
	setupViewsControlFeature,
	closeFloatingControls,
	setupGlobalClickCloserHelper,
	setupImportExportFeature,
	buildExportToken,
	importProfileToken,
	setupCustomAddFeature,
	getCustomTasks,
	saveCustomTasks,
	documentRef = document,
	windowRef = window,
}: any) {
	const setupProfile = () => setupProfileControlFeature({ closeFloatingControls, documentRef, windowRef });
	const setupSettings = () => setupSettingsControlFeature({ closeFloatingControls, documentRef });
	const setupViews = () =>
		setupViewsControlFeature({ closeAllFloatingControls: closeFloatingControls, documentRef, windowRef });
	const setupCloser = () => setupGlobalClickCloserHelper(documentRef);

	const setupImportExport = () => {
		setupImportExportFeature({
			documentRef,
			navigatorRef: windowRef.navigator,
			buildExportToken,
			importProfileToken,
			onImport: () => windowRef.location.reload(),
		});
	};

	const setupCustomAdd = () =>
		setupCustomAddFeature({ getCustomTasks, saveCustomTasks, bootstrapRef: windowRef.bootstrap, documentRef });

	const setupNavigation = () => {
		const logo = documentRef.getElementById('navbar-logo');
		if (logo) {
			logo.addEventListener('click', (event: Event) => {
				event.preventDefault();
				setSelectedGame(null);
				tracker.reloadAll();
			});
		}
	};

	return { setupProfile, setupSettings, setupViews, setupCloser, setupImportExport, setupCustomAdd, setupNavigation };
}
