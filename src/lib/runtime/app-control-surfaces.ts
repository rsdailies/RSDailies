import { setupFeatureControls } from './feature-controls.ts';

export function createRuntimeControls({
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
	const controls = setupFeatureControls({
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
		documentRef,
		windowRef,
	});

	return {
		setupProfileControl: () => controls.setupProfile(),
		setupSettingsControl: () => controls.setupSettings(),
		setupViewsControl: () => controls.setupViews(),
		setupGlobalClickCloser: () => controls.setupCloser(),
		setupImportExport: () => controls.setupImportExport(),
		setupCustomAdd: () => controls.setupCustomAdd(),
		setupNavigation: () => controls.setupNavigation(),
	};
}
