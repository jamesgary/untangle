let GameGraph = require("./game_graph.js");

let GraphGenerators = require("./graph_generators.js");
let M = require("./maths.js");
let Maths = new M();

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let TRANSPARENT = 'rgba(255,255,255,0)';

let LASSO_STROKE_COLOR = 'rgba(0,0,0,.9)';
let LASSO_LINE_DASH = [5, 5];
let LASSO_STROKE_WIDTH = 1;

// customizable options
let Q = {
  // nodes
  nodeCount:        10,
  nodeSpeed:        1,
  nodeRad:          20,
  outlineThickness: 3,

  nodeFill:            '#fdd542',
  nodeOutline:         '#995522',
  nodeHoverFill:       '#245ddf',
  nodeHoverOutline:    '#062c63',
  nodeNeighborFill:    '#dd4444',
  nodeNeighborOutline: '#4e3333',
  nodeSelectFill:      '#ffffb2',
  nodeSelectOutline:   '#995522',

  // edges
  edgeThickness: 4,
  edgeOpacity: 60,
  edgeColor: '#0057d4',
};

let DEFAULT_STATE       = "default";
let HOVER_STATE         = "hover";
let DRAG_STATE          = "drag";
let SELECT_OPEN_STATE   = "select_open";
let SELECT_CLOSED_STATE = "select_closed";
let SELECT_DRAG_STATE   = "select_drag";

let currentState = DEFAULT_STATE;

