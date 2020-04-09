const Board = require('./Board');
const Player = require('./Player');
const Node = require('./Node');
const Agent = require('./Agent');

const names = ['RED', 'BLUE', 'BLACK'];
const colors = ['0xc94524', '0x2469c9', '0x242120'];

class Game {
  constructor(numPlayers) {
    this.board = new Board();
    this.players = new Array(numPlayers).fill(0).map((a, idx) => new Player(this, names[idx], colors[idx]));
    this.nodes = this.createNodes();
    this.paused = true;
    this.agents = this.players.map(player => new Agent(player));
    this.currentTurn = 0;
    this.timer = null;
    this.diceRoll = null;
    this.finished = false;
    this.log = [];

    this.startGame();
  }

  createNodes1() {
    this.board.tiles.forEach(tile => {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(pos => {
        if (pos === 'A' && tile.x === 0) {
          const newNode = new Node(`${tile.x}:${tile.y}:${pos}`);
          tile.addNode(newNode);
        } else if (pos === 'B' || pos === 'C') {
          const newNode = new Node(`${tile.x}:${tile.y}:${pos}`);
          tile.addNode(newNode);
        } else if (pos === 'D' && (tile.y === 4 || (tile.y === 2 && tile.x === 4) || (tile.y === 3 && tile.x === 3))) {
          const newNode = new Node(`${tile.x}:${tile.y}:${pos}`);
          tile.addNode(newNode);
        } else if (pos === 'E' && tile.y === 4) {
          const newNode = new Node(`${tile.x}:${tile.y}:${pos}`);
          tile.addNode(newNode);
        } else if (pos === 'F' && tile.x === 0 && tile.y > 1) {
          const newNode = new Node(`${tile.x}:${tile.y}:${pos}`);
          tile.addNode(newNode);
        }
      });
    });
  }

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
    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    this.diceRoll = Game.rollDice();
    this.distributeCards();
  }

  playTurn() {
    this.nextTurn();
    this.log = [];
    this.agents[this.currentTurn].turn();
    if (this.checkWinner()) {
      this.finished = true;
      this.endGame();
    }
  }

  togglePause() {
    this.paused = !this.paused;
  }

  chooseStartingVillages() {
    this.agents.forEach(agent => agent.chooseStartingVillage());
    this.agents.reverse();
    this.agents.forEach(agent => agent.chooseStartingVillage());
    this.agents.reverse();
  }

  startGame() {
    this.chooseStartingVillages();
    this.timer = setInterval(() => {
      if (!this.paused) this.playTurn();
    }, 100);
  }

  endGame() {
    clearInterval(this.timer);
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
