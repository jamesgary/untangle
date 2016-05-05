module.exports = class Node {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.nodes = [];
    this.states = [{name: "unhovered"}];
  }

  addNeighbor(node) {
    this.nodes.push(node);
  }

  //// sorry, gonna do some draw logic up in here

  //animateHover() {
  //  // gonna show the new image at the bottom of the draw stack, as we fade away
  //  this.states[0] = ;
  //}
}
