import { GAMES, setSelectedGame } from '../runtime/game-context.ts';

export function renderLandingPage(deps: any) {
	const { renderApp } = deps;
	const mount = document.getElementById('landing-mount');

	if (mount) {
		mount.style.display = '';
		mount.innerHTML = `
      <div class="game-selection-page">
        <div class="game-selection-card">
          <img src="/RSDailies/img/dailyscape.png" alt="RSDailies" class="game-selection-logo">
          <h1>Select Your Game</h1>
          <p>Choose which version of RuneScape you'd like to track today.</p>
          <div class="game-selection-actions">
            <button id="select-rs3" class="btn btn-primary btn-lg px-5">RuneScape 3</button>
            <button id="select-osrs" class="btn btn-warning btn-lg px-5 text-dark">OSRS</button>
          </div>
        </div>
      </div>
    `;

		const rs3Btn = document.getElementById('select-rs3');
		const osrsBtn = document.getElementById('select-osrs');

		if (rs3Btn) {
			rs3Btn.addEventListener('click', () => {
				setSelectedGame(GAMES.RS3);
				renderApp();
			});
		}

		if (osrsBtn) {
			osrsBtn.addEventListener('click', () => {
				setSelectedGame(GAMES.OSRS);
				renderApp();
			});
		}
	}
}
