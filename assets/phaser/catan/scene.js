import { Scene } from 'phaser';
import axios from 'axios';
import Hexagon from './objects/hexagon';

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.grid = null;
    this.size = 100;
    this.buttons = [];
    this.paused = true;
    this.dices = [];
  }

  initiateBoard() {
    if (this.board) this.board.forEach(hex => hex.destroy());
    this.board = this.gameData.board.map(data => (
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
  }

  populateBoard() {
    this.board.forEach(hex => hex.clearBuildings());
    this.gameData.players.forEach(player => {
      player.roads.forEach(road => {
        const hexWithNode = this.board.find(hex => (
          hex.nodes.findIndex(n => n.x === road.nodes[0].x && n.y === road.nodes[0].y) > -1
          && hex.nodes.findIndex(n => n.x === road.nodes[1].x && n.y === road.nodes[1].y) > -1
        ));
        hexWithNode.drawRoad(road.nodes, player.color);
      });
    });
    this.gameData.players.forEach(player => {
      player.buildings.forEach(building => {
        const hexWithNode = this.board.find(hex => hex.nodes.findIndex(n => n.x === building.node.x && n.y === building.node.y) > -1);
        hexWithNode.drawBuilding(building.node, player.color);
      });
    });
    if (this.gameData.diceRoll) {
      this.dices.forEach(dice => dice.destroy());
      this.dices = [];
      this.drawDice(this.gameData.diceRoll.dice1);
      this.drawDice(this.gameData.diceRoll.dice2);
      this.drawDice('=');
      this.drawDice(this.gameData.diceRoll.total);
    }
    this.gameData.log.forEach(log => console.log(log));
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

  createRandomBoard() {
    if (this.grid) this.grid.forEach(row => row.forEach(h => h.destroy()));
    this.generateGrid();
    this.populateGrid();
  }

  newGame() {
    axios.post('/api/game/newGame', { players: 3 }).then(({ data }) => {
      if (data && data.board) {
        this.gameData = data;
        this.initiateBoard();
      }
    });
  }

  getBoard() {
    axios.get('/api/game').then(({ data }) => {
      if (data && data.board) {
        this.gameData = data;
        this.populateBoard();
      }
    });
  }

  takeTurn() {
    axios.post('/api/game/takeTurn', {}).then(({ data }) => {
      if (data && data.board) {
        this.gameData = data;
        this.populateBoard();
      }
    });
  }

  togglePause() {
    axios.post('/api/game/togglePause', {}).then(({ data }) => {
      if (data) {
        this.paused = data.paused;
        const pauseButton = this.buttons.find(b => (b.text === 'Pause' || b.text === 'Unpause'));
        pauseButton.setText(pauseButton.text === 'Pause' ? 'Unpause' : 'Pause');
      }
    });
  }

  addButton(text, clickAction) {
    const updateBoardButton = this.add.text(50, 30 + 30 * this.buttons.length, text, { fill: '#000' });
    updateBoardButton.setBackgroundColor('#8ecaed');
    updateBoardButton.setInteractive();
    updateBoardButton.on('pointerdown', () => {
      clickAction();
    });
    this.buttons.push(updateBoardButton);
  }

  addButtons() {
    this.buttons = [];
    this.addButton('New game', () => this.scene.restart());
    this.addButton('Take turn', () => this.takeTurn());
    this.addButton('Refresh', () => this.getBoard());
    this.addButton('Unpause', () => this.togglePause());
  }

  create() {
    this.cameras.main.setBackgroundColor('#2e91c9');
    this.newGame();
    this.addButtons();
    console.log(this);

    this.timer = this.time.addEvent({
      delay: 500, // ms
      callback: this.getBoard,
      callbackScope: this,
      loop: true,
    });
  }
}
