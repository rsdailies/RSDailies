import React, { useState, useEffect } from 'react';
import * as StorageService from '../../lib/shared/storage/storage-service';

export const Overview: React.FC<{ currentGame?: string }> = ({ currentGame = 'rs3' }) => {
	const [isViewsOpen, setIsViewsOpen] = useState(false);
	const [pins, setPins] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const savedPins = StorageService.load('rsdailies:overviewPins', {});
		setPins(savedPins);
	}, []);

	const views = [
		{ id: 'all', label: 'All Tasks', href: `/${currentGame}/all` },
		{ id: 'daily', label: 'Daily Tasks', href: `/${currentGame}/daily` },
		{ id: 'weekly', label: 'Weekly Tasks', href: `/${currentGame}/weekly` },
		{ id: 'gathering', label: 'Gathering', href: `/${currentGame}/gathering` },
	];

	return (
		<>
			<div className="overview_header">
				<div className="overview_title">Overview</div>
				<div className="overview_actions">
					<button 
						id="views-button-panel" 
						type="button" 
						className={`btn btn-secondary btn-sm expanding_button ${isViewsOpen ? 'active' : ''}`} 
						title="Views"
						onClick={() => setIsViewsOpen(!isViewsOpen)}
					>
						&#9776;<span className="expanding_text">&nbsp;Views</span>
					</button>
				</div>

				<div id="views-control" style={{ display: isViewsOpen ? 'block' : 'none' }} data-display="none">
					<strong>Views</strong>
					<ul id="views-list">
						{views.map(view => (
							<li key={view.id} className="profile-row">
								<a href={view.href} className="profile-link">
									{view.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div id="overview-content" className="overview_content">
				{/* Pinned tasks will be rendered here via future TrackerRow portal or state sync */}
				{Object.keys(pins).length === 0 && (
					<div className="text-center text-muted small py-4">
						No pinned tasks. Click the &#9733; icon on a task to pin it here.
					</div>
				)}
			</div>
		</>
	);
};
