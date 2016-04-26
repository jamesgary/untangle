let Node = require("./node.js");

module.exports = class GameGraph {
  constructor(edges, width, height) {
    this.nodes = [];
    this.edges = edges;
    this.width = width;
    this.height = height;
    this.edges = [];

    // loop data.edges to add neighbors and edges
    for (let edgeData of edges) {
      let nodeId1 = edgeData[0];
      let nodeId2 = edgeData[1];

      let node1 = this.nodes[nodeId1];
      if (!node1) {
        node1 = new Node(nodeId1, width * Math.random(), height * Math.random());
        this.nodes[nodeId1] = node1;
      }

      let node2 = this.nodes[nodeId2];
      if (!node2) {
        node2 = new Node(nodeId2, width * Math.random(), height * Math.random());
        this.nodes[nodeId2] = node2;
      }

      node1.addNeighbor(node2);
      node2.addNeighbor(node1);
      this.edges.push([node1, node2]);
    }

    // shuffle!

    let a, b;
    for (let i = this.nodes.length; i; i -= 1) {
        a = Math.floor(Math.random() * i);
        b = this.nodes[i - 1];
        this.nodes[i - 1] = this.nodes[a];
        this.nodes[a] = b;
    }

    // now arrange in a circle

    let centerX = this.width / 2;
    let centerY = this.height / 2;
    let radius = Math.min(width, height) * 0.4;
    let angle = 0;
    let i = 0;
    let nodeLength = this.nodes.length;


    for (let node of this.nodes) {
      let rotation = i / nodeLength;
      node.x = centerX + Math.cos(2 * Math.PI * rotation) * radius;
      node.y = centerY + Math.sin(2 * Math.PI * rotation) * radius;
      i++;
    }
  }

  // private

  getIntersectingEdges() {
    let edgeLength = this.edges.length;
    let intersectingEdges = [];
    for (let i = 0; i < edgeLength - 1; i++) {
      let edge1 = this.edges[i];
      for (let j = i; j < edgeLength; j++) {
        let edge2 = this.edges[j];

        // don't check edges that share a node
        if (edge1[0] != edge2[0] &&
            edge1[1] != edge2[0] &&
            edge1[0] != edge2[1] &&
            edge1[1] != edge2[1]) {
          if (this.isIntersecting(this.edges[i][0], this.edges[i][1], this.edges[j][0], this.edges[j][1])) {
            intersectingEdges.push([this.edges[i], this.edges[j]]);
          }
        }
      }
    }
    return intersectingEdges;
  }

  // from http://stackoverflow.com/a/16725715
  ccw(p1, p2, p3) {
    let a = p1.x; let b = p1.y;
    let c = p2.x; let d = p2.y;
    let e = p3.x; let f = p3.y;
    return (f - b) * (c - a) > (d - b) * (e - a);
  }

  isIntersecting(p1, p2, p3, p4) {
    return (this.ccw(p1, p3, p4) != this.ccw(p2, p3, p4)) && (this.ccw(p1, p2, p3) != this.ccw(p1, p2, p4));
  }
}
