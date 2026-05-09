import React, { useEffect, useState } from 'react';

import * as StorageService from '../../lib/shared/storage/storage-service';

export const Profiles: React.FC = () => {
	const [profiles, setProfiles] = useState<string[]>(['default']);
	const [activeProfile, setActiveProfile] = useState<string>('default');
	const [newProfileName, setNewProfileName] = useState('');

	function refresh() {
		setProfiles(StorageService.getAllProfilesGlobal());
		setActiveProfile(StorageService.getActiveProfileGlobal());
	}

	useEffect(() => {
		refresh();
	}, []);

	const handleSwitch = (name: string) => {
		StorageService.setActiveProfile(name);
		window.location.reload();
	};

	const handleCreate = (event: React.FormEvent) => {
		event.preventDefault();
		const nextName = newProfileName.trim();
		if (!nextName) return;

		const nextProfiles = Array.from(new Set([...profiles, nextName]));
		StorageService.saveAllProfilesGlobal(nextProfiles);
		StorageService.setActiveProfile(nextName);
		window.location.reload();
	};

	const handleDelete = (name: string) => {
		StorageService.deleteProfile(name);
		refresh();
	};

	return (
		<div id="profile-control" style={{ display: 'none' }} data-display="none">
			<strong>Profiles</strong>
			<ul id="profile-list" className="list-unstyled mb-3">
				{profiles.map((name) => (
					<li key={name} className="d-flex justify-content-between align-items-center gap-2 py-1">
						<a href="#" onClick={(event) => { event.preventDefault(); handleSwitch(name); }}>
							{name === activeProfile ? 'Current: ' : ''}{name}
						</a>
						{name !== 'default' ? (
							<button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(name)}>
								Delete
							</button>
						) : null}
					</li>
				))}
			</ul>
			<form id="profile-form" autoComplete="off" onSubmit={handleCreate}>
				<div className="row g-2 align-items-center">
					<div className="col-8">
						<input
							type="text"
							className="form-control"
							id="profileName"
							placeholder="New Profile Name"
							maxLength={25}
							required
							value={newProfileName}
							onChange={(event) => setNewProfileName(event.target.value)}
						/>
					</div>
					<div className="col-4">
						<button type="submit" className="btn btn-primary w-100">Create</button>
					</div>
				</div>
			</form>
		</div>
	);
};
