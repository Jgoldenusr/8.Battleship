import "./styles/styles.css";
import { Gameboard } from "./scripts/battleship.js";

import B_S1 from "./img/B-Ship-1.png";
import B_S2 from "./img/B-Ship-2.png";
import B_S3 from "./img/B-Ship-3.png";
import B_S4 from "./img/B-Ship-4.png";
import B_S5 from "./img/B-Ship-5.png";
import R_S1 from "./img/R-Ship-1.png";
import R_S2 from "./img/R-Ship-2.png";
import R_S3 from "./img/R-Ship-3.png";
import R_S4 from "./img/R-Ship-4.png";
import R_S5 from "./img/R-Ship-5.png";
import G_S1 from "./img/G-Ship-1.png";
import G_S2 from "./img/G-Ship-2.png";
import G_S3 from "./img/G-Ship-3.png";
import G_S4 from "./img/G-Ship-4.png";
import G_S5 from "./img/G-Ship-5.png";

//nodes
let P1Grid = document.querySelector(".p1g");
let P1Ships = document.querySelector(".p1sw");
let P2Grid = document.querySelector(".p2g");
let P2Ships = document.querySelector(".p2sw");
let log = document.querySelector(".log-wrapper");
let restartBtn = document.querySelector(".restart-btn");
const popupTrigger = document.querySelector(".popup_button");
const popupHeader = document.querySelector(".popup_header");
const popupText = document.querySelector(".popup_content");

