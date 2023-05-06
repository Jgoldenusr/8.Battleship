import { createPlayer, createShip, Gameboard } from "./battleship.js";

let P1 = Gameboard("Human");
let P2 = Gameboard("Computer");

let testShip = createShip(0, "TEST");

describe("Ship functions", () => {
  test("ShipFn_0: ship is OK", () => {
    expect(testShip).not.toBe(undefined);
  });

  test("ShipFn_1: is sunk?", () => {
    (function hits() {
      testShip.hit();
      testShip.hit();
      testShip.hit();
      testShip.hit();
    })();
    expect(testShip.isSunk()).toBe(false);
  });

  test("ShipFn_2: sunk after more than 5 hits?", () => {
    (function hits() {
      testShip.hit();
      testShip.hit();
      testShip.hit();
    })();
    expect(testShip.isSunk()).toBe(true);
  });
  test("ShipFn_3: get length", () => {
    expect(testShip.getLength()).toBe(5);
  });
  test("ShipFn_4: get type", () => {
    expect(testShip.getType()).toBe("porta-aviones");
  });
  test("ShipFn_5: get id", () => {
    expect(testShip.getId()).toBe("CTEST");
  });
});

describe("Gameboard functions", () => {
  let anAttack, sunkInfo;
  test("GBFn_0: placing ships", () => {
    expect(P1.placeShip(P1.Player.getShip(0), { x: 1, y: 4 })).toBe(true);
    expect(P1.placeShip(P1.Player.getShip(1), { x: 1, y: 4 })).not.toBe(true);
    expect(P1.placeShip(P1.Player.getShip(1), { x: 1, y: 5 })).not.toBe(true);
    expect(P1.placeShip(P1.Player.getShip(1), { x: 1, y: 8 })).toBe(true);
    expect(P1.placeShip(P1.Player.getShip(2), { x: 7, y: 1 })).toBe(true);
    expect(P1.placeShip(P1.Player.getShip(3), { x: 0, y: 0 })).toBe(true);
    expect(P1.placeShip(P1.Player.getShip(4), { x: 1, y: 6 })).toBe(true);
  });
  test("GBFn_1: finding cells", () => {
    expect(P1.findCell(1, 6)).toStrictEqual({
      canPlace: false,
      coord: { x: 1, y: 6 },
      isOccupiedBy: "PB4H",
      wasHit: false,
    });
    expect(P1.findCell(2, 6)).toStrictEqual({
      canPlace: false,
      coord: { x: 2, y: 6 },
      isOccupiedBy: "PB4H",
      wasHit: false,
    });
  });
  test("GBFn_2: receiving a succesful and failed attack", () => {
    ///first failed attack
    anAttack = P1.receiveAttack(
      P2.Player.attack(P1.getTableInfo(), { x: 5, y: 6 })
    );
    expect(anAttack).toStrictEqual({
      coord: { x: 5, y: 6 },
      hitSomething: false,
      msg: "Human no fue alcanzado en (5,6)!",
      sunkSomething: false,
    });
    P2.Player.watch(anAttack);
    //first successful attack
    anAttack = P1.receiveAttack(
      P2.Player.attack(P1.getTableInfo(), { x: 0, y: 0 })
    );
    expect(anAttack).toStrictEqual({
      coord: { x: 0, y: 0 },
      hitSomething: true,
      msg: "Un barco de Human fue alcanzado en(0,0)!",
      sunkSomething: false,
    });
    P2.Player.watch(anAttack);
    //second successful attack
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 1, y: 0 }))
    );
    //third sucessful attack
    anAttack = P1.receiveAttack(
      P2.Player.attack(P1.getTableInfo(), { x: 2, y: 0 })
    );
    P2.Player.watch(anAttack);
    //did we sunk it?
    expect(anAttack.sunkSomething.isSunk()).toBe(true);
  });
});

describe("Player functions", () => {
  let anAttack;
  test("PlayerFn_0: predicting a shot based on previous shots directinos", () => {
    //first attack
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 8, y: 1 }))
    );
    //second attack
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 7, y: 1 }, "N"))
    );
    //third automatic attack (IA should attack north)
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 6, y: 1 });
    P2.Player.watch(P1.receiveAttack(anAttack));
  });
  test("PlayerFn_1: if the previous shot failed, attack in the opposite direction", () => {
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 9, y: 1 });
    P2.Player.watch(P1.receiveAttack(anAttack));
  });
  test("PlayerFn_2: attacking in the middle of a carrier", () => {
    //attack (randomly cuz no direction)
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 3, y: 4 }))
    );
    //this is randomly but we simulate the north dir given by predictShot
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 2, y: 4 }, "N"))
    );
    //this is a totally predicted shot
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 1, y: 4 }, "N"))
    );
    //a totally predictable failed shot
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 0, y: 4 });
    P2.Player.watch(P1.receiveAttack(anAttack));
    //predicted attack
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 4, y: 4 });
    P2.Player.watch(P1.receiveAttack(anAttack));
    //sunk this shit!
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 5, y: 4 });
    P2.Player.watch(P1.receiveAttack(anAttack));
  });
  test.skip("PlayerFn_2.1: attacking in the middle of a carrier with a blocked cell", () => {
    //this shot is a sure miss
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 0, y: 4 }))
    );
    //attack (randomly cuz no direction)
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 3, y: 4 }))
    );
    //this is randomly but we simulate the north dir given by predictShot
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 2, y: 4 }, "N"))
    );
    //this is a totally predicted shot
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 1, y: 4 }, "N"))
    );
    //predicted attack
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 4, y: 4 });
    P2.Player.watch(P1.receiveAttack(anAttack));
    //sunk this shit!
    anAttack = P2.Player.attack(P1.getTableInfo());
    expect(anAttack).toStrictEqual({ x: 5, y: 4 });
    P2.Player.watch(P1.receiveAttack(anAttack));
  });
  test("PlayerFn_3: testing the markadjcells player function", () => {
    //attack "randomly"
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 3, y: 6 }))
    );
    //hit "randomly"
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 1, y: 8 }))
    );
    //hit "randomly" with dir
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 2, y: 8 }, "S"))
    );
    //fully IA attacks
    P2.Player.watch(P1.receiveAttack(P2.Player.attack(P1.getTableInfo())));
    anAttack = P1.receiveAttack(P2.Player.attack(P1.getTableInfo()));
    expect(anAttack.sunkSomething.isSunk()).toBe(true);
    P2.Player.watch(anAttack);
    //now attack "randomly"
    P2.Player.watch(
      P1.receiveAttack(P2.Player.attack(P1.getTableInfo(), { x: 2, y: 6 }))
    );
    anAttack = P2.Player.attack(P1.getTableInfo());
    //this should always be a north automatic attack
    expect(anAttack).toStrictEqual({ x: 1, y: 6 });
  });
});
//test("", () => {});
