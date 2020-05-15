import { Scene } from 'phaser';
import io from 'socket.io-client';
import Hexagon from '../objects/hexagon';
import dice1 from '../images/Dices-1.png';
import dice2 from '../images/Dices-2.png';
import dice3 from '../images/Dices-3.png';
import dice4 from '../images/Dices-4.png';
import dice5 from '../images/Dices-5.png';
import dice6 from '../images/Dices-6.png';
import { roadToNodes, nodeIdxToNodePos, nodeToHex } from '../constants';
import parseBoard from '../utils';

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.socket = io('http://localhost:5000');
    this.size = 70;
    this.buttons = [];
    this.dices = [];
    this.cards = [];
    this.graphics = [];
    this.allAactions = null;
    this.availableActions = [];
    this.gameId = null;

    // Socket events
    this.socket.on('new_game_started', g => this.initGame(g));
    this.socket.on('all_actions', actions => {
      this.allAactions = actions.reduce((dict, a) => ({ ...dict, [a.id]: a }), {});
      console.log({ allAactions: this.allAactions });
    });
    this.socket.on('available_actions', actions => {
      this.availableActions = actions;
      console.log({ availableActions: this.availableActions });
    });
    this.socket.on('next_turn_played', turn => {
      this.turns.push(turn);
      console.log({ next_turn_played: turn });
      this.drawTurn(turn);
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

  // update() {

  // }

  create() {
    this.cameras.main.setBackgroundColor('#2e91c9');
    this.cameras.main.setBounds(-512, -512, 3000, 2048);
    this.input.on('pointermove', p => {
      if (!p.isDown) return;

      this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
    });
    this.addButtons();
    console.log(this);
    this.socket.emit('get_all_actions');
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
    console.log({ turn, players: this.players });
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

  drawDice(val) {
    const dice = this.add.image(
      (10 * this.size) + this.dices.length * (this.size / 1.5),
      30,
      `dice${val}`,
    );
    dice.setDisplaySize(this.size / 2, this.scale / 2);
    this.dices.push(dice);
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
    console.log('game', game);
    this.clearBoard();
    this.turns = game.turns;
    this.gameId = game.id;
    this.players = game.players.reduce((o, p) => ({ ...o, [p.name]: p }), {});
    this.currentTurn = 0;
    this.actionInTurn = 0;
    const { board, nodes } = parseBoard(game.board);
    console.log({ board, nodes, players: this.players });
    this.boardData = board;
    this.initiateBoard();
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
    this.addButton('New game', () => this.socket.emit('create_new_game', [1, 2, 5]));
    this.addButton('Random action', () => this.socket.emit('take_random_action', this.gameId));
    this.addButton('Next turn', () => this.socket.emit('next_turn', this.gameId));
    this.addButton('Get actions', () => this.socket.emit('get_available_actions', this.gameId));
  }

  addVisuals() {
    this.currentTurnText = this.add.text(375, 10, `Turn ${this.currentTurn}/${this.turns.length - 1}`, { fill: '#000' });
    this.currentTurnText.setBackgroundColor('#8ecaed');
    this.graphics.push(this.currentTurnText);
  }
}
