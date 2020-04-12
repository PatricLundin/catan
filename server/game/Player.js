const { v4: uuidv4 } = require('uuid');
const Road = require('./Road');
const Building = require('./Building');
const Game = require('./Game');

const buildingCosts = {
  VILLAGE: {
    SHEEP: 1,
    WHEAT: 1,
    WOOD: 1,
    BRICKS: 1,
  },
  CITY: {
    WHEAT: 2,
    STONE: 3,
  },
  ROAD: {
    BRICKS: 1,
    WOOD: 1,
  },
};

class Player {
  /**
   *
   * @param {Game} game A game object.
   */
  constructor(game, name, color) {
    this.id = uuidv4();
    this.game = game;
    this.name = name;
    this.color = color;
    this.buildings = [];
    this.roads = [];
    this.cards = {
      WHEAT: 2,
      STONE: 0,
      BRICKS: 4,
      WOOD: 4,
      SHEEP: 2,
    };
    this.actions = [0, 1];
  }

  canBuild(type) {
    const cards = buildingCosts[type];
    return Object.entries(cards).every(([card, amount]) => this.cards[card] >= amount);
  }

  formatResources() {
    return `Wh: ${this.cards.WHEAT}, Wo: ${this.cards.WOOD}, Sh: ${this.cards.SHEEP}, St: ${this.cards.STONE}, B: ${this.cards.BRICKS}`;
  }

  addRoad(nodes) {
    this.game.log.push(`${this.name}[${this.formatResources()}]: Build road`);
    const road = new Road(nodes, this);
    this.roads.push(road);
    nodes.forEach(node => node.addRoad(road));
    Object.entries(buildingCosts.ROAD).forEach(([card, amount]) => { this.cards[card] -= amount; });
  }

  addBuilding(node) {
    if (!node.building) {
      this.game.log.push(`${this.name}[${this.formatResources()}]: Build village`);
      const building = new Building(node, this);
      this.buildings.push(building);
      node.setBuilding(building);
      Object.entries(buildingCosts.VILLAGE).forEach(([card, amount]) => { this.cards[card] -= amount; });
    }
  }

  upgradeBuilding(building) {
    this.game.log.push(`${this.name}[${this.formatResources()}]: Upgrade building'`);
    building.upgrade();
    Object.entries(buildingCosts.CITY).forEach(([card, amount]) => { this.cards[card] -= amount; });
  }

  buildingAction(node) {
    return () => this.addBuilding(node);
  }

  roadAction(nodes) {
    return () => this.addRoad(nodes);
  }

  upgradeBuildingAction(building) {
    return () => this.upgradeBuilding(building);
  }

  tradeAction(from, to) {
    return () => this.makeTrade(from, to);
  }

  makeTrade(from, to) {
    this.game.log.push(`${this.name}[${this.formatResources()}]: Trade ${from} => ${to}'`);
    this.cards[from] -= 4;
    this.cards[to] += 1;
  }

  canBuildVillageOnNode(node) {
    return this.canBuild('VILLAGE')
      && !node.building
      && !node.connections.some(c => c.building)
      && this.roads.some(r => r.nodes.some(n => n.id === node.id));
  }

  canBuildCityOnNode(node) {
    return this.canBuild('CITY')
      && this.buildings.some(b => b.type === 'VILLAGE' && b.node.id === node.id);
  }

  canBuildRoadOnConn(connection) {
    return this.canBuild('ROAD')
      && !connection[0].roads.some(r => connection[1].roads.map(t => t.id).includes(r.id))
      && this.roads.some(r => r.nodes.some(n => n.id === connection[0].id || n.id === connection[1].id));
  }

  canTradeCard(card) {
    return this.cards[card] >= 4;
  }

  getStartingActions() {
    const doNothing = null;
    const bVillage = this.game.nodes.map(node => ((!node.building && !node.connections.some(c => !!c.building)) ? this.buildingAction(node) : null));
    const bCity = this.game.nodes.map(() => null);
    const bRoad = this.game.connections.map(() => null);
    const trades = Object.keys(this.cards).reduce((arr, card) => {
      Object.keys(this.cards).filter(c => c !== card).forEach(() => arr.push(null));
      return arr;
    }, []);
    return [doNothing, ...bVillage, ...bCity, ...bRoad, ...trades];
  }

  getStartingRoad(node) {
    const doNothing = null;
    const bVillage = this.game.nodes.map(() => null);
    const bCity = this.game.nodes.map(() => null);
    const bRoad = this.game.connections.map(conn => (conn.some(n => n.id === node.id) ? this.roadAction(conn) : null));
    const trades = Object.keys(this.cards).reduce((arr, card) => {
      Object.keys(this.cards).filter(c => c !== card).forEach(() => arr.push(null));
      return arr;
    }, []);
    return [doNothing, ...bVillage, ...bCity, ...bRoad, ...trades];
  }

  getAllActions() {
    const doNothing = 'STOP';
    const bVillage = this.game.nodes.map(n => (this.canBuildVillageOnNode(n) ? this.buildingAction(n) : null));
    const bCity = this.game.nodes.map(n => (this.canBuildCityOnNode(n) ? this.upgradeBuildingAction(n.building) : null));
    const bRoad = this.game.connections.map(c => (this.canBuildRoadOnConn(c) ? this.roadAction(c) : null));
    const trades = Object.keys(this.cards).reduce((arr, card) => {
      Object.keys(this.cards).filter(c => c !== card).forEach(to => (
        arr.push(this.canTradeCard(card) ? this.tradeAction(card, to) : null)
      ));
      return arr;
    }, []);
    return [doNothing, ...bVillage, ...bCity, ...bRoad, ...trades];
  }

  getActions() {
    return this.getAllActions().filter(a => !!a);
  }

  getPoints() {
    return this.buildings.reduce((sum, b) => sum + b.points, 0);
  }

  toJSON() {
    return {
      name: this.name,
      color: this.color,
      buildings: this.buildings,
      roads: this.roads,
      cards: this.cards,
      points: this.getPoints(),
    };
  }
}

module.exports = Player;
