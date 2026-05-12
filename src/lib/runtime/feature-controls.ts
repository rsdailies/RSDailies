import { setSelectedGame } from './game-context.ts';

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
	renderApp,
	getCustomTasks,
	saveCustomTasks,
	documentRef = document,
	windowRef = window,
}: any) {
	const setupProfile = () => setupProfileControlFeature({ renderApp, closeFloatingControls, documentRef, windowRef });
	const setupSettings = () => setupSettingsControlFeature({ renderApp, closeFloatingControls, documentRef });
	const setupViews = () =>
		setupViewsControlFeature({ renderApp, closeAllFloatingControls: closeFloatingControls, documentRef, windowRef });
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
		setupCustomAddFeature({ getCustomTasks, saveCustomTasks, renderApp, bootstrapRef: windowRef.bootstrap, documentRef });

	const setupNavigation = () => {
		const logo = documentRef.getElementById('navbar-logo');
		if (logo) {
			logo.addEventListener('click', (event: Event) => {
				event.preventDefault();
				setSelectedGame(null);
				renderApp();
			});
		}
	};

	return { setupProfile, setupSettings, setupViews, setupCloser, setupImportExport, setupCustomAdd, setupNavigation };
}
