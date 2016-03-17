let Node = require("./node.js");

module.exports = class Web {
  constructor(data) {
    this.map = new Map();
    this.edges = [];

    // loop data.nodes to add lonely nodes
    for (let nodeData of data.nodes) {
      let node = new Node(nodeData.id, nodeData.x, nodeData.y);
      this.map.set(node.id, node);
    }

    // loop data.edges to add neighbors and edges
    for (let edgeData of data.edges) {
      let node1 = this.map.get(edgeData[0]);
      let node2 = this.map.get(edgeData[1]);
      node1.addNeighbor(node2);
      node2.addNeighbor(node1);
      this.edges.push([node1, node2]);
    }
  }
}

// deprecated
// loop again to add neighbors
// for (let d of data) {
//   let node = this.map.get(d.id);
//   let nodeId = node.id;
//   for (let neighborId of d.nodeIds) {
//     let neighbor = this.map.get(neighborId);
//     neighbor.addNeighbor(node);
//     node.addNeighbor(neighbor);
//   }
// }