//methods
function togglePopup(msg) {
  popupHeader.textContent = "Fin del juego!";
  popupText.textContent = msg;
  popupTrigger.click();
}
function startGame() {
  let nodeList = P1Grid.querySelectorAll(".cell");
  nodeList.forEach((cell) => {
    cell.removeEventListener("mouseover", mouseOverCell);
  });
  nodeList.forEach((cell) => {
    cell.removeEventListener("mouseout", mouseOutOfCell);
  });
  nodeList.forEach((cell) => {
    cell.removeEventListener("click", placeShipHere);
  });
  let nodeList2 = P2Grid.querySelectorAll(".cell");
  nodeList2.forEach((cell) => {
    cell.addEventListener("click", attackHere);
  });
  nodeList2.forEach((cell) => {
    cell.addEventListener("mouseover", () => {
      cell.classList.toggle("hoveredCell");
    });
  });
  nodeList2.forEach((cell) => {
    cell.addEventListener("mouseout", () => {
      cell.classList.toggle("hoveredCell");
    });
  });
  logMsg("¡Que comience la batalla!");
}
function grids(gameboardNode, isHuman) {
  gameboardNode.setAttribute(
    "style",
    "grid-template-columns: repeat(10, 1fr); grid-template-rows: repeat(10, 1fr);"
  );
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (isHuman) addCellToGrid(gameboardNode, row, col, true);
      else addCellToGrid(gameboardNode, row, col, false);
    }
  }
}
function addCellToGrid(container, aRow, aCol, isHuman) {
  let myCell = document.createElement("div");
  myCell.classList.add("cell");
  myCell.dataset.x = aRow;
  myCell.dataset.y = aCol;
  /*para debug solo
  myCell.textContent = `(${aRow},${aCol})`;
  myCell.style.fontSize = "12px";
  myCell.style.fontFamily = "tenbyFive";
  para debug solo ^^*/
  container.append(myCell);
  if (isHuman) {
    myCell.addEventListener("mouseover", mouseOverCell);
    myCell.addEventListener("mouseout", mouseOutOfCell);
    myCell.addEventListener("click", placeShipHere);
  }
}
function renderGrid(grid, info) {
  if (grid) {
    let cellNode = grid.querySelector(
      `*[data-x="${info.coord.x}"][data-y="${info.coord.y}"]`
    );
    if (info.hitSomething) cellNode.style.backgroundColor = "red";
    if (!info.hitSomething) cellNode.style.backgroundColor = "yellow";
    if (info.sunkSomething) renderShips(info.sunkSomething, "R");
    logMsg(info.msg);
  } else {
    logMsg(info);
  }
}
function renderShips(ship, colorLetter) {
  let sunkShip = document.querySelector(`#${ship.getId()}`);
  switch (ship.getType()) {
    case "porta-aviones":
      sunkShip.src = myShips[`${colorLetter}_S1`];
      break;
    case "acorazado":
      sunkShip.src = myShips[`${colorLetter}_S2`];
      break;
    case "destructor":
      sunkShip.src = myShips[`${colorLetter}_S3`];
      break;
    case "submarino":
      sunkShip.src = myShips[`${colorLetter}_S4`];
      break;
    case "bote-patrulla":
      sunkShip.src = myShips[`${colorLetter}_S5`];
      break;
  }
}
function logMsg(msg) {
  let logMsg = document.createElement("div");
  logMsg.classList.add("log-msg");
  logMsg.textContent = msg;
  log.append(logMsg);
  logMsg.scrollIntoView();
}
function mouseOverCell() {
  //good
  if (!selectedShip.placed) {
    let x = Number(this.dataset.x);
    let y = Number(this.dataset.y);
    P1.placeShip(
      selectedShip,
      { x, y },
      function (grid, x, y) {
        let cellNode;
        cellNode = grid.querySelector(`*[data-x="${x}"][data-y="${y}"]`);
        cellNode.classList.toggle("hoveredCell");
      },
      P1Grid
    );
  }
}
function mouseOutOfCell() {
  //good
  if (!selectedShip.placed) {
    let x = Number(this.dataset.x);
    let y = Number(this.dataset.y);
    P1.placeShip(
      selectedShip,
      { x, y },
      function (grid, x, y) {
        let cellNode;
        cellNode = grid.querySelector(`*[data-x="${x}"][data-y="${y}"]`);
        cellNode.classList.toggle("hoveredCell");
      },
      P1Grid
    );
  }
}
function placeShipHere() {
  let x = Number(this.dataset.x);
  let y = Number(this.dataset.y);

  if (
    !selectedShip.placed &&
    P1.placeShip(
      selectedShip,
      { x, y },
      function (grid, x, y) {
        let cellNode;
        cellNode = grid.querySelector(`*[data-x="${x}"][data-y="${y}"]`);
        cellNode.style.backgroundColor = "blue";
      },
      P1Grid
    )
  ) {
    P1.placeShip(selectedShip, { x, y });
    renderShips(selectedShip, "G");
    selectedShip.placed = true;
    for (let i = 0; i < 5; i++) {
      if (P1.Player.getShip(i).placed) {
        continue;
      } else {
        selectedShip = P1.Player.getShip(i);
        return;
      }
    }
    startGame();
  }
}
function attackHere() {
  if (P1.checkForGameEnd()) {
    togglePopup("¡Has perdido todos tus barcos! Suerte la próxima");
  } else if (P2.checkForGameEnd()) {
    togglePopup("¡Tu rival ha perdido todos sus barcos! ¡Ganaste!");
  } else {
    let attackInfo = P2.receiveAttack({
      x: Number(this.dataset.x),
      y: Number(this.dataset.y),
    });
    renderGrid(P2Grid, attackInfo);
    this.removeEventListener("click", attackHere);
    P2.CPU_Play(P1, P1Grid, renderGrid);
  }
  return;
}
function restart() {
  let myNodeList = P1Grid.querySelectorAll("div");
  myNodeList.forEach((node) => {
    node.remove();
  });
  myNodeList = P2Grid.querySelectorAll("div");
  myNodeList.forEach((node) => {
    node.remove();
  });
  myNodeList = log.querySelectorAll("div");
  myNodeList.forEach((node) => {
    node.remove();
  });
  //new game
  P1 = Gameboard("Human", P1Ships.querySelectorAll(".ship-ico"));
  P2 = Gameboard("Computer", P2Ships.querySelectorAll(".ship-ico"));
  grids(P1Grid, true);
  grids(P2Grid, false);
  selectedShip = P1.Player.getShip(0);
  logMsg(
    "Inicia un nuevo juego, clickea en los botes azules para girarlos y colocalos clicando la matriz izquierda."
  );
  //ships
  for (let i = 0; i < 5; i++) {
    renderShips(P1.Player.getShip(i), "B");
  }
  for (let i = 0; i < 5; i++) {
    renderShips(P2.Player.getShip(i), "G");
  }
}
//juego
let myShips = {
  B_S1,
  B_S2,
  B_S3,
  B_S4,
  B_S5,
  R_S1,
  R_S2,
  R_S3,
  R_S4,
  R_S5,
  G_S1,
  G_S2,
  G_S3,
  G_S4,
  G_S5,
};
let P1 = Gameboard("Human", P1Ships.querySelectorAll(".ship-ico"));
let P2 = Gameboard("Computer", P2Ships.querySelectorAll(".ship-ico"));
grids(P1Grid, true);
grids(P2Grid, false);
let selectedShip = P1.Player.getShip(0);

//evt listeners
P1Ships.querySelectorAll(".ship-ico").forEach((ship) => {
  ship.addEventListener("click", function () {
    let index = Number(this.alt[0]);
    let myShip = P1.Player.getShip(index);
    if (!myShip.placed) {
      myShip.axis === "x" ? (myShip.axis = "y") : (myShip.axis = "x");
      selectedShip = myShip;
    }
  });
});
restartBtn.addEventListener("click", restart);
