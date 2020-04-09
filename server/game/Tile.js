class Tile {
  constructor(idx, type, value) {
    const xValues = [0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 4, 0, 1, 2, 3, 0, 1, 2];
    const yValues = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4];
    this.x = xValues[idx];
    this.y = yValues[idx];
    this.type = type;
    this.value = value;
    this.nodes = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  distributeCards() {
    this.nodes.forEach(node => {
      if (node.building) node.building.getResources(this.type);
    });
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
      value: this.value,
      nodes: this.nodes,
    };
  }
}

module.exports = Tile;
