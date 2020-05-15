import { Scene } from 'phaser';
import axios from 'axios';
import io from 'socket.io-client';
import Hexagon from '../objects/hexagon';
import dice1 from '../images/Dices-1.png';
import dice2 from '../images/Dices-2.png';
import dice3 from '../images/Dices-3.png';
import dice4 from '../images/Dices-4.png';
import dice5 from '../images/Dices-5.png';
import dice6 from '../images/Dices-6.png';

const valTogridType = {
  0: 'DESERT',
  1: 'STONE',
  2: 'WOOD',
  3: 'WHEAT',
  4: 'BRICKS',
  5: 'SHEEP',
};

const tileIdxToGrid = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 0, y: 4 },
  { x: 1, y: 4 },
  { x: 2, y: 4 },
];

const roadToNodes = [
  [{ x: 2, y: 0 }, { x: 2, y: 1 }],
  [{ x: 2, y: 0 }, { x: 3, y: 0 }],
  [{ x: 4, y: 0 }, { x: 3, y: 0 }],
  [{ x: 4, y: 1 }, { x: 4, y: 0 }],
  [{ x: 4, y: 0 }, { x: 5, y: 0 }],
  [{ x: 6, y: 0 }, { x: 5, y: 0 }],
  [{ x: 6, y: 0 }, { x: 6, y: 1 }],
  [{ x: 6, y: 0 }, { x: 7, y: 0 }],
  [{ x: 8, y: 0 }, { x: 7, y: 0 }],
  [{ x: 8, y: 0 }, { x: 8, y: 1 }],
  [{ x: 1, y: 1 }, { x: 1, y: 2 }],
  [{ x: 1, y: 1 }, { x: 2, y: 1 }],
  [{ x: 3, y: 1 }, { x: 2, y: 1 }],
  [{ x: 3, y: 1 }, { x: 3, y: 2 }],
  [{ x: 4, y: 1 }, { x: 3, y: 1 }],
  [{ x: 4, y: 1 }, { x: 5, y: 1 }],
  [{ x: 5, y: 1 }, { x: 5, y: 2 }],
  [{ x: 6, y: 1 }, { x: 5, y: 1 }],
  [{ x: 6, y: 1 }, { x: 7, y: 1 }],
  [{ x: 7, y: 1 }, { x: 7, y: 2 }],
  [{ x: 7, y: 1 }, { x: 8, y: 1 }],
  [{ x: 8, y: 1 }, { x: 9, y: 1 }],
  [{ x: 9, y: 2 }, { x: 9, y: 1 }],
  [{ x: 0, y: 3 }, { x: 0, y: 2 }],
  [{ x: 0, y: 2 }, { x: 1, y: 2 }],
  [{ x: 2, y: 2 }, { x: 1, y: 2 }],
  [{ x: 2, y: 3 }, { x: 2, y: 2 }],
  [{ x: 3, y: 2 }, { x: 2, y: 2 }],
  [{ x: 3, y: 2 }, { x: 4, y: 2 }],
  [{ x: 4, y: 2 }, { x: 4, y: 3 }],
  [{ x: 4, y: 2 }, { x: 5, y: 2 }],
  [{ x: 5, y: 2 }, { x: 6, y: 2 }],
  [{ x: 6, y: 3 }, { x: 6, y: 2 }],
  [{ x: 7, y: 2 }, { x: 6, y: 2 }],
  [{ x: 8, y: 2 }, { x: 7, y: 2 }],
  [{ x: 8, y: 2 }, { x: 8, y: 3 }],
  [{ x: 8, y: 2 }, { x: 9, y: 2 }],
  [{ x: 9, y: 2 }, { x: 10, y: 2 }],
  [{ x: 10, y: 3 }, { x: 10, y: 2 }],
  [{ x: 0, y: 3 }, { x: 1, y: 3 }],
  [{ x: 1, y: 4 }, { x: 1, y: 3 }],
  [{ x: 2, y: 3 }, { x: 1, y: 3 }],
  [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  [{ x: 3, y: 4 }, { x: 3, y: 3 }],
  [{ x: 3, y: 3 }, { x: 4, y: 3 }],
  [{ x: 5, y: 3 }, { x: 4, y: 3 }],
  [{ x: 5, y: 3 }, { x: 5, y: 4 }],
  [{ x: 5, y: 3 }, { x: 6, y: 3 }],
  [{ x: 7, y: 3 }, { x: 6, y: 3 }],
  [{ x: 7, y: 3 }, { x: 7, y: 4 }],
  [{ x: 8, y: 3 }, { x: 7, y: 3 }],
  [{ x: 9, y: 3 }, { x: 8, y: 3 }],
  [{ x: 9, y: 3 }, { x: 9, y: 4 }],
  [{ x: 9, y: 3 }, { x: 10, y: 3 }],
  [{ x: 2, y: 4 }, { x: 1, y: 4 }],
  [{ x: 2, y: 5 }, { x: 2, y: 4 }],
  [{ x: 2, y: 4 }, { x: 3, y: 4 }],
  [{ x: 4, y: 4 }, { x: 3, y: 4 }],
  [{ x: 4, y: 4 }, { x: 4, y: 5 }],
  [{ x: 4, y: 4 }, { x: 5, y: 4 }],
  [{ x: 6, y: 4 }, { x: 5, y: 4 }],
  [{ x: 6, y: 5 }, { x: 6, y: 4 }],
  [{ x: 6, y: 4 }, { x: 7, y: 4 }],
  [{ x: 8, y: 4 }, { x: 7, y: 4 }],
  [{ x: 8, y: 4 }, { x: 8, y: 5 }],
  [{ x: 8, y: 4 }, { x: 9, y: 4 }],
  [{ x: 2, y: 5 }, { x: 3, y: 5 }],
  [{ x: 4, y: 5 }, { x: 3, y: 5 }],
  [{ x: 4, y: 5 }, { x: 5, y: 5 }],
  [{ x: 6, y: 5 }, { x: 5, y: 5 }],
  [{ x: 6, y: 5 }, { x: 7, y: 5 }],
  [{ x: 7, y: 5 }, { x: 8, y: 5 }],
];

const nodeIdxToNodePos = [
  { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
  { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
  { x: 8, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 },
  { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 },
  { x: 9, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 },
  { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
  { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
  { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
  { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
  { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
  { x: 9, y: 3 }, { x: 10, y: 3 }, { x: 1, y: 4 },
  { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
  { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 2, y: 5 },
  { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
  { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
];

const nodeToHex = [
  [0], // 2, 0
  [0], // 3, 0
  [0, 1], // 4, 0
  [1], // 5, 0
  [1, 2], // 6, 0
  [2], // 7, 0
  [2], // 8, 0
  [3], // 1, 1
  [0, 3], // 2, 1
  [0, 3, 4], // 3, 1
  [0, 1, 4], // 4, 1
  [1, 4, 5], // 5, 1
  [1, 2, 5], // 6, 1
  [2, 5, 6], // 7, 1
  [2, 6], // 8, 1
  [6], // 9, 1
  [7], // 0, 2
  [3, 7], // 1, 2
  [3, 7, 8], // 2, 2
  [3, 4, 8], // 3, 2
  [4, 8, 9], // 4, 2
  [4, 5, 9], // 5, 2
  [5, 9, 10], // 6, 2
  [5, 6, 10], // 7, 2
  [6, 10, 11], // 8, 2
  [6, 11], // 9, 2
  [11], // 10, 2
  [7], // 0, 3
  [7, 12], // 1, 3
  [7, 8, 12], // 2, 3
  [8, 12, 13], // 3, 3
  [8, 9, 13], // 4, 3
  [9, 13, 14], // 5, 3
  [9, 10, 14], // 6, 3
  [10, 14, 15], // 7, 3
  [10, 11, 15], // 8, 3
  [11, 15], // 9, 3
  [11], // 10, 3
  [12], // 1, 4
  [12, 16], // 2, 4
  [12, 13, 16], // 3, 4
  [13, 16, 17], // 4, 4
  [13, 14, 17], // 5, 4
  [14, 17, 18], // 6, 4
  [14, 15, 18], // 7, 4
  [15, 18], // 8, 4
  [15], // 9, 4
  [16], // 2, 5
  [16], // 3, 5
  [16, 17], // 4, 5
  [17], // 5, 5
  [17, 18], // 6, 5
  [18], // 7, 5
  [18], // 8, 5
];

const parseBoard = boardData => {
  const { types, values, harbors } = boardData;
  const board = types.map((type, idx) => ({
    x: tileIdxToGrid[idx].x,
    y: tileIdxToGrid[idx].y,
    type: valTogridType[type],
    value: values[idx],
    nodes: [],
  }));

  const nodes = nodeIdxToNodePos.map((n, idx) => ({
    x: n.x,
    y: n.y,
    type: 'EMPTY',
    harbor: harbors[idx],
    hexIds: nodeToHex[idx],
  }));
  nodes.forEach(n => n.hexIds.forEach(id => board[id].nodes.push((({
    x: n.x,
    y: n.y,
    harbor: n.harbor,
    connections: [],
  })))));

  board.forEach(b => { // Fix node order issue
    const tmp = b.nodes[3];
    // eslint-disable-next-line
    b.nodes[3] = b.nodes[5];
    // eslint-disable-next-line
    b.nodes[5] = tmp;
  });

  return {
    board,
    nodes,
  };
};

export default class ReplayGameScene extends Scene {
  constructor() {
    super({ key: 'ReplayGameScene' });
    this.socket = io('http://localhost:5000');
    this.size = 70;
    this.buttons = [];
    this.dices = [];
    this.cards = [];
    this.currentTurn = 0;
    this.actionInTurn = 0;
    this.graphics = [];
    this.showOutput = false;
    this.allAactions = null;

    // Socket events
    this.socket.on('completed_game', g => this.initGame(g));
    this.socket.on('all_actions', actions => {
      this.allAactions = actions.reduce((dict, a) => ({ ...dict, [a.id]: a }), {});
      console.log({ allAactions: this.allAactions });
    });
  }

  preload() {
    this.load.image('dice1', dice1);
    this.load.image('dice2', dice2);
    this.load.image('dice3', dice3);
    this.load.image('dice4', dice4);
    this.load.image('dice5', dice5);
    this.load.image('dice6', dice6);
  }

  initiateBoard() {
    if (this.board) this.board.forEach(hex => hex.destroy());
    this.board = this.boardData.map(data => (
      new Hexagon(
        this,
        this.size,
        data.x,
        data.y,
        data.type,
        data.value,
        data.nodes,
      )
    ));
    this.addVisuals();
    this.board.forEach(hex => hex.drawNodes());
  }

  clearBoard() {
    if (this.board) {
      this.board.forEach(hex => {
        hex.clearBuildings();
        hex.clearBoard();
        hex.destroy();
      });
    }
  }

  getTurn() {
    return this.turns[this.currentTurn];
  }

  drawTurn(turn) {
    turn.moves.forEach(move => {
      if (move && move[1] && ['building', 'upgrade'].includes(move[1][1])) {
        const color = move[2] ? this.players[move[2]].color : this.players[turn.player].color;
        const type = move[1][1] === 'building' ? 'VILLAGE' : 'CITY';
        const node = nodeIdxToNodePos[move[1][2]];
        this.board[nodeToHex[move[1][2]][0]].drawBuilding({ x: node.x, y: node.y }, color, type);
      } else if (move && move[1] && move[1][1] === 'road') {
        const color = move[2] ? this.players[move[2]].color : this.players[turn.player].color;
        const nodes = roadToNodes[move[1][2]];
        const hexWithNode = this.board.find(hex => (
          hex.nodes.findIndex(n => n.x === nodes[0].x && n.y === nodes[0].y) > -1
          && hex.nodes.findIndex(n => n.x === nodes[1].x && n.y === nodes[1].y) > -1
        ));
        hexWithNode.drawRoad(nodes, color);
      }
    });
  }

  populateBoard() {
    this.board.forEach(hex => hex.clearBuildings());
    // const parsedData = parseBoard(this.turns[this.currentTurn].performedActions[this.actionInTurn].state);
    // console.log(parsedData);
    // parsedData.roads.forEach(r => {
    //   if (r.type !== 'EMPTY') {
    //     const color = r.type === 'PLAYER_ROAD' ? this.turns[this.currentTurn].color : '0x000000';
    //     const hexWithNode = this.board.find(hex => (
    //       hex.nodes.findIndex(n => n.x === r.nodes[0].x && n.y === r.nodes[0].y) > -1
    //       && hex.nodes.findIndex(n => n.x === r.nodes[1].x && n.y === r.nodes[1].y) > -1
    //     ));
    //     hexWithNode.drawRoad(r.nodes, color);
    //   }
    // });
    // parsedData.buildings.forEach(b => {
    //   if (b.type !== 'EMPTY') {
    //     const color = b.type === 'PLAYER_VILLAGE' || b.type === 'PLAYER_CITY' ? this.turns[this.currentTurn].color : '0x000000';
    //     const type = b.type === 'PLAYER_VILLAGE' || b.type === 'OTHER_VILLAGE' ? 'VILLAGE' : 'CITY';
    //     this.board[b.hexIds[0]].drawBuilding({ x: b.x, y: b.y }, color, type);
    //   }
    // });
    // console.log(this.getTurn());
    // console.log(this);
    this.turns.slice(0, this.currentTurn + 1).forEach(turn => {
      this.drawTurn(turn);
    });
    // moves.forEach(move => {
    //   if (move && move[1] && move[1][1]) console.log(move[1][1]);
    // });
    const { dice_roll: diceRoll } = this.turns[this.currentTurn];
    if (diceRoll) {
      this.dices.forEach(dice => dice.destroy());
      this.dices = [];
      this.drawDice(diceRoll[0]);
      this.drawDice(diceRoll[1]);
      this.board.forEach(tile => tile.highlightValue(diceRoll[2]));
    }
    // if (cards) this.drawCards(cards);
    // this.board.forEach(hex => hex.drawNodes());
    // this.board.forEach(hex => hex.drawConnections());
  }

  drawDice(val) {
    const dice = this.add.image(
      (10 * this.size) + this.dices.length * (this.size / 1.5),
      30,
      `dice${val}`,
    );
    dice.setDisplaySize(this.size / 2, this.size / 2);
    this.dices.push(dice);
    // const graphics = this.add.graphics({
    //   x: 800 + this.dices.length * 20,
    //   y: 30,
    //   fillStyle: {
    //     color: '0xffffff',
    //     alpha: 1,
    //   },
    //   add: true,
    // });
    // graphics.fillRect(0, 0, 30, 30);
    // this.dices.push(graphics);
    // const text = this.add.text(
    //   graphics.x,
    //   graphics.y,
    //   val,
    //   { fontFamily: '"Roboto Condensed"', fontSize: '1.6rem', color: '#000' },
    // );
    // text.x += 5;
    // this.dices.push(text);
  }

  drawCards(cards) {
    if (this.cards) this.cards.forEach(card => card.destroy());
    this.cards = [];
    Object.entries(cards).forEach(([type, amount]) => {
      const text = this.add.text(30, 700 + 30 * this.cards.length, `${type}: ${amount}`, { fill: '#000' });
      text.setBackgroundColor('#8ecaed');
      this.cards.push(text);
    });
  }

  initGame(game) {
    this.clearBoard();
    this.turns = game.turns;
    this.players = game.players.reduce((o, p) => ({ ...o, [p.name]: p }), {});
    this.currentTurn = 0;
    this.actionInTurn = 0;
    const { board, nodes } = parseBoard(game.board);
    console.log({ board, nodes, players: this.players });
    this.boardData = board;
    this.initiateBoard();
    this.populateBoard();
  }

  getGameData() {
    axios.get('http://localhost:5000/game').then(({ data }) => {
      if (data) {
        this.turns = data.turns;
        this.players = data.players.reduce((o, p) => ({ ...o, [p.name]: p }), {});
        this.currentTurn = 0;
        this.actionInTurn = 0;
        const { board, nodes } = parseBoard(data.board);
        console.log({ board, nodes, players: this.players });
        this.boardData = board;
        this.initiateBoard();
        this.populateBoard();
      }
    }).catch(err => {
      console.log(err);
      if (this.timer) this.timer.remove();
    });
  }

  nextTurn() {
    if (this.currentTurn < this.turns.length - 1) {
      this.currentTurn += 1;
      this.actionInTurn = 0;
      // this.prevActionButton.setVisible(false);
      // this.nextActionButton.setVisible(this.turns[this.currentTurn].performedActions.length !== 1);
      this.currentTurnText.setText(`Turn ${this.currentTurn}/${this.turns.length - 1}`);
      this.populateBoard();
    }
  }

  previousTurn() {
    if (this.currentTurn > 0) {
      this.currentTurn -= 1;
      this.actionInTurn = 0;
      this.currentTurnText.setText(`Turn ${this.currentTurn}/${this.turns.length - 1}`);
      this.populateBoard();
    }
  }

  lastTurn() {
    this.currentTurn = this.turns.length - 1;
    this.actionInTurn = 0;
    this.currentTurnText.setText(`Turn ${this.currentTurn + 1}/${this.turns.length}`);
    this.populateBoard();
  }

  firstTurn() {
    this.currentTurn = 0;
    this.actionInTurn = 0;
    this.currentTurnText.setText(`Turn ${this.currentTurn + 1}/${this.turns.length}`);
    this.populateBoard();
  }

  nextActionInTurn() {
    if (this.actionInTurn < this.turns[this.currentTurn].performedActions.length - 1) {
      this.actionInTurn += 1;
      // this.nextActionButton.setVisible(this.turns[this.currentTurn].performedActions.length !== this.actionInTurn + 1);
      // this.prevActionButton.setVisible(true);
      this.currentActionInTurnText.setText(`Action ${this.actionInTurn + 1}/${this.turns[this.currentTurn].performedActions.length}`);
      this.populateBoard();
    }
  }

  previousActionInTurn() {
    if (this.actionInTurn > 0) {
      this.actionInTurn -= 1;
      // this.nextActionButton.setVisible(true);
      // this.prevActionButton.setVisible(this.actionInTurn !== 0);
      this.currentActionInTurnText.setText(`Action ${this.actionInTurn + 1}/${this.turns[this.currentTurn].performedActions.length}`);
      this.populateBoard();
    }
  }

  toggleOutput() {
    this.showOutput = !this.showOutput;
  }

  switchToGameScene() {
    this.scene.start('GameScene');
  }

  addButton(text, clickAction) {
    const updateBoardButton = this.add.text(30, 30 + 30 * this.buttons.length, text, { fill: '#000' });
    updateBoardButton.setBackgroundColor('#8ecaed');
    updateBoardButton.setInteractive();
    updateBoardButton.on('pointerdown', () => {
      clickAction();
    });
    this.buttons.push(updateBoardButton);
    return updateBoardButton;
  }

  addButtons() {
    this.buttons = [];
    this.addButton('Game scene', () => this.switchToGameScene());
    this.addButton('Load game', () => this.socket.emit('play_test_game'));
    this.addButton('First turn', () => this.firstTurn());
    this.addButton('Last turn', () => this.lastTurn());
    this.addButton('Next turn', () => this.nextTurn());
    this.addButton('Prev turn', () => this.previousTurn());
    // this.nextActionButton = this.addButton('Next Action', () => this.nextActionInTurn());
    // this.prevActionButton = this.addButton('Prev Action', () => this.previousActionInTurn());
    // this.addButton('Toggle Output', () => this.toggleOutput());
  }

  addVisuals() {
    console.log({ turn: this.turns });
    this.currentTurnText = this.add.text(375, 10, `Turn ${this.currentTurn}/${this.turns.length - 1}`, { fill: '#000' });
    this.currentTurnText.setBackgroundColor('#8ecaed');
    this.graphics.push(this.currentTurnText);
    // this.currentActionInTurnText = this.add.text(560, 10,
    //   `Action ${this.actionInTurn + 1}/${this.turns[this.currentTurn].performedActions.length}`, { fill: '#000' });
    // this.currentActionInTurnText.setBackgroundColor('#8ecaed');
    // this.graphics.push(this.currentActionInTurnText);
  }

  create() {
    this.cameras.main.setBackgroundColor('#2e91c9');
    this.addButtons();
    console.log(this);
    this.socket.emit('get_all_actions');
  }
}
