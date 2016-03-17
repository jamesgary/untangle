module.exports = class Node {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.nodes = [];
  }

  addNeighbor(node) {
    this.nodes.push(node);
  }
}
