let Web = require("./web.js");

let WIDTH = 600;
let HEIGHT = 400;

let BG_COLOR = "#fff";
let NODE_OUTLINE_COLOR = "#7A427A";
let NODE_BG_COLOR = "#D490D3";
let OUTLINE_COLOR = "#888";

let NODE_RAD = 10;
let NODE_OUTLINE = 2;

module.exports = class Game {
  constructor(gameData, canvas) {
    this.web = new Web(gameData);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.lastTickTime = Date.now();
  }

  start() {
    this.gameLoop();
  }

  gameLoop() {
    let curTime = Date.now();
    let ticksPassed = curTime - this.lastTickTime;
    this.lastTickTime = curTime;

    this.process(ticksPassed);
    this.draw(ticksPassed);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  process(ticksPassed) {
    // no op
  }

  draw(ticksPassed) {
    // draw bg
    this.ctx.fillStyle = BG_COLOR;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // draw edges
    this.ctx.strokeStyle = OUTLINE_COLOR;
    for (let edge of this.web.edges) {
      this.ctx.beginPath();
      this.ctx.moveTo(edge[0].x, edge[0].y);
      this.ctx.lineTo(edge[1].x, edge[1].y);
      this.ctx.stroke();
    }

    // draw nodes
    this.ctx.fillStyle = NODE_BG_COLOR;
    this.ctx.strokeStyle = NODE_OUTLINE_COLOR;
    for (let node of this.web.map.values()) {
      this.ctx.beginPath();
      this.ctx.arc (node.x, node.y, NODE_RAD, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }
  }
}
