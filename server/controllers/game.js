const Game = require('../game/Game');

let game = null;

exports.newGame = (req, res) => {
  try {
    if (game) game.endGame();
    const { players } = req.body;
    game = new Game(players || 2);
    res.json(game);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.getGame = (req, res) => {
  res.json(game);
  if (game) game.log = [];
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
