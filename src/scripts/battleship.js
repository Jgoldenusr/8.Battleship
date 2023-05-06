function createShip(type, id) {
  let _length,
    _health,
    _type,
    _id = "",
    axis = "y";
  const hit = function () {
    return _health > 0 ? _health-- : 0;
  };
  const isSunk = function () {
    return _health === 0 ? true : false;
  };
  const getLength = function () {
    return _length;
  };
  const getType = function () {
    return _type;
  };
  const getId = function () {
    return _id;
  };
  switch (type) {
    case 0:
      _length = 5;
      _health = 5;
      _type = "porta-aviones";
      _id = "C" + id;
      break;
    case 1:
      _length = 4;
      _health = 4;
      _type = "acorazado";
      _id = "B" + id;
      break;
    case 2:
      _length = 3;
      _health = 3;
      _type = "destructor";
      _id = "D" + id;
      break;
    case 3:
      _length = 3;
      _health = 3;
      _type = "submarino";
      _id = "S" + id;
      break;
    case 4:
      _length = 2;
      _health = 2;
      _type = "bote-patrulla";
      _id = "PB" + id;
      break;
  }
  return { axis, hit, isSunk, getLength, getType, getId };
}

function createPlayer(type) {
  let _shipsLeft = 5;
  let name = type;
  let shipsArray = [],
    lastHit = [],
    lastHitDir = [],
    availableCells = [],
    unavailableCells = [];

  for (let i = 0; i < _shipsLeft; i++) {
    shipsArray.push(createShip(i, `${i + type[0]}`));
  }
  const randomChoice = function (min, max) {
    //pure, no side effects
    //generic random number generator
    return Math.floor(Math.random() * (max - min) + min);
  };
  const remainingShips = function () {
    //pure no side effects,
    // how many ships are left?
    return _shipsLeft;
  };
  const shipsSunk = function () {
    //reduces shipsLeft
    if (_shipsLeft > 0) _shipsLeft--;
  };
  const getShip = function (index, id = null) {
    //pure no side effects
    //returns a ship by its index or (optionally) by its id
    return shipsArray[index] || shipsArray.find((ship) => ship.getId() === id);
  };
  const findAvailableOrUnavailable = function (x, y, coord = undefined) {
    //pure no side effects
    //this is only used in the watch funct to check the unavailableCells array
    if (coord) {
      let x = coord.x,
        y = coord.y;
      let cell = unavailableCells.find(
        (v) => v.coord.x === x && v.coord.y === y
      );
      return cell ? cell : false;
    }
    //this is used in the markUnvCells func to check the availableCells array
    let cell = availableCells.find((v) => v.coord.x === x && v.coord.y === y);
    return cell === false ? false : cell;
  };
  const checkCell = function (table, x, y, dir) {
    //pure no side effects
    //finds the next cell in a given direction
    let tempvar;
    switch (dir) {
      case "N":
        return (tempvar = table.find(
          (v) => v.coord.x === x - 1 && v.coord.y === y
        ));
      case "E":
        return (tempvar = table.find(
          (v) => v.coord.x === x && v.coord.y === y + 1
        ));
      case "S":
        return (tempvar = table.find(
          (v) => v.coord.x === x + 1 && v.coord.y === y
        ));
      case "W":
        return (tempvar = table.find(
          (v) => v.coord.x === x && v.coord.y === y - 1
        ));
    }
  };
  const predictShot = function (seenTable) {
    //pure no side effects
    let predictedCell, x, y, dir, coord;
    //if the last attack failed and the player hadn't hit something
    if (lastHit.length === 0) {
      return false;
    }
    //if the player hit something for the first time, attack in a random direction
    if (lastHit.length === 1) {
      x = lastHit[0].coord.x;
      y = lastHit[0].coord.y;
      while (!predictedCell) {
        switch (randomChoice(0, 4)) {
          case 0: //NORTH
            predictedCell = checkCell(seenTable, x, y, "N");
            dir = "N";
            break;
          case 1: //EAST
            predictedCell = checkCell(seenTable, x, y, "E");
            dir = "E";
            break;
          case 2: //SOUTH
            predictedCell = checkCell(seenTable, x, y, "S");
            dir = "S";
            break;
          case 3: //WEST
            predictedCell = checkCell(seenTable, x, y, "W");
            dir = "W";
            break;
        }
      }
    }
    //if the player hit something again, keep attacking in that direction
    if (lastHit.length > 1) {
      x = lastHit[lastHit.length - 1].coord.x;
      y = lastHit[lastHit.length - 1].coord.y;

      switch (lastHitDir[lastHitDir.length - 1]) {
        case "N": //NORTH
          predictedCell = checkCell(seenTable, x, y, "N");
          dir = "N";
          break;
        case "E": //EAST
          predictedCell = checkCell(seenTable, x, y, "E");
          dir = "E";
          break;
        case "S": //SOUTH
          predictedCell = checkCell(seenTable, x, y, "S");
          dir = "S";
          break;
        case "W": //WEST
          predictedCell = checkCell(seenTable, x, y, "W");
          dir = "W";
          break;
      }
    }
    //if can't keep attacking in that direction, attack in the opposite direction
    if (lastHit.length > 1 && !predictedCell) {
      x = lastHit[0].coord.x;
      y = lastHit[0].coord.y;
      switch (lastHitDir[lastHitDir.length - 1]) {
        case "N": //NORTH
          predictedCell = checkCell(seenTable, x, y, "S");
          dir = "S";
          break;
        case "E": //EAST
          predictedCell = checkCell(seenTable, x, y, "W");
          dir = "W";
          break;
        case "S": //SOUTH
          predictedCell = checkCell(seenTable, x, y, "N");
          dir = "N";
          break;
        case "W": //WEST
          predictedCell = checkCell(seenTable, x, y, "E");
          dir = "E";
          break;
      }
    }
    if (predictedCell) coord = predictedCell.coord;
    else return false;

    return { coord, dir };
  };
  const watch = function (lastAttack) {
    //if the last attack failed
    if (lastAttack.hitSomething !== true && !lastAttack.sunkSomething) {
      lastHitDir.pop(); //side effect
    }
    //if you hit something
    if (lastAttack.hitSomething === true || lastAttack.sunkSomething) {
      lastHit.push(lastAttack);
    }
    //if you sunk something, restart the array to look for a new ship to sunk
    if (lastAttack.hitSomething === true && lastAttack.sunkSomething) {
      lastHit.forEach((hit) => {
        markUnavailableCells(hit.coord);
      });
      lastHit = [];
      lastHitDir = [];
    }
    return lastAttack;
  };
  const attack = function (table, coord = undefined, dir = undefined) {
    //returns a random coord or a predicted one
    let notSoRandomChoice;
    availableCells = []; //side effect
    //testing only
    if (coord) {
      if (dir) lastHitDir.push(dir);
      return coord;
    }
    //testing only
    //if the cell was hit and is in the unavailable list, ignore it
    table.forEach((cell) => {
      if (!cell.wasHit && !findAvailableOrUnavailable(0, 0, cell.coord))
        availableCells.push(cell);
    });
    //predict a shot (based on previous hits)
    notSoRandomChoice = predictShot(availableCells);
    if (!notSoRandomChoice) {
      return availableCells[randomChoice(0, availableCells.length)].coord;
    }

    lastHitDir.push(notSoRandomChoice.dir);
    return notSoRandomChoice.coord;
  };
  const markUnavailableCells = function (coord) {
    let cell,
      x = coord.x,
      y = coord.y;
    for (let i = 0; i < 8; i++) {
      switch (i) {
        case 0: //N
          cell = findAvailableOrUnavailable(x - 1, y);
          if (cell) unavailableCells.push(cell);
          break;
        case 1: //NE
          cell = findAvailableOrUnavailable(x - 1, y + 1);
          if (cell) unavailableCells.push(cell);
          break;
        case 2: //E
          cell = findAvailableOrUnavailable(x, y + 1);
          if (cell) unavailableCells.push(cell);
          break;
        case 3: //SE
          cell = findAvailableOrUnavailable(x + 1, y + 1);
          if (cell) unavailableCells.push(cell);
          break;
        case 4: //S
          cell = findAvailableOrUnavailable(x + 1, y);
          if (cell) unavailableCells.push(cell);
          break;
        case 5: //SW
          cell = findAvailableOrUnavailable(x + 1, y - 1);
          if (cell) unavailableCells.push(cell);
          break;
        case 6: //W
          cell = findAvailableOrUnavailable(x, y - 1);
          if (cell) unavailableCells.push(cell);
          break;
        case 7: //NW
          cell = findAvailableOrUnavailable(x - 1, y - 1);
          if (cell) unavailableCells.push(cell);
          break;
      }
    }
  };
  //random axis
  if (type !== "Human") {
    shipsArray.forEach(function (ship) {
      if (randomChoice(0, 10) > 5) {
        ship.axis = "y";
      } else {
        ship.axis = "x";
      }
    });
    return {
      name,
      randomChoice,
      remainingShips,
      shipsSunk,
      getShip,
      watch,
      attack,
    };
  } else {
    return {
      name,
      remainingShips,
      shipsSunk,
      getShip,
    };
  }
}

