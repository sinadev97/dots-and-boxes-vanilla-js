let rnc = 3;
const root = document.getElementById("root");
const gameContainer = document.querySelector(".grid-template-game");
const finishModal = document.getElementById("finish-game-modal");
const selectSides = document.getElementById("select-sides");

const bgClasses = { P1: "bg-primary", P2: "bg-secondary" };
const hoverClasses = { P1: "hover-primary-light", P2: "hover-secondary-light" };
const statusClasses = { P1: "status-primary", P2: "status-secondary" };
const initialTurn = "P1";

const useLines = () => {
  return document.querySelectorAll(".line");
};
const useResetBtn = () => {
  return document.getElementById("reset-btn");
};
const useboxes = () => {
  return document.querySelectorAll(".box");
};
const useP1Points = () => {
  return document.getElementById("p1-points");
};
const useP2Points = () => {
  return document.getElementById("p2-points");
};

let turn = initialTurn;

const players = {
  P1: {
    name: "player 1",
    points: 0,
    lines: [],
    boxes: [],
  },
  P2: {
    name: "player 2",
    points: 0,
    lines: [],
    boxes: [],
  },
};

const createCols = (numOfCols, j) => {
  let colsUi = "";
  for (let i = 0; i <= numOfCols; i++) {
    i < numOfCols
      ? (colsUi += `<div class='line v-line' id="v-${j}-${i}"></div><div class="box" id="b-${j}-${i}"></div>`)
      : (colsUi += `<div class='line v-line' id="v-${j}-${i}">
    `);
  }
  return colsUi;
};

const createRows = (numOfRows, j) => {
  let rowsUi = "";
  for (let i = 0; i <= numOfRows; i++) {
    i < numOfRows
      ? (rowsUi += `<div class="dot"></div>
    <div class="line h-line" id="h-${j}-${i}"></div>`)
      : (rowsUi += `<div class="dot"></div>
    `);
  }
  return rowsUi;
};

const createGame = (rnc) => {
  for (let i = 0; i < rnc + 1; i++) {
    const hContainer = document.createElement("div");
    hContainer.classList.add("h-container");

    hContainer.innerHTML = createRows(rnc, i);

    gameContainer.appendChild(hContainer);

    if (i < rnc) {
      const vContainer = document.createElement("div");
      vContainer.classList.add("v-container");

      vContainer.innerHTML = createCols(rnc, i);

      gameContainer.appendChild(vContainer);
    }
  }
  updateGameStatus(turn);
  updateScores();

  const lines = document.querySelectorAll(".line");
  lines.forEach((line) => {
    line.classList.add(hoverClasses[turn]);
    line.addEventListener("click", handleClick);
  });
};

const handleClick = (e) => {
  const line = document.querySelector(`#${e.target.id}`);

  if (isLineSelected(line)) {
    console.log("line is selected");
    return;
  }

  colorLine(line);
  checkBoxesToSolve();
};

const updateGameStatus = (turn) => {
  const statusPlayer = document.querySelector("#turn-status");

  if (turn === "P1") {
    statusPlayer.innerHTML = `${players.P1.name} 's`;
    statusPlayer.classList.replace(bgClasses.P2, bgClasses.P1);
    statusPlayer.classList.remove("text-white");
  } else {
    statusPlayer.innerHTML = `${players.P2.name} 's`;
    statusPlayer.classList.replace(bgClasses.P1, bgClasses.P2);
    statusPlayer.classList.add("text-white");
  }
};

const isLineSelected = (line) => {
  return (
    line.classList.contains("bg-primary") ||
    line.classList.contains("bg-secondary")
  );
};

const isBoxFilled = (box) => {
  return (
    box.classList.contains("bg-primary") ||
    box.classList.contains("bg-secondary")
  );
};

const changeTurn = () => {
  const nextTurn = turn === "P1" ? "P2" : "P1";

  const lines = document.querySelectorAll(".line");

  lines.forEach((line) => {
    if (!isLineSelected(line)) {
      line.classList.replace(hoverClasses[turn], hoverClasses[nextTurn]);
    }
  });

  turn = nextTurn;

  updateGameStatus(turn);
};

const colorLine = (line) => {
  line.classList.remove(hoverClasses[turn]);
  line.classList.add(bgClasses[turn]);
  players[turn].lines = [...players[turn].lines, line];
};

const colorBox = (box) => {
  box.classList.add(bgClasses[turn]);
  players[turn].boxes = [...players[turn].boxes, box];
};

const checkBoxesToSolve = () => {
  const boxes = document.querySelectorAll(".box");
  let isAnybox = false;
  boxes.forEach((box) => {
    if (isBoxSolved(box) && !isBoxFilled(box)) {
      colorBox(box);
      scorring({ turn });
      isAnybox = true;
      return;
    }
  });
  !isAnybox && changeTurn();
};

const isBoxSolved = (box) => {
  const boxId = box.id;
  const i = +boxId.split("-")[1];
  const j = +boxId.split("-")[2];

  const sides = {
    top: document.getElementById(`h-${i}-${j}`),
    right: document.getElementById(`v-${i}-${j + 1}`),
    bottom: document.getElementById(`h-${i + 1}-${j}`),
    left: document.getElementById(`v-${i}-${j}`),
  };

  return (
    isLineSelected(sides.top) &&
    isLineSelected(sides.right) &&
    isLineSelected(sides.bottom) &&
    isLineSelected(sides.left)
  );
};

