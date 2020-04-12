// const consola = require('consola');
const Tile = require('./Tile');

// const gridTypes = ['STONE', 'WOOD', 'WHEAT', 'BRICKS', 'SHEEP', 'DESERT'];
const gridTypes = ['DESERT', 'STONE', 'WOOD', 'WHEAT', 'BRICKS', 'SHEEP'];
const GRID_TYPES = gridTypes.reduce((o, t, i) => ({ ...o, [t]: i }), {});

class Board {
  constructor() {
    this.generateRandomBoard();
  }

  generateRandomBoard() {
    const availableTypes = {
      [GRID_TYPES.STONE]: 3,
      [GRID_TYPES.WOOD]: 4,
      [GRID_TYPES.WHEAT]: 4,
      [GRID_TYPES.BRICKS]: 3,
      [GRID_TYPES.SHEEP]: 4,
      [GRID_TYPES.DESERT]: 1,
    };
    const posibilityArr = Object.entries(availableTypes).reduce((arr, [type, n]) => ([...arr, ...new Array(n).fill(type)]), []);
    posibilityArr.sort(() => Math.random() - 0.5);
    const values = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
    const randomValue = () => values.splice(Math.floor(Math.random() * values.length), 1)[0];
    this.tiles = posibilityArr.map((tile, idx) => (
      new Tile(idx, gridTypes[tile], gridTypes[tile] !== 'DESERT' ? randomValue() : null)
    ));
  }

  toJSON() {
    return this.tiles;
  }
}

module.exports = {
  Board,
  GRID_TYPES,
};
