let GameGraph = require("./game_graph.js");
let GraphGenerators = require("./graph_generators.js");

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

// defaults
let COLOR1 = '#40b4ff'
let COLOR2 = '#128ef3'
let COLOR3 = '#0e50ca'
let COLOR4 = '#214ae5'
let EDGE_COLOR = '#3670fe'

let NODE_RAD = 10;

module.exports = class Game {
  constructor(canvas) {
    let edges = GraphGenerators.generateTantalo({numLines: 8});
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
    $('#color1').val(localStorage.getItem('color1') || COLOR1).on('change', function(e) { COLOR1 = e.target.value; localStorage.setItem('color1', COLOR1)});
    $('#color2').val(localStorage.getItem('color2') || COLOR2).on('change', function(e) { COLOR2 = e.target.value; localStorage.setItem('color2', COLOR2)});
    $('#color3').val(localStorage.getItem('color3') || COLOR3).on('change', function(e) { COLOR3 = e.target.value; localStorage.setItem('color3', COLOR3)});
    $('#color4').val(localStorage.getItem('color4') || COLOR4).on('change', function(e) { COLOR4 = e.target.value; localStorage.setItem('color4', COLOR4)});
    $('#edgeColor').val(localStorage.getItem('edgeColor') || EDGE_COLOR).on('change', function(e) { EDGE_COLOR = e.target.value; localStorage.setItem('edgeColor', EDGE_COLOR)});

    $('#edgeColor').trigger('change');
    $('#color1').trigger('change');
    $('#color2').trigger('change');
    $('#color3').trigger('change');
    $('#color4').trigger('change');

    $('#clearLocalStorage').on('click', function() {
      $('#printLocalStorage').click();
      localStorage.removeItem('color1');
      localStorage.removeItem('color2');
      localStorage.removeItem('color3');
      localStorage.removeItem('color4');
      localStorage.removeItem('edgeColor');
    });

    $('#printLocalStorage').on('click', function() {
      console.log("let COLOR1 = '" +  localStorage.getItem('color1') + "'");
      console.log("let COLOR2 = '" +  localStorage.getItem('color2') + "'");
      console.log("let COLOR3 = '" +  localStorage.getItem('color3') + "'");
      console.log("let COLOR4 = '" +  localStorage.getItem('color4') + "'");
      console.log("let EDGE_COLOR = '" +  localStorage.getItem('edgeColor') + "'");
    });
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
    // resize and clear canvas
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // draw edges
    this.ctx.strokeStyle = EDGE_COLOR;
    this.ctx.lineWidth = 1;
    for (let edge of this.graph.edges) {
      this.ctx.beginPath();
      this.ctx.moveTo(edge[0].x, edge[0].y);
      this.ctx.lineTo(edge[1].x, edge[1].y);
      this.ctx.stroke();
    }

    // draw nodes
    this.ctx.strokeStyle = 'rgba(0,0,0,0)';
    for (let node of this.graph.nodes) {
      if (this.hoveredNode != node) {
        let innerRadius = NODE_RAD * .25;
        let outerRadius = NODE_RAD * 1.01;
        let offset = NODE_RAD * -.4;
        let gradient = this.ctx.createRadialGradient(node.x + offset, node.y + offset, innerRadius, node.x, node.y, outerRadius);
        gradient.addColorStop(0.000, COLOR1);
        gradient.addColorStop(0.188, COLOR2);
        gradient.addColorStop(0.825, COLOR3);
        gradient.addColorStop(0.855, COLOR4);
        this.ctx.fillStyle = gradient;

        this.ctx.beginPath();
        this.ctx.arc (node.x, node.y, NODE_RAD, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
      }
    }

    // draw hovered node
    if (this.hoveredNode) {
      let innerRadius = NODE_RAD * .25;
      let outerRadius = NODE_RAD * 1.01;
      let offset = NODE_RAD * -.4;
      let gradient = this.ctx.createRadialGradient(this.hoveredNode.x + offset, this.hoveredNode.y + offset, innerRadius, this.hoveredNode.x, this.hoveredNode.y, outerRadius);
      gradient.addColorStop(0.000, this.shadeBlendConvert(.5, COLOR1));
      gradient.addColorStop(0.188, this.shadeBlendConvert(.2, COLOR2));
      gradient.addColorStop(0.825, this.shadeBlendConvert(.2, COLOR3));
      gradient.addColorStop(0.855, this.shadeBlendConvert(.2, COLOR4));
      this.ctx.fillStyle = gradient;

      this.ctx.beginPath();
      this.ctx.arc (this.hoveredNode.x, this.hoveredNode.y, NODE_RAD, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // draw dragged node
    if (this.draggedNode) {
      let innerRadius = NODE_RAD * .25;
      let outerRadius = NODE_RAD * 1.01;
      let offset = NODE_RAD * -.4;
      let gradient = this.ctx.createRadialGradient(this.hoveredNode.x + offset, this.hoveredNode.y + offset, innerRadius, this.hoveredNode.x, this.hoveredNode.y, outerRadius);
      gradient.addColorStop(0.000, this.shadeBlendConvert(.7, COLOR1));
      gradient.addColorStop(0.188, this.shadeBlendConvert(.3, COLOR2));
      gradient.addColorStop(0.825, this.shadeBlendConvert(.3, COLOR3));
      gradient.addColorStop(0.855, this.shadeBlendConvert(.3, COLOR4));
      this.ctx.fillStyle = gradient;

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
    let now = Date.now();
    let intersectingEdges = this.graph.getIntersectingEdges();
    if (intersectingEdges.length == 0) {
      console.log("YOU WIN");
    }
  }

  getAnyTouchingNode(x, y) {
    for (let node of this.graph.nodes) {
      if (this.distance(x, y, node.x, node.y) <= NODE_RAD) {
        return node;
      }
    }
    return null;
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow(y1 - y2, 2));
  }

  // http://stackoverflow.com/a/13542669
  shadeBlendConvert(p, from, to) {
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; //ErrorCheck
      var r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=this.sbcRip(from),t=this.sbcRip(to);
      if(!f||!t)return null; //ErrorCheck
      if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
      else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
  }

  sbcRip(d) {
    var l=d.length,RGB=new Object();
    if(l>9){
      d=d.split(",");
      if(d.length<3||d.length>4)return null;//ErrorCheck
      RGB[0]=parseInt(d[0].slice(4)),RGB[1]=parseInt(d[1]),RGB[2]=parseInt(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
    }else{
      if(l==8||l==6||l<4)return null; //ErrorCheck
      if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 digit
      d=parseInt(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?Math.round(((d>>24&255)/255)*10000)/10000:-1;
    }
    return RGB;
  }
}
