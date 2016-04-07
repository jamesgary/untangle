let Node = require("./node.js");

module.exports = class Web {
  constructor(edges) {
    this.map = new Map();
    this.edges = [];

    // loop data.edges to add neighbors and edges
    for (let edgeData of edges) {
      let nodeId1 = edgeData[0];
      let nodeId2 = edgeData[1];

      // TODO arrange in prettier shape
      let node1 = this.map.get(nodeId1);
      if (!node1) {
        node1 = new Node(nodeId1, 100 * Math.random(), 100 * Math.random());
        this.map.set(nodeId1, node1);
      }

      let node2 = this.map.get(nodeId2);
      if (!node2) {
        node2 = new Node(nodeId2, 100 * Math.random(), 100 * Math.random());
        this.map.set(nodeId2, node2);
      }

      node1.addNeighbor(node2);
      node2.addNeighbor(node1);
      this.edges.push([node1, node2]);
    }
  }
}
