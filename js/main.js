require("../styles/style.scss");
let Game = require("./game.js");

$(function() {
  let game = new Game(document.getElementById("canvas"));
  game.start();
});
