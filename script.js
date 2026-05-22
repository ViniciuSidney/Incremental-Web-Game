// ======================================================
// CONFIGURAÇÕES GERAIS
// ======================================================

const SAVE_KEY = 'mySave';


// ======================================================
// REFERÊNCIAS DA INTERFACE
// ======================================================

const ui = {
  // Multiplicador
  pointsMultiplierCounter: document.getElementById('points_mult'),

  // Progresso de nível
  levelPointsProgressCounter: document.getElementById(
    'level_points_progress_c',
  ),
  levelXpProgressCounter: document.getElementById('level_xp_progress_c'),
  levelLevelProgressCounter: document.getElementById(
    'level_level_progress_c',
  ),

  // Pontos
  pointsCounterNumber: document.getElementById('points_c_n'),
  pointsButton: document.getElementById('points_b'),

  // Pontos por clique
  pointsPerClickCounterNumber: document.getElementById('pointspc_c_n'),
  pointsPerClickButton: document.getElementById('pointspc_b'),

  // Pontos por segundo
  pointsPerSecondCounterNumber: document.getElementById('pointsps_c_n'),
  pointsPerSecondButton: document.getElementById('pointsps_b'),

  // Tempo entre ganhos automáticos
  pointsIntervalCounterNumber: document.getElementById('pointsfi_c_n'),

  // Sistema
  saveButton: document.getElementById('save_b'),
  resetButton: document.getElementById('reset_b'),
};


// ======================================================
// ESTADO DO JOGO
// ======================================================

const gameState = {
  points: 0,
  pointsPerClick: 1,
  pointsForEveryTimeInterval: 0,
  millisecondsForEveryPointGain: 1000,
  pointsMultiplier: 1,
};

const upgradeState = {
  pointsPerClickPrice: 5,
  pointsPerClickLevel: 1,
  pointsPerClickIncrease: 1.75,
  pointsPerClickGain: 1,

  pointsForEveryTimeIntervalPrice: 50,
  pointsForEveryTimeIntervalLevel: 1,
  pointsForEveryTimeIntervalIncrease: 2,
  pointsForEveryTimeIntervalGain: 1,
};

const levelState = {
  xp: 0,
  level: 0,

  basePointsForXp: 50,
  pointsForXp: 50,
  xpForLevel: 2,
  maxLevel: 10,

  xpGain: 1,
  levelMultiplierGain: 0.5,

  xpRequirementIncrease: 1,
};


// ======================================================
// FUNÇÕES UTILITÁRIAS
// ======================================================

function formatNumber(number, type = 'round') {
  if (type === 'floor') {
    return Math.floor(number * 100) / 100;
  }

  return Math.round(number * 100) / 100;
}

function getCurrentClickGain() {
  return gameState.pointsPerClick * gameState.pointsMultiplier;
}

function getCurrentAutoGain() {
  return gameState.pointsForEveryTimeInterval * gameState.pointsMultiplier;
}


// ======================================================
// SISTEMA DE PONTOS
// ======================================================

function gainPointsByClick() {
  gameState.points += getCurrentClickGain();
  updateGame();
}

function gainPointsAutomatically() {
  if (gameState.pointsForEveryTimeInterval <= 0) {
    return;
  }

  gameState.points += getCurrentAutoGain();
  updateGame();
}


// ======================================================
// SISTEMA DE UPGRADES
// ======================================================

function buyPointsPerClickUpgrade() {
  const price = formatNumber(upgradeState.pointsPerClickPrice, 'floor');

  if (gameState.points < price) {
    return;
  }

  gameState.points -= price;
  gameState.pointsPerClick += upgradeState.pointsPerClickGain;

  upgradeState.pointsPerClickPrice *= upgradeState.pointsPerClickIncrease;
  upgradeState.pointsPerClickLevel += 1;

  updateGame();
}

function buyPointsPerSecondUpgrade() {
  const price = formatNumber(
    upgradeState.pointsForEveryTimeIntervalPrice,
    'floor',
  );

  if (gameState.points < price) {
    return;
  }

  gameState.points -= price;
  gameState.pointsForEveryTimeInterval +=
    upgradeState.pointsForEveryTimeIntervalGain;

  upgradeState.pointsForEveryTimeIntervalPrice *=
    upgradeState.pointsForEveryTimeIntervalIncrease;
  upgradeState.pointsForEveryTimeIntervalLevel += 1;

  updateGame();
}


// ======================================================
// SISTEMA DE NÍVEL
// ======================================================

function canGainXp() {
  return (
    gameState.points >= levelState.pointsForXp &&
    levelState.level < levelState.maxLevel
  );
}

