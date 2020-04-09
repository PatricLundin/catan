const { v4: uuidv4 } = require('uuid');

class Road {
  constructor(nodes, player) {
    this.id = uuidv4();
    this.type = 'ROAD';
    this.nodes = nodes;
    this.player = player;
  }

  toJSON() {
    return {
      type: this.type,
      nodes: this.nodes,
    };
  }
}

module.exports = Road;