module.exports = class Game {
  constructor(canvas) {
    let edges = GraphGenerators.generateTantalo({numLines: Q.nodeCount});
    this.graph = new GameGraph(edges, WIDTH, HEIGHT);
    this.canvas = canvas;
    this.$canvas = $(canvas);
    this.ctx = canvas.getContext("2d");

    this.lastTickTime = Date.now();
  }

  start() {
    this.canvas.addEventListener('mousemove', this.mousemove.bind(this));
    this.canvas.addEventListener('mousedown', this.mousedown.bind(this));
    this.canvas.addEventListener('mouseup', this.mouseup.bind(this));
    let self = this;

    for (let opt in Q) {
      var startingVal = localStorage.getItem(opt) || Q[opt];
      $('#' + opt).val(startingVal).on('change keydown input', function(e) {
        Q[opt] = e.target.value;
        localStorage.setItem(opt, Q[opt]);
        self.is_dirty = true;

        if (opt == 'nodeCount') {
          // restart game if changing node count
          let edges = GraphGenerators.generateTantalo({numLines: Q.nodeCount});
          self.graph = new GameGraph(edges, WIDTH, HEIGHT);
        }
      }).trigger('change');
    }

    $('#clearLocalStorage').on('click', function() {
      $('#printLocalStorage').click();
      for (let opt in Q) {
        localStorage.removeItem(opt);
      }
    });

    $('#printLocalStorage').on('click', function() {
      var log = "";
      for (let opt in Q) {
        log += opt + ': ' + localStorage.getItem(opt) + ",\n";
      }
      console.log(log);
    });

    for (let node of this.graph.nodes) {
      node.timeHovered = 0;
      node.timeUnhovered = 0;
    }
    this.is_dirty = true;
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
    for (let node of this.graph.nodes) {
      node.x += Q.nodeSpeed * (Math.random() - .5);
      node.y += Q.nodeSpeed * (Math.random() - .5);
    }

    // no op
  }

  draw(ticksPassed) {
    if (this.is_dirty || Q.nodeSpeed > 0) {
      $("#state").text(currentState);

      // resize and clear canvas
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // draw edges
      this.ctx.strokeStyle = Q.edgeColor;
      this.ctx.lineWidth = Q.edgeThickness;
      this.ctx.globalAlpha = Q.edgeOpacity / 100.0;
      for (let edge of this.graph.edges) {
        this.ctx.beginPath();
        this.ctx.moveTo(edge[0].x, edge[0].y);
        this.ctx.lineTo(edge[1].x, edge[1].y);
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1; // reset opacity

      // draw all nodes (draw bottom first, then top last!)
      this.ctx.lineWidth = Q.outlineThickness;
      for (let i = this.graph.nodes.length - 1; i >= 0; i--) {
        let node = this.graph.nodes[i];
        let innerRad = Q.nodeRad * .25;
        let outerRad = Q.nodeRad * 1.01;
        let offset = Q.nodeRad * -.4;
        let gradient = this.ctx.createRadialGradient(node.x + offset, node.y + offset, innerRad, node.x, node.y, outerRad);

        if (node.isBeingSelected) {
          this.ctx.fillStyle = Q.nodeSelectFill;
          this.ctx.strokeStyle = Q.nodeSelectOutline;
        } else if (node == this.draggedNode) { // draw same as hovered
          this.ctx.fillStyle = Q.nodeHoverFill;
          this.ctx.strokeStyle = Q.nodeHoverOutline;
        } else if (currentState != SELECT_DRAG_STATE && node.isNeighboring) { // only show neighboring if not lasso'd
          this.ctx.fillStyle = Q.nodeNeighborFill;
          this.ctx.strokeStyle = Q.nodeNeighborOutline;
        } else if (node == this.hoveredNode) {
          this.ctx.fillStyle = Q.nodeHoverFill;
          this.ctx.strokeStyle = Q.nodeHoverOutline;
        } else {
          // draw boring node
          this.ctx.fillStyle = Q.nodeFill;
          this.ctx.strokeStyle = Q.nodeOutline;
        }
        this.ctx.beginPath();
        this.ctx.arc (node.x, node.y, Q.nodeRad, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
      }

      if (this.lassoCorner1X) {
        this.ctx.strokeStyle = LASSO_STROKE_COLOR;
        this.ctx.lineWidth = LASSO_STROKE_WIDTH;
        this.ctx.setLineDash(LASSO_LINE_DASH);

        this.ctx.rect(
          this.lassoCorner1X,
          this.lassoCorner1Y,
          this.lassoCorner2X - this.lassoCorner1X,
          this.lassoCorner2Y - this.lassoCorner1Y
        );
        this.ctx.stroke();
      }

      this.is_dirty = false; // all clean!
    }

    // misc
  }

  mousemove(evt) {
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    let xDistToMove;
    let yDistToMove;
    let newHoveredNode = this.getTopTouchingNode(x, y);

    if (this.draggedNode) {
      xDistToMove = x - this.draggedNode.x + this.draggedNodeXOffset;
      yDistToMove = y - this.draggedNode.y + this.draggedNodeYOffset;
    }

    switch (currentState) {
      case DEFAULT_STATE:
        if (newHoveredNode) {
          currentState = HOVER_STATE;
          this.$canvas.css("cursor", "pointer");
        }
        break;
      case HOVER_STATE:
        if (newHoveredNode != this.hoveredNode) {
          if (newHoveredNode == null) {
            currentState = DEFAULT_STATE;
          }
        }
        break;
      case DRAG_STATE:
        this.draggedNode.x += xDistToMove;
        this.draggedNode.y += yDistToMove;
        break;
      case SELECT_OPEN_STATE:
        this.lassoCorner2X = x;
        this.lassoCorner2Y = y;

        let width = Math.abs(this.lassoCorner1X - this.lassoCorner2X);
        let height = Math.abs(this.lassoCorner1Y - this.lassoCorner2Y);
        let centerLassoX = Math.abs(this.lassoCorner1X + this.lassoCorner2X) / 2;
        let centerLassoY = Math.abs(this.lassoCorner1Y + this.lassoCorner2Y) / 2;

        for (let node of this.graph.nodes) {
          let distX = Math.abs(node.x - centerLassoX)
          let distY = Math.abs(node.y - centerLassoY)

          if (distX > (width  / 2 + Q.nodeRad)) { node.isBeingSelected = false; continue; }
          if (distY > (height / 2 + Q.nodeRad)) { node.isBeingSelected = false; continue; }

          if (distX <= (width  / 2) && distY <= (height / 2)) { node.isBeingSelected = true; continue; }

          var dx = distX - width / 2;
          var dy = distY - height / 2;
          node.isBeingSelected = (dx*dx+dy*dy<=(Q.nodeRad*Q.nodeRad));
        }
        break;
      case SELECT_CLOSED_STATE:
        break;
      case SELECT_DRAG_STATE:
        for (let node of this.selectedNodes) {
          node.x += xDistToMove;
          node.y += yDistToMove;
        }
        break;
    }

    this.hoveredNode = newHoveredNode;
    this.is_dirty = true;
  }

  mousedown(evt) {
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;

    switch (currentState) {
      case DEFAULT_STATE:
        // start crosshair to select
        currentState = SELECT_OPEN_STATE;
        this.lassoCorner1X = x;
        this.lassoCorner1Y = y;
        this.lassoCorner2X = x;
        this.lassoCorner2Y = y;
        break;
      case HOVER_STATE:
        currentState = DRAG_STATE;
        this.draggedNode = this.hoveredNode;
        this.draggedNodeXOffset = this.draggedNode.x - x;
        this.draggedNodeYOffset = this.draggedNode.y - y;

        // eh, gotta modify the model
        for (let node of this.draggedNode.nodes) {
          node.isNeighboring = true;
        }
        break;
      case SELECT_CLOSED_STATE:
        if (this.hoveredNode && this.hoveredNode.isBeingSelected) {
          currentState = SELECT_DRAG_STATE;
          this.draggedNode = this.hoveredNode;
          this.draggedNodeXOffset = this.draggedNode.x - x;
          this.draggedNodeYOffset = this.draggedNode.y - y;
        } else {
          currentState = DEFAULT_STATE;
          for (let node of this.selectedNodes) {
            node.isBeingSelected = false;
          }
          this.selectedNodes = [];
          this.mousemove(evt); // trigger a move
          this.mousedown(evt); // re-trigger a click
        }
        break;
    }

    this.mousemove(evt); // trigger a move
    this.is_dirty = true;
  }

  mouseup(evt) {
    switch (currentState) {
      case DRAG_STATE:
        currentState = DEFAULT_STATE;
        for (let node of this.draggedNode.nodes) {
          node.isNeighboring = false;
        }
        this.hoveredNode = null;
        this.draggedNode = null;
        break;
      case SELECT_OPEN_STATE:
        currentState = SELECT_CLOSED_STATE;
        this.lassoCorner1X = null;
        this.lassoCorner1Y = null;
        this.lassoCorner2X = null;
        this.lassoCorner2Y = null;
        this.selectedNodes = [];
        for (let node of this.graph.nodes) {
          if (node.isBeingSelected) {
            this.selectedNodes.push(node);
          }
        }
        this.hoveredNode = null;
        this.draggedNode = null;
        break;
      case SELECT_DRAG_STATE:
        currentState = DEFAULT_STATE;
        for (let node of this.selectedNodes) {
          node.isBeingSelected = false;
        }
        this.hoveredNode = null;
        this.draggedNode = null;
        this.selectedNodes = [];
    }

    let intersectingEdges = this.graph.getIntersectingEdges();
    if (intersectingEdges.length == 0) {
      alert("YOU WIN");
    }

    this.mousemove(evt); // trigger a move
    this.is_dirty = true;
  }

  getTopTouchingNode(x, y) {
    for (let node of this.graph.nodes) {
      if (Maths.distance(x, y, node.x, node.y) <= Q.nodeRad) {
        return node;
      }
    }
    return null;
  }

}
