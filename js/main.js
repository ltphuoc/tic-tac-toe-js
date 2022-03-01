import { TURN, CELL_VALUE, GAME_STATUS } from './constants.js';
import {
  getCellElementList,
  getCurrentTurnElement,
  getGameStatusElement,
  getCellElementAtIdx,
  getReplayButtonElement,
} from './selectors.js';
import { checkGameStatus } from './utils.js';

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let isGameEnded = false;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill('');

function toggleTurn() {
  currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;

  // update turn DOM
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }
}

function updateGameStatus(newGameStatus) {
  gameStatus = newGameStatus;
  const gameStatusElement = getGameStatusElement();
  if (gameStatusElement) gameStatusElement.textContent = newGameStatus;
}

function showReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) replayButton.classList.add('show');
}

function hideReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) replayButton.classList.remove('show');
}

function highlightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error('Invalid winPositions');
  }
  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);
    if (cell) cell.classList.add('win');
  }
}

// MAIN 

function handleCellClick(cell, index) {
  const isClicked = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING;
  if (isClicked || isEndGame) return;

  // set selected cell
  cell.classList.add(currentTurn);

  // update cellValues
  cellValues[index] = currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  // toggle turn
  toggleTurn();

  // checkGameStatus
  const game = checkGameStatus(cellValues);
  switch (game.status) {
    case GAME_STATUS.ENDED: {
      updateGameStatus(game.status);
      showReplayButton();
      break;
    }
    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN: {
      updateGameStatus(game.status);
      showReplayButton();
      highlightWinCells(game.winPositions);
      break;
    }
    default:
    // playing
  }
}

function initCellElementList() {
  const cellElementList = getCellElementList();

  cellElementList.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(cell, index));
  });
}

function resetGame() {
  // reset temp global vars
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => '');
  // reset dom
  // reset game status
  updateGameStatus(GAME_STATUS.PLAYING);
  // reset current turn
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(TURN.CROSS);
  }
  // reset game board
  const cellElementList = getCellElementList();
  for (const cell of cellElementList) {
    cell.className = '';
  }
  // hide replayButton
  hideReplayButton();
}

function initReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) {
    replayButton.addEventListener('click', resetGame);
  }
}

(() => {
  // bind click event for all li elements
  initCellElementList();

  // bind click event for replay button
  initReplayButton();
})();
