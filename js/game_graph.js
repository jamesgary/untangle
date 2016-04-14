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
}
