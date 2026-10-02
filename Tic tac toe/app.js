const boxes = [...document.querySelectorAll(".box")];
const modeButtons = [...document.querySelectorAll(".mode-button")];
const gameArea = document.getElementById("gameArea");
const gameStatus = document.getElementById("gameStatus");
const restartButton = document.getElementById("resButton");
const resultDialog = document.getElementById("resultDialog");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const playAgainButton = document.getElementById("playAgainButton");
const quitButton = document.getElementById("quitButton");

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let mode = null;
let currentPlayer = "X";
let gameOver = false;
let computerTimer;

function getBoard() {
  return boxes.map((box) => box.textContent);
}

function getWinningLine(board) {
  return winningLines.find(([first, second, third]) =>
    board[first] && board[first] === board[second] && board[first] === board[third]
  );
}

function minimax(board, isComputerTurn) {
  const winningLine = getWinningLine(board);
  if (winningLine) {
    return { score: board[winningLine[0]] === "O" ? 1 : -1 };
  }
  if (board.every(Boolean)) return { score: 0 };

  let bestMove = -1;
  let bestScore = isComputerTurn ? -Infinity : Infinity;
  const mark = isComputerTurn ? "O" : "X";

  board.forEach((cell, index) => {
    if (cell) return;
    board[index] = mark;
    const score = minimax(board, !isComputerTurn).score;
    board[index] = "";

    if (isComputerTurn ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });

  return { score: bestScore, move: bestMove };
}

function setBoardDisabled(disabled) {
  boxes.forEach((box) => {
    box.disabled = disabled || gameOver || Boolean(box.textContent);
  });
}

function updateStatus() {
  if (mode === "computer") {
    gameStatus.textContent = currentPlayer === "X" ? "Your turn · You are X" : "Computer is thinking…";
  } else if (mode === "two-player") {
    gameStatus.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function showResult(winner, winningLine) {
  gameOver = true;
  setBoardDisabled(true);

  if (winner) {
    winningLine.forEach((index) => boxes[index].classList.add("winnerClass"));
    const winnerName = mode === "computer"
      ? (winner === "X" ? "You" : "Computer")
      : `Player ${winner}`;
    resultTitle.textContent = `${winnerName} wins!`;
    resultMessage.textContent = "A great game. Ready for another round?";
    gameStatus.textContent = `${winnerName} wins`;
  } else {
    resultTitle.textContent = "It's a draw!";
    resultMessage.textContent = "Evenly matched. Want to play again?";
    gameStatus.textContent = "It's a draw";
  }

  resultDialog.showModal();
}

function playMove(index, mark) {
  boxes[index].textContent = mark;
  boxes[index].disabled = true;

  const board = getBoard();
  const winningLine = getWinningLine(board);
  if (winningLine) {
    showResult(mark, winningLine);
    return true;
  }
  if (board.every(Boolean)) {
    showResult(null, null);
    return true;
  }
  return false;
}

function handleCellClick(event) {
  const index = boxes.indexOf(event.currentTarget);
  if (gameOver || boxes[index].textContent) return;
  if (mode === "computer" && currentPlayer !== "X") return;

  const mark = mode === "computer" ? "X" : currentPlayer;
  if (playMove(index, mark)) return;

  if (mode === "computer") {
    currentPlayer = mark === "X" ? "O" : "X";
    updateStatus();
    setBoardDisabled(true);
    computerTimer = window.setTimeout(() => {
      const { move } = minimax(getBoard(), true);
      if (move !== -1 && !playMove(move, "O")) {
        currentPlayer = "X";
        updateStatus();
        setBoardDisabled(false);
      }
    }, 350);
    return;
  }

  currentPlayer = mark === "X" ? "O" : "X";
  updateStatus();
  setBoardDisabled(false);
}

function resetBoard(keepMode = true) {
  window.clearTimeout(computerTimer);
  if (resultDialog.open) resultDialog.close();
  currentPlayer = "X";
  gameOver = false;
  boxes.forEach((box) => {
    box.textContent = "";
    box.classList.remove("winnerClass");
    box.disabled = !mode;
  });

  if (!keepMode) mode = null;
  gameArea.hidden = !mode;
  restartButton.hidden = !mode;
  modeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
  });
  gameStatus.textContent = mode ? "" : "Choose how you want to play.";
  if (mode) updateStatus();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    resetBoard();
  });
});

boxes.forEach((box) => box.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", () => resetBoard());
playAgainButton.addEventListener("click", () => resetBoard());
quitButton.addEventListener("click", () => resetBoard(false));
