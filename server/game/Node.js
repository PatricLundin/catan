const { v4: uuidv4 } = require('uuid');

class Node {
  constructor(x, y) {
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.building = null;
    this.roads = [];
    this.connections = [];
    this.index = null;
  }

  setIndex(idx) {
    this.index = idx;
  }

  addConnection(node) {
    this.connections.push(node);
  }

  setBuilding(building) {
    this.building = building;
  }

  addRoad(road) {
    this.roads.push(road);
  }

  getFreeConnections() {
    return this.connections.filter(n => !n.roads.some(r => this.roads.map(t => t.id).includes(r.id)));
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      idx: this.index,
      connections: this.connections.map(n => ({ x: n.x, y: n.y })),
    };
  }
}

module.exports = Node;
