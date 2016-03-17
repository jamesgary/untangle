require("./style.scss");
let Game = require("./game.js");

// game logic
let GAME_DATA = {
  nodes: [
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 200, y: 200 },
    { id: 3, x: 200, y: 100 },
    { id: 4, x: 100, y: 200 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1],
  ]
};

$(function() {
  let game = new Game(GAME_DATA, document.getElementById("canvas"));
  game.start();
});
