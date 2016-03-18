let Web = require("./web.js");

let WIDTH = 600;
let HEIGHT = 400;

let BG_COLOR = "#fff";
let NODE_OUTLINE_COLOR = "#7A427A";
let NODE_BG_COLOR = "#D490D3";
let HOVER_NODE_OUTLINE_COLOR = "#BA429A";
let HOVER_NODE_BG_COLOR = "#E4A0E3";
let DRAG_NODE_OUTLINE_COLOR = "#BF52AA";
let DRAG_NODE_BG_COLOR = "#FFA0E3";
let EDGE_COLOR = "#888";

let NODE_RAD = 10;
let NODE_OUTLINE = 2;

module.exports = class Game {
  constructor(gameData, canvas) {
    this.web = new Web(gameData);
    this.canvas = canvas;
    this.$canvas = $(canvas);
    this.ctx = canvas.getContext("2d");

    this.lastTickTime = Date.now();
  }

  start() {
    this.canvas.addEventListener('mousemove', this.mousemove.bind(this));
    this.canvas.addEventListener('mousedown', this.mousedown.bind(this));
    this.canvas.addEventListener('mouseup', this.mouseup.bind(this));
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
    this.ctx.strokeStyle = EDGE_COLOR;
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

    // draw hovered node
    if (this.hoveredNode) {
      this.ctx.fillStyle = HOVER_NODE_BG_COLOR;
      this.ctx.strokeStyle = HOVER_NODE_OUTLINE_COLOR;
      this.ctx.beginPath();
      this.ctx.arc (this.hoveredNode.x, this.hoveredNode.y, NODE_RAD, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // draw dragged node
    if (this.draggedNode) {
      this.ctx.fillStyle = DRAG_NODE_BG_COLOR;
      this.ctx.strokeStyle = DRAG_NODE_OUTLINE_COLOR;
      this.ctx.beginPath();
      this.ctx.arc (this.draggedNode.x, this.draggedNode.y, NODE_RAD, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // misc
  }

  mousemove(evt) {
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    let newHoveredNode = this.getAnyTouchingNode(x, y);

    if (this.draggedNode) {
      // drag it!
      this.draggedNode.x = x + this.draggedNodeXOffset;
      this.draggedNode.y = y + this.draggedNodeYOffset;
    } else {
      // if we were overlapping and now no longer overlap, set cursor to default
      if (this.hoveredNode) {
        if (!newHoveredNode) {
          this.$canvas.css("cursor", "default");
          this.hoveredNode = null;
        }
      } else { // if we weren't overlapping and are now, set cursor to pointer
        if (newHoveredNode) {
          // found overlap, turn on pointer
          this.$canvas.css("cursor", "pointer");
          this.hoveredNode = newHoveredNode;
        }
      }
    }
  }

  mousedown(evt) {
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    let clickedNode = this.getAnyTouchingNode(x, y);

    if (clickedNode) {
      this.draggedNode = clickedNode;
      this.draggedNodeXOffset = this.draggedNode.x - x;
      this.draggedNodeYOffset = this.draggedNode.y - y;
      // drag it!
      this.draggedNode.x = x + this.draggedNodeXOffset;
      this.draggedNode.y = y + this.draggedNodeYOffset;
    }
  }

  mouseup(evt) {
    this.draggedNode = null;
  }

  getAnyTouchingNode(x, y) {
    for (let node of this.web.map.values()) {
      if (this.distance(x, y, node.x, node.y) <= NODE_RAD) {
        return node;
      }
    }
    return null;
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow(y1 - y2, 2));
  }
}
