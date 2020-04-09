const express = require('express');

const router = express.Router();
const controller = require('../controllers/game');


router.post('/newGame', controller.newGame);
router.post('/takeTurn', controller.takeTurn);
router.post('/togglePause', controller.togglePause);
router.get('/', controller.getGame);

module.exports = router;
