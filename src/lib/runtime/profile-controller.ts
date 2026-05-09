import {
	getCurrentProfile,
	initProfileContext,
	loadProfiles,
	removeProfileStorage,
	saveProfiles,
	setProfile,
} from './profile-model.ts';
import { renderProfileHeader, renderProfileRows } from '../ui/profile-view.ts';
import { replaceInteractiveElement, setPanelOpenState } from '../ui/dom-controls.ts';
import { bindFloatingPanelTrigger } from '../ui/panel-controls.ts';

export function updateProfileHeader(profileNameElement = document.getElementById('profile-name')) {
	renderProfileHeader(profileNameElement, getCurrentProfile());
}

export function setupProfileControl({
	renderApp = () => {},
	closeFloatingControls = () => {},
	documentRef = document,
	windowRef = window,
} = {}) {
	const button = replaceInteractiveElement(documentRef.getElementById('profile-button'));
	const panel = documentRef.getElementById('profile-control');
	const list = documentRef.getElementById('profile-list');
	const form = replaceInteractiveElement(documentRef.getElementById('profile-form'));

	if (!button || !panel || !list || !form) return;

	function renderProfiles() {
		renderProfileRows({
			listElement: list,
			profiles: loadProfiles(),
			currentProfile: getCurrentProfile(),
			onSelectProfile: (name: string) => {
				setProfile(name);
				updateProfileHeader();
				renderProfiles();
				renderApp();
			},
			onDeleteProfile: (name: string) => {
				if (name === 'default') return;
				if (!windowRef.confirm(`Delete profile "${name}"? This removes that profile's browser data.`)) return;

				removeProfileStorage(name);

				const next = loadProfiles().filter((profile) => profile !== name);
				saveProfiles(next);

				if (getCurrentProfile() === name) {
					setProfile('default');
				}

				updateProfileHeader();
				renderProfiles();
				renderApp();
			},
		});
	}

	bindFloatingPanelTrigger({
		button,
		panel,
		closePanels: closeFloatingControls,
		onOpen: () => {
			setPanelOpenState(panel, true);
		},
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		const input = documentRef.getElementById('profileName') as HTMLInputElement | null;
		const name = String(input?.value || '').trim();
		if (!name) return;

		const profiles = loadProfiles();
		if (!profiles.includes(name)) {
			profiles.push(name);
			saveProfiles(profiles);
		}

		setProfile(name);
		if (input) input.value = '';

		updateProfileHeader();
		renderProfiles();
		renderApp();

		setPanelOpenState(panel, false);
	});

	updateProfileHeader();
	renderProfiles();
}

export { initProfileContext };
