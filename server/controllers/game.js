const tf = require('@tensorflow/tfjs-node');

const Game = require('../game/Game');
const Agent = require('../agent/Agent');

let game = null;
let agents = null;

exports.newGame = async (req, res) => {
  try {
    if (game) game.endGame();
    const { players } = req.body;
    if (!agents) {
      agents = await Promise.all(new Array(players).fill(0).map(async (v, idx) => {
        const model = await tf.loadLayersModel(`file://${__dirname}/../agent/models/competitors_1700/model${idx}/model.json`);
        return new Agent('evaluate', false, [100], model);
      }));
    }
    game = new Game(agents);
    game.run();
    res.json(game);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.resetAgents = (req, res) => {
  try {
    game.endGame();
    const players = game.players.length;
    agents = new Array(4).fill(0).map(() => new Agent('evaluate'));
    game = new Game(agents.slice(0, players));
    game.run();
    res.json(game);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.getGameData = (req, res) => {
  try {
    res.json(game.turns);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.getGame = (req, res) => {
  res.json(game);
  if (game) game.log = [];
};

exports.getState = (req, res) => {
  try {
    const { player } = req.params;
    const state = game.getState(game.players[player]);
    res.json(state);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.takeTurn = (req, res) => {
  try {
    game.playTurn(game.getTurn());
    res.json(game);
  } catch (err) {
    res.json(err);
  }
};

exports.togglePause = (req, res) => {
  try {
    game.togglePause();
    res.json({ paused: game.paused });
  } catch (err) {
    res.json(err);
  }
};
