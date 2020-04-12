const { Board, GRID_TYPES } = require('./Board');
const Player = require('./Player');
const Node = require('./Node');
const Agent = require('../agent/Agent');

const MAX_TURNS = 1000;
const names = ['RED', 'BLUE', 'PINK', 'BLACK'];
const colors = ['0xc94524', '0x2469c9', '0xf092f0', '0x242120'];

const getScaleZeroToOneFunction = values => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return val => ((val - min) / (max - min)) || 0;
};

const gaussianNormalization = values => {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.map(v => (v - mean) ** 2).reduce((s, v) => s + v, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return val => (val - mean) / stdDev;
};

class Game {
  /**
   *
   * @param {Agent[]} agents A game object.
   */
  constructor(agents) {
    this.board = new Board();
    this.players = new Array(agents.length).fill(0).map((a, idx) => new Player(this, names[idx], colors[idx]));
    agents.forEach((agent, idx) => agent.setPlayer(this.players[idx]));
    this.nodes = this.createNodes();
    this.nodeDict = this.nodes.reduce((dict, node) => ({ ...dict, [node.id]: node }), {});
    this.connections = this.indexConnections();
    this.paused = true;
    this.agents = agents;
    this.currentTurn = 0;
    this.timer = null;
    this.diceRoll = null;
    this.finished = false;
    this.log = [];
    this.numTurns = 0;
    this.turns = [];
  }

  /**
   * @returns {Node[]}
   */
  createNodes() {
    let nodes = [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    ];

    nodes = nodes.map((row, y) => row.map((active, x) => (active ? new Node(x, y) : null)));

    const offsets = [2, 1, 0, 1, 2];
    this.board.tiles.forEach(tile => {
      tile.addNode(nodes[tile.y][2 * tile.x + offsets[tile.y]]);
      tile.addNode(nodes[tile.y][2 * tile.x + offsets[tile.y] + 1]);
      tile.addNode(nodes[tile.y][2 * tile.x + offsets[tile.y] + 2]);
      tile.addNode(nodes[tile.y + 1][2 * tile.x + offsets[tile.y] + 2]);
      tile.addNode(nodes[tile.y + 1][2 * tile.x + offsets[tile.y] + 1]);
      tile.addNode(nodes[tile.y + 1][2 * tile.x + offsets[tile.y]]);
    });

    nodes.forEach(row => row.forEach(node => {
      if (!node) return;
      if (!((node.x % 2 === 1 && node.y % 2 === 0) || (node.x % 2 === 0 && node.y % 2 === 1))
        && nodes[node.y + 1] && nodes[node.y + 1][node.x]) node.addConnection(nodes[node.y + 1][node.x]);
      if (!((node.x % 2 === 1 && node.y % 2 === 1) || (node.x % 2 === 0 && node.y % 2 === 0))
        && nodes[node.y - 1] && nodes[node.y - 1][node.x]) node.addConnection(nodes[node.y - 1][node.x]);
      if (nodes[node.y] && nodes[node.y][node.x - 1]) node.addConnection(nodes[node.y][node.x - 1]);
      if (nodes[node.y] && nodes[node.y][node.x + 1]) node.addConnection(nodes[node.y][node.x + 1]);
    }));

    return nodes.reduce((nArr, row) => ([...nArr, ...row.filter(r => !!r)]), []);
  }

  indexConnections() {
    let connections = Array.from(this.nodes.reduce((set, node) => {
      node.connections.forEach(c => set.add(`${[node.id, c.id].sort().join(':')}`));
      return set;
    }, new Set()));
    connections = connections.map(c => c.split(':').map(n => this.nodeDict[n]));
    return connections;
  }

  getTurn() {
    return this.currentTurn;
  }

  static rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return {
      dice1,
      dice2,
      total: dice1 + dice2,
    };
  }

  distributeCards() {
    const tiles = this.board.tiles.filter(t => t.value === this.diceRoll.total);
    tiles.forEach(tile => tile.distributeCards());
  }

  checkWinner() {
    return this.agents[this.currentTurn].player.buildings.reduce((sum, b) => sum + b.points, 0) >= 10;
  }

  nextTurn() {
    this.numTurns += 1;
    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    this.diceRoll = Game.rollDice();
    this.distributeCards();
  }

  playTurn() {
    this.nextTurn();
    this.log = [];
    const performedActions = this.agents[this.currentTurn].turn();
    this.turns.push({
      player: this.agents[this.currentTurn].player.name,
      color: this.agents[this.currentTurn].player.color,
      diceRoll: this.diceRoll,
      performedActions,
    });
    if (this.checkWinner()) {
      this.finished = true;
      this.log.push(`PLAYER ${this.agents[this.currentTurn].player.name} WON IN ${this.numTurns} TURNS`);
      this.endGame();
    }
  }

  togglePause() {
    this.paused = !this.paused;
  }

  chooseStartingVillages() {
    this.agents.forEach(agent => {
      const performedActions = agent.chooseStartingVillage();
      this.turns.push({
        player: this.agents[this.currentTurn].player.name,
        color: this.agents[this.currentTurn].player.color,
        diceRoll: this.diceRoll,
        performedActions,
      });
    });
    this.agents.reverse();
    this.agents.forEach(agent => {
      const performedActions = agent.chooseStartingVillage();
      this.turns.push({
        player: this.agents[this.currentTurn].player.name,
        color: this.agents[this.currentTurn].player.color,
        diceRoll: this.diceRoll,
        performedActions,
      });
    });
    this.agents.reverse();
  }

  run() {
    const startTime = new Date().getTime();
    this.chooseStartingVillages();
    while (!this.finished && this.numTurns < MAX_TURNS) {
      this.playTurn();
    }
    if (this.numTurns === MAX_TURNS) this.log.push(`NO WINNER WON IN ${this.numTurns} TURNS`);
    this.time = new Date().getTime() - startTime;
  }

  endGame() {
    clearInterval(this.timer);
  }

  getState(player) {
    // board types STONE:0 | WOOD:1 | WHEAT:2 | BRICKS:3 | SHEEP:4 | DESERT:5
    let boardTypes = this.board.tiles.map(t => GRID_TYPES[t.type]);
    const boardTypeStandard = gaussianNormalization(boardTypes);
    boardTypes = boardTypes.map(v => boardTypeStandard(v));
    // board values
    let boardValues = this.board.tiles.map(t => t.value || 0);
    const boardValuesStandard = gaussianNormalization(boardValues);
    boardValues = boardValues.map(v => boardValuesStandard(v));
    // buildings on nodes
    const buildings = this.nodes.map(n => {
      if (!n.building) return 0;
      const playerBuilding = n.building.player.id === player.id;
      const buildingType = n.building.type === 'VILLAGE' ? 0.5 : 1;
      return playerBuilding ? 0 + buildingType : 0 - buildingType;
    });
    // roads on connections
    const roads = this.connections.map(c => {
      let road;
      if (c[0].roads === 0 || c[1].roads === 0) return 0;
      c[0].roads.some(r0 => {
        const idx = c[1].roads.findIndex(r => r.id === r0.id);
        if (idx > -1) {
          road = c[1].roads[idx];
          return true;
        }
        return false;
      });
      if (!road) return 0;
      const playerRoad = road.player.id === player.id;
      return playerRoad ? 1 : -1;
    });
    let cards = Object.values(player.cards);
    const cardsStandard = getScaleZeroToOneFunction(cards);
    cards = cards.map(v => cardsStandard(v));
    return [
      ...boardTypes,
      ...boardValues,
      ...buildings,
      ...roads,
      ...cards,
    ];
  }

  toJSON() {
    return {
      board: this.board,
      players: this.players,
      diceRoll: this.diceRoll,
      log: this.log,
    };
  }
}

module.exports = Game;
