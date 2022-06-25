const inititalStates = {
  rnc: 3,
  turn: "P1",
  theme: "light",
  selectedLines: [],
  selectedBoxes: [],
  players: {
    P1: {
      name: "Sina",
      points: 0,
      lines: [],
      boxes: [],
    },
    P2: {
      name: "Player2",
      points: 0,
      lines: [],
      boxes: [],
    },
  },
};

if (!localStorage.getItem("states")) {
  localStorage.setItem("states", JSON.stringify(inititalStates));
}

const states = JSON.parse(localStorage.getItem("states"));

let { rnc, turn, selectedBoxes, selectedLines, theme } = states;
const { players } = states;

const setLocalStorage = () => {
  return localStorage.setItem("states", JSON.stringify(states));
};

document.querySelector(".p1-name").innerHTML = players.P1.name;
document.querySelector(".p2-name").innerHTML = players.P2.name;

const gameContainer = document.querySelector(".grid-template-game");
const finishModal = document.getElementById("finish-game-modal");
const selectSides = document.getElementById("select-sides");
const p1RenameInput = document.getElementById("rename-p1");
const p2RenameInput = document.getElementById("rename-p2");
const toggleDarkMode = document.getElementById("switch");
const options = [...document.getElementsByTagName("option")];
const settingsModalBackDrop = document.getElementById("settings-back-drop");
const finishModalBackDrop = document.getElementById("finish-game-back-drop");
const errorLog = document.getElementById("error");

options.forEach((opt) => {
  +opt.value === rnc && (opt.selected = true);
});

const bgClasses = { P1: "bg-primary", P2: "bg-secondary" };
const hoverClasses = { P1: "hover-primary-light", P2: "hover-secondary-light" };
const statusClasses = { P1: "status-primary", P2: "status-secondary" };

document.querySelector(".p1-name").innerHTML = players.P1.name;
document.querySelector(".p2-name").innerHTML = players.P2.name;
p1RenameInput.value = players.P1.name;
p2RenameInput.value = players.P2.name;

toggleDarkMode.checked = states.theme === "dark";
if (states.theme === "dark") document.body.classList.add("dark-mode");

const useLines = () => {
  return document.querySelectorAll(".line");
};
const useResetBtn = () => {
  return document.getElementById("reset-btn");
};
const useBoxes = () => {
  return document.querySelectorAll(".box");
};
const useP1Points = () => {
  return document.getElementById("p1-points");
};
const useP2Points = () => {
  return document.getElementById("p2-points");
};

const createRows = (numOfRows, j) => {
  let rowsUi = "";
  for (let i = 0; i <= numOfRows; i++) {
    i < numOfRows
      ? (rowsUi += `
      <div class="container">
          <div class="dot"></div>
      </div>
      <div class="container">
          <div class="line h-line" id="h-${j}-${i}"></div>
      </div>
    `)
      : (rowsUi += `
      <div class="container">
          <div class="dot"></div>
      </div>
    `);
  }
  return rowsUi;
};

const createCols = (numOfCols, j) => {
  let colsUi = "";
  for (let i = 0; i <= numOfCols; i++) {
    i < numOfCols
      ? (colsUi += `
      <div class="container">
          <div class='line v-line' id="v-${j}-${i}"></div>
      </div>
      <div class="container">
         <div class="box" id="b-${j}-${i}"></div>
      </div>
      `)
      : (colsUi += `
      <div class="container">
        <div class='line v-line' id="v-${j}-${i}"></div>
      </div>
    `);
  }
  return colsUi;
};

