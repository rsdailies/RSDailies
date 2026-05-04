import { GAMES, getSelectedGame, setSelectedGame, subscribeToGameChanges } from '../../core/state/game-context.js';

function ensureGameSelectionPage(documentRef) {
  let page = documentRef.getElementById('game-selection-page');
  if (page) return page;

  page = documentRef.createElement('main');
  page.id = 'game-selection-page';
  page.className = 'container-xl game-selection-page';

  const section = documentRef.createElement('section');
  section.className = 'game-selection-card';
  section.setAttribute('aria-labelledby', 'game-selection-title');

  const logo = documentRef.createElement('img');
  logo.className = 'game-selection-logo';
  logo.src = '/RSDailies/img/dailyscapebig.png';
  logo.alt = 'RSDailies';

  const title = documentRef.createElement('h1');
  title.id = 'game-selection-title';
  title.textContent = 'Choose Your Dailyscape';

  const subtitle = documentRef.createElement('p');
  subtitle.textContent = 'Select a game mode to open the matching tracker workspace.';

  const actions = documentRef.createElement('div');
  actions.className = 'game-selection-actions';

  const rs3Btn = documentRef.createElement('button');
  rs3Btn.type = 'button';
  rs3Btn.className = 'btn btn-primary btn-lg primitive-btn';
  rs3Btn.dataset.gameChoice = 'rs3';
  rs3Btn.textContent = 'RuneScape 3';

  const osrsBtn = documentRef.createElement('button');
  osrsBtn.type = 'button';
  osrsBtn.className = 'btn btn-secondary btn-lg primitive-btn';
  osrsBtn.dataset.gameChoice = 'osrs';
  osrsBtn.textContent = 'Old School RuneScape';

  actions.append(rs3Btn, osrsBtn);
  section.append(logo, title, subtitle, actions);
  page.appendChild(section);


  const overview = documentRef.getElementById('overview-mount');
  overview?.parentNode?.insertBefore(page, overview);
  return page;
}

function createGameButtons(documentRef) {
  if (documentRef.getElementById('game-switcher-control')) return;

  const navRight = documentRef.querySelector('.nav-right');
  if (!navRight) return;

  const li = documentRef.createElement('li');
  li.id = 'game-switcher-control';
  li.className = 'nav-item d-flex align-items-center gap-2 me-2';

  const rs3Btn = documentRef.createElement('button');
  rs3Btn.type = 'button';
  rs3Btn.className = 'btn btn-secondary btn-sm primitive-btn';
  rs3Btn.dataset.gameChoice = 'rs3';
  rs3Btn.textContent = 'RS3';

  const osrsBtn = documentRef.createElement('button');
  osrsBtn.type = 'button';
  osrsBtn.className = 'btn btn-secondary btn-sm primitive-btn';
  osrsBtn.dataset.gameChoice = 'osrs';
  osrsBtn.textContent = 'OSRS';

  li.append(rs3Btn, osrsBtn);

  navRight.insertBefore(li, navRight.firstChild);
}

function bindGameChoices(documentRef) {
  documentRef.querySelectorAll('[data-game-choice]').forEach((button) => {
    if (button.dataset.choiceBound === 'true') return;
    button.dataset.choiceBound = 'true';
    button.addEventListener('click', () => setSelectedGame(button.dataset.gameChoice));
  });
}

function renderGame(documentRef) {
  const game = getSelectedGame();
  const hasGame = game === GAMES.RS3 || game === GAMES.OSRS;

  const dashboard = documentRef.getElementById('dashboard-container');
  const overview = documentRef.getElementById('overview-mount');
  const selection = ensureGameSelectionPage(documentRef);
  const switcher = documentRef.getElementById('game-switcher-control');

  selection.hidden = hasGame;
  if (dashboard) dashboard.hidden = !hasGame;
  if (overview) overview.hidden = !hasGame;
  if (switcher) switcher.hidden = !hasGame;

  documentRef.querySelectorAll('[data-game-choice]').forEach((button) => {
    const active = button.dataset.gameChoice === game;
    button.classList.toggle('btn-primary', active);
    button.classList.toggle('btn-secondary', !active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function setupGameShell(documentRef = document) {
  ensureGameSelectionPage(documentRef);
  createGameButtons(documentRef);
  bindGameChoices(documentRef);
  renderGame(documentRef);
  return subscribeToGameChanges(() => renderGame(documentRef));
}
