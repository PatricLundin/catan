import { Scene } from 'phaser';
import axios from 'axios';
import Hexagon from './objects/hexagon';

// const getActionsType = idx => {
//   if (idx === 0) return 'NOTHING';
//   if (idx > 0 && idx < 55) return 'VILLAGE';
//   if (idx >= 55 && idx < 109) return 'CITY';
//   if (idx >= 109 && idx < 181) return 'ROAD';
//   return 'TRADE';
// };

const valTogridType = {
  '-1.91': 'DESERT',
  '-1.25': 'STONE',
  '-0.59': 'WOOD',
  0.07: 'WHEAT',
  0.73: 'BRICKS',
  1.39: 'SHEEP',
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

const valToGridValue = {
  '-1.96': null,
  '-1.37': 2,
  '-1.08': 3,
  '-0.78': 4,
  '-0.48': 5,
  '-0.19': 6,
  0.41: 8,
  0.7: 9,
  1: 10,
  1.29: 11,
  1.59: 12,
};

const nodeValToBuilding = {
  '-1': 'OTHER_CITY',
  '-0.5': 'OTHER_VILLAGE',
  0: 'EMPTY',
  0.5: 'PLAYER_VILLAGE',
  1: 'PLAYER_CITY',
};

const nodeValToRoad = {
  '-1': 'OTHER_ROAD',
  0: 'EMPTY',
  1: 'PLAYER_ROAD',
};

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

const round = num => Math.round(num * 100) / 100;

const parseBoard = state => {
  const types = state.slice(0, 19).map(v => valTogridType[round(v)]);
  const values = state.slice(19, 38).map(v => valToGridValue[round(v)]);
  const buildings = state.slice(38, 92).map(v => nodeValToBuilding[v])
    .map((b, idx) => ({
      x: nodeIdxToNodePos[idx].x,
      y: nodeIdxToNodePos[idx].y,
      type: b,
      hexIds: nodeToHex[idx],
    }));
  const roads = state.slice(92, 164).map(v => nodeValToRoad[v])
    .map((r, idx) => ({
      nodes: roadToNodes[idx],
      type: r,
    }));
  const cards = state.slice(164, 169).map(v => v);
  const board = types.map((type, idx) => ({
    x: tileIdxToGrid[idx].x,
    y: tileIdxToGrid[idx].y,
    type,
    value: values[idx],
    nodes: [],
  }));
  buildings.forEach(b => b.hexIds.forEach(id => board[id].nodes.push((({ x: b.x, y: b.y, connections: [] })))));
  board.forEach(b => { // Fix node order issue
    const tmp = b.nodes[3];
    // eslint-disable-next-line
    b.nodes[3] = b.nodes[5];
    // eslint-disable-next-line
    b.nodes[5] = tmp;
  });
  return {
    buildings,
    roads,
    cards,
    board,
  };
};

const parseOutput = output => {
  if (!Array.isArray(output)) {
    console.log(output);
  }
  const doNothing = output.slice(0, 1);
  const villages = output.slice(1, 55).map((v, idx) => ({ pos: nodeIdxToNodePos[idx], value: v }));
  const cities = output.slice(55, 109).map((v, idx) => ({ pos: nodeIdxToNodePos[idx], value: v }));
  const roads = output.slice(109, 181).map((v, idx) => ({ pos: roadToNodes[idx], value: v }));
  const trades = output.slice(181, 201);
  console.log({
    doNothing,
    villages,
    cities,
    roads,
    trades,
  });
  return {
    doNothing,
    villages,
    cities,
    roads,
    trades,
  };
};

export default class ReplayScene extends Scene {
  constructor() {
    super({ key: 'ReplayScene' });
    this.size = 100;
    this.buttons = [];
    this.dices = [];
    this.cards = [];
    this.currentTurn = 0;
    this.actionInTurn = 0;
    this.graphics = [];
    this.showOutput = false;
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

  populateBoard() {
    this.board.forEach(hex => hex.clearBuildings());
    const parsedData = parseBoard(this.turns[this.currentTurn].performedActions[this.actionInTurn].state);
    console.log(parsedData);
    parsedData.roads.forEach(r => {
      if (r.type !== 'EMPTY') {
        const color = r.type === 'PLAYER_ROAD' ? this.turns[this.currentTurn].color : '0x000000';
        const hexWithNode = this.board.find(hex => (
          hex.nodes.findIndex(n => n.x === r.nodes[0].x && n.y === r.nodes[0].y) > -1
          && hex.nodes.findIndex(n => n.x === r.nodes[1].x && n.y === r.nodes[1].y) > -1
        ));
        hexWithNode.drawRoad(r.nodes, color);
      }
    });
    parsedData.buildings.forEach(b => {
      if (b.type !== 'EMPTY') {
        const color = b.type === 'PLAYER_VILLAGE' || b.type === 'PLAYER_CITY' ? this.turns[this.currentTurn].color : '0x000000';
        const type = b.type === 'PLAYER_VILLAGE' || b.type === 'OTHER_VILLAGE' ? 'VILLAGE' : 'CITY';
        this.board[b.hexIds[0]].drawBuilding({ x: b.x, y: b.y }, color, type);
      }
    });
    const { diceRoll, cards } = this.turns[this.currentTurn];
    if (diceRoll) {
      this.dices.forEach(dice => dice.destroy());
      this.dices = [];
      this.drawDice(diceRoll.dice1);
      this.drawDice(diceRoll.dice2);
      this.drawDice('=');
      this.drawDice(diceRoll.total);
    }
    if (cards) this.drawCards(cards);
    const output = parseOutput(this.turns[this.currentTurn].performedActions[this.actionInTurn].output);
    if (output && this.showOutput) {
      console.log(output);
      const showNhighestValues = 10;
      // const showNlowestValues = 10;
      const highestValueThreshold = [...this.turns[this.currentTurn].performedActions[this.actionInTurn].output]
        .sort((a, b) => b - a)[showNhighestValues - 1];
      // const lowestValueThreshold = [...this.turns[this.currentTurn].performedActions[this.actionInTurn].output]
      //   .sort()[showNlowestValues - 1];
      const lowestValueThreshold = -1;
      output.villages.forEach((village, idx) => {
        if (village.value > highestValueThreshold || village.value < lowestValueThreshold) {
          this.board[nodeToHex[idx][0]].drawValueOnNode(village.pos, 'black', village.value);
        }
      });
      output.cities.forEach((city, idx) => {
        if (city.value > highestValueThreshold || city.value < lowestValueThreshold) {
          this.board[nodeToHex[idx][0]].drawValueOnNode(city.pos, '#7734eb', city.value);
        }
      });
      output.roads.forEach(road => {
        if (road.value > highestValueThreshold || road.value < lowestValueThreshold) {
          this.board.forEach(hex => hex.drawValueOnRoad(road.pos, '#524110', road.value));
        }
      });
    }
    // this.board.forEach(hex => hex.drawNodes());
    // this.board.forEach(hex => hex.drawConnections());
  }

  drawDice(val) {
    const graphics = this.add.graphics({
      x: 800 + this.dices.length * 20,
      y: 30,
      fillStyle: {
        color: '0xffffff',
        alpha: 1,
      },
      add: true,
    });
    graphics.fillRect(0, 0, 30, 30);
    this.dices.push(graphics);
    const text = this.add.text(
      graphics.x,
      graphics.y,
      val,
      { fontFamily: '"Roboto Condensed"', fontSize: '1.6rem', color: '#000' },
    );
    text.x += 5;
    this.dices.push(text);
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

  getGameData() {
    axios.get('/api/game/getGameData').then(({ data }) => {
      if (data) {
        this.turns = data;
        this.currentTurn = 0;
        this.actionInTurn = 0;
        const { board } = parseBoard(this.turns[this.currentTurn].performedActions[0].state);
        this.boardData = board;
        this.initiateBoard();
      }
    }).catch(err => {
      console.log(err);
      this.timer.remove();
    });
  }

  nextTurn() {
    if (this.currentTurn < this.turns.length - 1) {
      this.currentTurn += 1;
      this.actionInTurn = 0;
      this.prevActionButton.setVisible(false);
      this.nextActionButton.setVisible(this.turns[this.currentTurn].performedActions.length !== 1);
      this.currentTurnText.setText(`Turn ${this.currentTurn + 1}/${this.turns.length}`);
      this.populateBoard();
    }
  }

  previousTurn() {
    if (this.currentTurn > 0) {
      this.currentTurn -= 1;
      this.actionInTurn = 0;
      this.currentTurnText.setText(`Turn ${this.currentTurn + 1}/${this.turns.length}`);
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
      this.nextActionButton.setVisible(this.turns[this.currentTurn].performedActions.length !== this.actionInTurn + 1);
      this.prevActionButton.setVisible(true);
      this.currentActionInTurnText.setText(`Action ${this.actionInTurn + 1}/${this.turns[this.currentTurn].performedActions.length}`);
      this.populateBoard();
    }
  }

  previousActionInTurn() {
    if (this.actionInTurn > 0) {
      this.actionInTurn -= 1;
      this.nextActionButton.setVisible(true);
      this.prevActionButton.setVisible(this.actionInTurn !== 0);
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
    this.addButton('Load game', () => this.getGameData());
    this.addButton('First turn', () => this.firstTurn());
    this.addButton('Last turn', () => this.lastTurn());
    this.addButton('Next turn', () => this.nextTurn());
    this.addButton('Prev turn', () => this.previousTurn());
    this.nextActionButton = this.addButton('Next Action', () => this.nextActionInTurn());
    this.prevActionButton = this.addButton('Prev Action', () => this.previousActionInTurn());
    this.addButton('Toggle Output', () => this.toggleOutput());
  }

  addVisuals() {
    this.currentTurnText = this.add.text(375, 10, `Turn ${this.currentTurn + 1}/${this.turns.length}`, { fill: '#000' });
    this.currentTurnText.setBackgroundColor('#8ecaed');
    this.graphics.push(this.currentTurnText);
    this.currentActionInTurnText = this.add.text(560, 10,
      `Action ${this.actionInTurn + 1}/${this.turns[this.currentTurn].performedActions.length}`, { fill: '#000' });
    this.currentActionInTurnText.setBackgroundColor('#8ecaed');
    this.graphics.push(this.currentActionInTurnText);
  }

  create() {
    this.cameras.main.setBackgroundColor('#2e91c9');
    this.addButtons();
    console.log(this);
    this.getGameData();
  }
}
