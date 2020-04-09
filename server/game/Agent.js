const randomAction = actions => actions[Math.floor(Math.random() * actions.length)];

class Agent {
  constructor(player, strategy = 'random') {
    this.player = player;
    this.strategy = strategy;
    this.game = player.game;
  }

  chooseAction(actions) {
    if (this.strategy === 'random') return randomAction(actions);
    return randomAction(actions);
  }

  chooseStartingVillage() {
    const availableNodes = this.game.nodes.filter(n => !n.building && !n.connections.some(c => c.building));
    const node = this.chooseAction(availableNodes);
    this.player.addBuilding(node);
    this.player.addRoad([node, this.chooseAction(node.connections)]);
  }

  turn() {
    let action = this.chooseAction(this.player.getActions());
    while (action !== 0) {
      this.player.performAction(action);
      action = this.chooseAction(this.player.getActions());
    }
  }
}

module.exports = Agent;