function Gameboard(name, shipsNodeList = undefined) {
  let Player;
  let table = [];
  //methods
  const findCell = function (x, y) {
    let cell = table.find((v) => v.coord.x === x && v.coord.y === y);
    return cell === false ? false : cell;
  };
  const markAdjCells = function (x, y) {
    let cell;
    for (let i = 0; i < 9; i++) {
      switch (i) {
        case 0: //N
          cell = findCell(x - 1, y);
          if (cell) cell.canPlace = false;
          break;
        case 1: //NE
          cell = findCell(x - 1, y + 1);
          if (cell) cell.canPlace = false;
          break;
        case 2: //E
          cell = findCell(x, y + 1);
          if (cell) cell.canPlace = false;
          break;
        case 3: //SE
          cell = findCell(x + 1, y + 1);
          if (cell) cell.canPlace = false;
          break;
        case 4: //S
          cell = findCell(x + 1, y);
          if (cell) cell.canPlace = false;
          break;
        case 5: //SW
          cell = findCell(x + 1, y - 1);
          if (cell) cell.canPlace = false;
          break;
        case 6: //W
          cell = findCell(x, y - 1);
          if (cell) cell.canPlace = false;
          break;
        case 7: //NW
          cell = findCell(x - 1, y - 1);
          if (cell) cell.canPlace = false;
          break;
        case 8: //CENTER
          cell = findCell(x, y);
          if (cell) cell.canPlace = false;
          break;
      }
    }
  };
  const placeShip = function (ship, coord, cb = null, arg = null) {
    let selectedCell;
    if (ship.axis !== "y" && ship.getLength() + coord.y <= 10) {
      //check if all of the rows are empty and have no adjacent ships
      for (
        let i = 0, x = coord.x, y = coord.y;
        i < ship.getLength();
        i++, y++
      ) {
        selectedCell = findCell(x, y);
        if (selectedCell.isOccupiedBy !== "" || selectedCell.canPlace !== true)
          return false;
      }
      //yep, they're empty, now we place the ship and mark the adjacent cells or run the cb
      for (
        let i = 0, x = coord.x, y = coord.y;
        i < ship.getLength();
        i++, y++
      ) {
        if (!cb) {
          selectedCell = findCell(x, y);
          selectedCell.isOccupiedBy = ship.getId();
          markAdjCells(x, y);
        } else {
          cb(arg, x, y);
        }
      }
      return true;
    }
    if (ship.axis !== "x" && ship.getLength() + coord.x <= 10) {
      //check if all of the rows are empty and have no adjacent ships
      for (
        let i = 0, x = coord.x, y = coord.y;
        i < ship.getLength();
        i++, x++
      ) {
        selectedCell = findCell(x, y);
        if (selectedCell.isOccupiedBy !== "" || selectedCell.canPlace !== true)
          return false;
      }
      //yep, they're empty, now we place the ship and mark the adjacent cells or run the cb
      for (
        let i = 0, x = coord.x, y = coord.y;
        i < ship.getLength();
        i++, x++
      ) {
        if (!cb) {
          selectedCell = findCell(x, y);
          selectedCell.isOccupiedBy = ship.getId();
          markAdjCells(x, y);
        } else {
          cb(arg, x, y);
        }
      }
      return true;
    }
    return false;
  };
  const getTableInfo = function () {
    let myIdArray = [];
    table.forEach((cell) => {
      myIdArray.push({
        coord: cell.coord,
        wasHit: cell.wasHit,
      });
    });
    return myIdArray;
  };
  const receiveAttack = function (coord) {
    let position = findCell(coord.x, coord.y);
    // if is empty, it's a miss
    if (position.isOccupiedBy === "") {
      position.wasHit = true; //mark position so it can't be shot twice
      return {
        coord: coord,
        hitSomething: false,
        msg:
          `${Player.name} no fue alcanzado en` +
          ` (${coord.x + "," + coord.y})!`,
        sunkSomething: false,
      };
    } else {
      //if there was a ship there, call the ship's hit function
      let hitShip = Player.getShip(null, position.isOccupiedBy);
      hitShip.hit();
      position.wasHit = true; //mark position
      //the ship was sunk?
      if (hitShip.isSunk()) {
        Player.shipsSunk();
        return {
          coord: coord,
          hitSomething: true,
          msg:
            `Un ${hitShip.getType()} de ${Player.name} fue hundido en` +
            `(${coord.x + "," + coord.y})!`,
          sunkSomething: hitShip,
        };
      } else {
        return {
          coord: coord,
          hitSomething: true,
          msg:
            `Un barco de ${Player.name} fue alcanzado en` +
            `(${coord.x + "," + coord.y})!`,
          sunkSomething: false,
        };
      }
    }
  };
  const checkForGameEnd = function () {
    return Player.remainingShips() > 0 ? false : true;
  };
  const CPU_Play = function (enemyGB, enemyHTMLGrid, renderEnemyGridCB) {
    let attackInfo;
    attackInfo = Player.watch(
      enemyGB.receiveAttack(Player.attack(enemyGB.getTableInfo()))
    );
    renderEnemyGridCB(enemyHTMLGrid, attackInfo);
  };
  //table
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      table.push({
        coord: { x: row, y: col },
        isOccupiedBy: "",
        wasHit: false,
        canPlace: true,
      });
    }
  }
  //player
  Player = createPlayer(name);
  if (shipsNodeList) {
    for (let i = 0; i < 5; i++) {
      let myShip = Player.getShip(i);
      shipsNodeList[i].id = myShip.getId();
    }
  }
  if (name !== "Human") {
    for (let i = 0; i < 5; i++) {
      let myShip = Player.getShip(i);
      while (!placeShip(myShip, Player.attack(getTableInfo())));
    }
  }
  return {
    Player,
    CPU_Play,
    findCell,
    placeShip,
    getTableInfo,
    receiveAttack,
    checkForGameEnd,
  };
}

export { createPlayer, createShip, Gameboard };