function gainXp() {
  levelState.xp += levelState.xpGain;
  console.log(`Ganhou +${levelState.xpGain} XP`);

  if (levelState.xp >= levelState.xpForLevel) {
    levelUp();
    return;
  }

  levelState.pointsForXp *= 1.75;
}

function levelUp() {
  levelState.level += 1;
  levelState.xp = 0;

  gameState.points -= levelState.pointsForXp;
  gameState.pointsMultiplier += levelState.levelMultiplierGain;

  levelState.pointsForXp =
    levelState.basePointsForXp *
    (levelState.xpForLevel * 2 - 1) *
    levelState.level;

  levelState.xpForLevel += levelState.xpRequirementIncrease;

  console.log(`Subiu para o nível ${levelState.level}`);
}

function updateLevelSystem() {
  if (!canGainXp()) {
    return;
  }

  gainXp();
}


// ======================================================
// ATUALIZAÇÃO DA INTERFACE
// ======================================================

function updateLevelCounters() {
  ui.levelPointsProgressCounter.innerHTML =
    `Pontos: ( ${formatNumber(gameState.points)} / ${formatNumber(levelState.pointsForXp, 'floor')} ) ➡ +${levelState.xpGain} XP`;

  ui.levelXpProgressCounter.innerHTML =
    `XP: ( ${levelState.xp} / ${levelState.xpForLevel} ) ➡ +1 Level`;

  ui.levelLevelProgressCounter.innerHTML =
    `Level: ( ${levelState.level} / ${levelState.maxLevel} ) ➡ +x${levelState.levelMultiplierGain} Pontos`;
}

function updateCounters() {
  ui.pointsMultiplierCounter.innerHTML =
    `Multiplicador de Pontos: <b>x${formatNumber(gameState.pointsMultiplier)}</b>`;

  ui.pointsCounterNumber.innerHTML = formatNumber(gameState.points);

  ui.pointsPerClickCounterNumber.innerHTML =
    `+${formatNumber(getCurrentClickGain())}`;

  ui.pointsPerSecondCounterNumber.innerHTML =
    `+${formatNumber(getCurrentAutoGain())}`;

  ui.pointsIntervalCounterNumber.innerHTML =
    formatNumber(gameState.millisecondsForEveryPointGain / 1000);
}

function updateButtons() {
  ui.pointsButton.innerHTML =
    `Clique para +<b>${formatNumber(getCurrentClickGain())}</b> Pontos`;

  ui.pointsPerClickButton.innerHTML =
    `+<b>${formatNumber(upgradeState.pointsPerClickGain * gameState.pointsMultiplier)}</b> Pontos por Clique 
    ( ${formatNumber(upgradeState.pointsPerClickPrice)} Pontos ) [ ${upgradeState.pointsPerClickLevel} ]`;

  ui.pointsPerSecondButton.innerHTML =
    `+<b>${formatNumber(upgradeState.pointsForEveryTimeIntervalGain * gameState.pointsMultiplier)}</b> Pontos por Intervalo 
    ( ${formatNumber(upgradeState.pointsForEveryTimeIntervalPrice)} Pontos ) [ ${upgradeState.pointsForEveryTimeIntervalLevel} ]`;
}

function updateUI() {
  updateLevelCounters();
  updateCounters();
  updateButtons();
}


// ======================================================
// SALVAMENTO
// ======================================================

function saveGame() {
  const gameData = {
    game: gameState,
    upgrades: upgradeState,
    level: levelState,
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

function loadGame() {
  const save = localStorage.getItem(SAVE_KEY);

  if (!save) {
    return;
  }

  try {
    const parsedData = JSON.parse(save);

    if (parsedData.game) {
      Object.assign(gameState, parsedData.game);
    }

    if (parsedData.upgrades) {
      Object.assign(upgradeState, parsedData.upgrades);
    }

    if (parsedData.level) {
      Object.assign(levelState, parsedData.level);
    }
  } catch (error) {
    console.error('Erro ao carregar o save:', error);
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}


// ======================================================
// LOOP PRINCIPAL
// ======================================================

function updateGame() {
  updateLevelSystem();
  updateUI();
}


// ======================================================
// EVENTOS
// ======================================================

ui.pointsButton.addEventListener('click', gainPointsByClick);
ui.pointsPerClickButton.addEventListener('click', buyPointsPerClickUpgrade);
ui.pointsPerSecondButton.addEventListener('click', buyPointsPerSecondUpgrade);
ui.saveButton.addEventListener('click', saveGame);
ui.resetButton.addEventListener('click', resetGame);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadGame();
updateGame();

setInterval(
  gainPointsAutomatically,
  gameState.millisecondsForEveryPointGain,
);

setInterval(saveGame, 10000);