const createGame = (rnc) => {
  gameContainer.setAttribute("data-grid", `${rnc}`);
  for (let i = 0; i < rnc + 1; i++) {
    let content = gameContainer.innerHTML;
    const row = createRows(rnc, i);
    const col = createCols(rnc, i);

    content += row;

    if (i < rnc) {
      content += col;
    }

    gameContainer.innerHTML = content;
  }

  updateGameStatus(turn);
  updateScores();

  const lines = useLines();
  lines.forEach((line) => {
    line.classList.add(hoverClasses[turn]);
    line.addEventListener("click", handleClick);
    players.P1.lines.includes(line.id) && line.classList.add(bgClasses.P1);
    players.P2.lines.includes(line.id) && line.classList.add(bgClasses.P2);
  });

  const boxes = useBoxes();
  boxes.forEach((box) => {
    players.P1.boxes.includes(box.id) && box.classList.add(bgClasses.P1);
    players.P2.boxes.includes(box.id) && box.classList.add(bgClasses.P2);
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

  const lines = useLines();

  lines.forEach((line) => {
    if (!isLineSelected(line)) {
      line.classList.replace(hoverClasses[turn], hoverClasses[nextTurn]);
    }
  });

  turn = nextTurn;
  states.turn = nextTurn;

  updateGameStatus(turn);
  setLocalStorage();
};

const colorLine = (line) => {
  line.classList.remove(hoverClasses[turn]);
  line.classList.add(bgClasses[turn]);
  players[turn].lines = [...players[turn].lines, line.id];
  setLocalStorage();
};

const colorBox = (box) => {
  box.classList.add(bgClasses[turn]);
  players[turn].boxes = [...players[turn].boxes, box.id];
  setLocalStorage();
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
  resetStates();
  const lines = useLines();
  console.log(lines);
  lines.forEach((line) => {
    line.classList.remove(bgClasses.P1, bgClasses.P2);
    line.classList.remove(hoverClasses.P2);
    line.classList.add(hoverClasses.P1);
  });
  const boxes = useBoxes();
  boxes.forEach((box) => {
    box.classList.remove(bgClasses.P1, bgClasses.P2);
  });
  scorring({ reset: true });
  players.P1.lines = [];
  players.P2.lines = [];
  players.P1.boxes = [];
  players.P2.boxes = [];
  updateGameStatus(turn);
  setLocalStorage();
};

const resetStates = () => {
  turn = "P1";
  states.turn = "P1";
  selectedLines = [];
  selectedBoxes = [];
  players.P1 = { ...players.P1, lines: [], boxes: [], points: 0 };
  players.P2 = { ...players.P2, lines: [], boxes: [], points: 0 };
};

const scorring = ({ turn, reset }) => {
  const boxesLength = useBoxes().length;

  if (!reset) {
    turn === "P1" ? (players.P1.points += 15) : (players.P2.points += 15);
    updateScores();
    setLocalStorage();
    if (players.P1.boxes.length + players.P2.boxes.length === boxesLength) {
      console.log("game finished");
      finishGame();
    }
    return;
  }
  updateScores(reset);
  setLocalStorage();
};

const updateScores = (reset = false) => {
  if (!reset) {
    useP1Points().innerHTML = players.P1.points;
    useP2Points().innerHTML = players.P2.points;
    return;
  }
  players.P1.points = 0;
  players.P2.points = 0;
  useP1Points().innerHTML = players.P1.points;
  useP2Points().innerHTML = players.P2.points;
};

const toggleShowFinishModal = (value) => {
  value
    ? finishModalBackDrop.classList.replace("hidden", "block")
    : finishModalBackDrop.classList.replace("block", "hidden");
};

const toggleShowSettingsModal = (value) => {
  value
    ? settingsModalBackDrop.classList.replace("hidden", "block")
    : settingsModalBackDrop.classList.replace("block", "hidden");
};

const finishGame = () => {
  const winner =
    players.P1.points > players.P2.points
      ? players.P1.name
      : players.P2.points > players.P1.points
      ? players.P2.name
      : "";
  const winnerText = document.createElement("div");
  const gamestatsElement = document.createElement("div");

  winnerText.innerHTML = `<div class="text-3xl text-primary flex justify-center mb-10">
    ${!!winner ? `${winner} won` : "No Winner"}
</div>`;
  gamestatsElement.innerHTML = `
<div class="flex justify-between mb-7 text-2xl">
  <div class="w-1/2 text-left">${players.P1.name}</div>
  <div class="w-1/2 text-right">${players.P2.name}</div>
</div>
<div class="flex justify-between  mt-3 ">
<div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1 text-white">${players.P1.points}</div>
<div>points</div>
  <div class="bg-darkGray px-2.5 py-0.5 rounded-full mx-1 text-white">${players.P2.points}</div>
</div>
<div class="flex justify-between mt-3 ">
<div class="bg-darkGray px-2.5 py-0.5 rounded-full text-white mx-1">${players.P1.lines.length}</div>
<div>lines</div>
  <div class="bg-darkGray px-2.5 py-0.5 rounded-full text-white mx-1">${players.P2.lines.length}</div>
</div>
<div class="flex justify-between mt-3 ">
<div class="bg-darkGray px-2.5 py-0.5 rounded-full text-white mx-1">${players.P1.boxes.length}</div>
<div>boxes</div>
  <div class="bg-darkGray px-2.5 py-0.5 rounded-full text-white mx-1">${players.P2.boxes.length}</div>
</div>`;
  finishModal.appendChild(winnerText);
  finishModal.appendChild(gamestatsElement);
  toggleShowFinishModal(true);
};

const updateNames = () => {
  document.querySelector(".p1-name").innerHTML = players.P1.name;
  document.querySelector(".p2-name").innerHTML = players.P2.name;
  updateGameStatus(turn);

  setLocalStorage();
};

const setShowError = (value) => {
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
    !finishModalBackDrop.classList.contains("hidden") &&
      toggleShowFinishModal(false);
    !settingsModalBackDrop.classList.contains("hidden") &&
      errorLog.classList.contains("invisible") &&
      toggleShowSettingsModal(false);
  });
});

const settingsBtn = document.getElementById("settings-btn");
settingsBtn.addEventListener("click", () => toggleShowSettingsModal(true));

settingsModalBackDrop.addEventListener(
  "click",
  (e) =>
    e.target.id === "settings-back-drop" &&
    errorLog.classList.contains("invisible") &&
    toggleShowSettingsModal(false)
);

const settingsForm = document.getElementById("settings-form");
settingsForm.addEventListener("submit", (e) => {
  errorLog.classList.contains("invisible") && toggleShowSettingsModal(false);
  e.preventDefault();
});

p1RenameInput.addEventListener("change", (e) => {
  if (e.target.value.length > 2 && p2RenameInput.value.length > 2) {
    players.P1.name = e.target.value;
    updateNames();
    setShowError(false);
  } else {
    setShowError(true);
  }
});

p2RenameInput.addEventListener("change", (e) => {
  if (e.target.value.length > 2 && p1RenameInput.value.length > 2) {
    players.P2.name = e.target.value;
    updateNames();
    setShowError(false);
  } else {
    setShowError(true);
  }
});

selectSides.addEventListener("change", (e) => {
  gameContainer.innerHTML = null;
  rnc = +e.target.value;
  states.rnc = +e.target.value;
  gameContainer.setAttribute("data-grid", `${rnc}`);
  createGame(rnc);
  resetGame();
  setLocalStorage();
});

toggleDarkMode.addEventListener("click", (e) => {
  if (e.target.checked) {
    states.theme = "dark";
    document.body.classList.add("dark-mode");
    setLocalStorage();
  } else {
    states.theme = "light";
    document.body.classList.remove("dark-mode");
    setLocalStorage();
  }
});
