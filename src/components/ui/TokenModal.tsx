import React, { useState, useEffect } from 'react';
import * as StorageService from '../../lib/shared/storage/storage-service';

export const TokenModal: React.FC = () => {
	const [exportToken, setExportToken] = useState('');
	const [importToken, setImportToken] = useState('');
	const [isInvalid, setIsInvalid] = useState(false);

	useEffect(() => {
		// Generate the export token when the modal might be opened
		const token = StorageService.buildExportToken();
		setExportToken(token);
	}, []);

	const handleCopy = () => {
		navigator.clipboard.writeText(exportToken);
		const btn = document.getElementById('token-copy');
		if (btn) btn.innerText = 'Copied!';
		setTimeout(() => {
			if (btn) btn.innerText = 'Copy';
		}, 2000);
	};

	const handleImport = () => {
		try {
			const success = StorageService.importProfileToken(importToken);
			if (success) {
				window.location.reload();
			} else {
				setIsInvalid(true);
			}
		} catch (e) {
			setIsInvalid(true);
		}
	};

	return (
		<div id="token-modal" className="modal fade" tabIndex={-1} aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Import / Export Token</h5>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
						<form onSubmit={(e) => e.preventDefault()}>
							<div className="form-group">
								<label htmlFor="token-output">This is your token. Copy it, and then import it on another computer.</label>
								<div className="row pb-3">
									<div className="col-sm-8">
										<input id="token-output" className="form-control" type="text" value={exportToken} readOnly />
									</div>
									<div className="col-sm-2">
										<span className="d-inline-block" tabIndex={0}>
											<button id="token-copy" type="button" className="btn btn-primary" onClick={handleCopy}>Copy</button>
										</span>
									</div>
								</div>
								<div className="row">
									<label htmlFor="token-input">Import your token below. This operation will overwrite your current profile data.</label>
									<div className="col-sm-12">
										<input 
											className={`form-control ${isInvalid ? 'is-invalid' : ''}`} 
											type="text" 
											id="token-input"
											required 
											value={importToken}
											onChange={(e) => {
												setImportToken(e.target.value);
												setIsInvalid(false);
											}}
										/>
										<div id="validation-token-input" className="invalid-feedback">
											That doesn't look right. Check your token and try again.
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
					<div className="modal-footer">
						<button id="token-import" type="button" className="btn btn-primary" onClick={handleImport}>Import</button>
					</div>
				</div>
			</div>
		</div>
	);
};
