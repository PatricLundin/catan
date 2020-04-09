class Building {
  constructor(node, player) {
    this.type = 'VILLAGE';
    this.points = 1;
    this.node = node;
    this.player = player;
  }

  getResources(resource) {
    if (this.type === 'VILLAGE') this.player.cards[resource] += 1;
    else if (this.type === 'CITY') this.player.cards[resource] += 2;
  }

  upgrade() {
    this.type = 'CITY';
    this.points = 2;
  }

  toJSON() {
    return {
      type: this.type,
      points: this.points,
      node: this.node,
    };
  }
}

module.exports = Building;