const resetGame = () => {
  turn = initialTurn;
  const lines = useLines();
  lines.forEach((line) => {
    line.classList.remove(bgClasses.P1, bgClasses.P2);
    line.classList.add(hoverClasses[turn]);
  });
  const boxes = useboxes();
  boxes.forEach((box) => {
    box.classList.remove(bgClasses.P1, bgClasses.P2);
  });
  scorring({ reset: true });
  players.P1.lines = [];
  players.P2.lines = [];
  players.P1.boxes = [];
  players.P2.boxes = [];
  updateGameStatus(turn);
};

const scorring = ({ turn, reset }) => {
  const boxesLength = useboxes().length;

  if (!reset) {
    turn === "P1" ? (players.P1.points += 15) : (players.P2.points += 15);
    updateScores();
    if (players.P1.boxes.length + players.P2.boxes.length === boxesLength) {
      console.log("game finished");
      finishGame();
    }
    return;
  }
  updateScores(reset);
};

const updateScores = (reset = false) => {
  if (!reset) {
    useP1Points().innerHTML = players.P1.points;
    useP2Points().innerHTML = players.P2.points;
    return;
  }
  useP1Points().innerHTML = 0;
  useP2Points().innerHTML = 0;
};

const toggleShowFinishModal = (value) => {
  const finishModalBackDrop = document.getElementById("finish-game-back-drop");
  value
    ? finishModalBackDrop.classList.replace("hidden", "block")
    : finishModalBackDrop.classList.replace("block", "hidden");
};

const toggleShowSettingsModal = (value) => {
  const settingModalBackDrop = document.getElementById("settings-back-drop");
  value
    ? settingModalBackDrop.classList.replace("hidden", "block")
    : settingModalBackDrop.classList.replace("block", "hidden");
};

const finishGame = () => {
  const winner =
    players.P1.points > players.P2.points ? players.P1.name : players.P2.name;
  const gamestatsElement = document.createElement("div");

  gamestatsElement.innerHTML = `<div class="text-3xl text-primary flex justify-center mb-10">
  ${winner} won
</div>
<div class="flex justify-between mb-7 text-2xl text-white">
  <div class="w-1/2 text-left">${players.P1.name}</div>
  <div class="w-1/2 text-right">${players.P2.name}</div>
</div>
<div class="flex justify-between text-white mt-3 ">
<div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1 text-primary">${players.P1.points}</div>
<div>points</div>
  <div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1 text-primary">${players.P2.points}</div>
</div>
<div class="flex justify-between text-white mt-3 ">
<div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1">${players.P1.lines.length}</div>
<div>lines</div>
  <div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1">${players.P2.lines.length}</div>
</div>
<div class="flex justify-between text-white mt-3 ">
<div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1">${players.P1.boxes.length}</div>
<div>boxes</div>
  <div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1">${players.P2.boxes.length}</div>
</div>`;
  finishModal.appendChild(gamestatsElement);
  toggleShowFinishModal(true);
};

const updateNames = () => {
  document.querySelector(".p1-name").innerHTML = players.P1.name;
  document.querySelector(".p2-name").innerHTML = players.P2.name;
  updateGameStatus(turn);
};

const setShowError = (value) => {
  const errorLog = document.getElementById("error");
  if (value) errorLog.classList.replace("invisible", "visible");
  else errorLog.classList.replace("visible", "invisible");
};

createGame(rnc);

const resetBtn = useResetBtn();
resetBtn.addEventListener("click", resetGame);

const modalResetBtns = document.querySelectorAll("#modal-reset-btn");
modalResetBtns.forEach((resetBtn) => {
  resetBtn.addEventListener("click", () => {
    finishModal.innerHTML = "";
    resetGame();
    toggleShowFinishModal(false);
    toggleShowSettingsModal(false);
  });
});

const settingsBtn = document.getElementById("settings-btn");
settingsBtn.addEventListener("click", () => toggleShowSettingsModal(true));

const resumeBtn = document.getElementById("resume-btn");
resumeBtn.addEventListener("click", () => toggleShowSettingsModal(false));

const p1RenameInput = document.getElementById("rename-p1");

p1RenameInput.addEventListener("blur", (e) => {
  if (e.target.value !== players.P1.name && e.target.value.length > 2) {
    players.P1.name = e.target.value;
    updateNames();
    setShowError(false);
  } else if (e.target.value.length < 3) {
    setShowError(true);
  }
});

const p2RenameInput = document.getElementById("rename-p2");

p2RenameInput.addEventListener("blur", (e) => {
  if (e.target.value !== players.P2.name && e.target.value.length > 2) {
    players.P2.name = e.target.value;
    updateNames();
    setShowError(false);
  } else if (e.target.value.length < 3) {
    setShowError(true);
  }
});

selectSides.addEventListener("change", (e) => {
  gameContainer.innerHTML = null;
  rnc = +(e.target.value)
  createGame(rnc)
  resetGame();
});