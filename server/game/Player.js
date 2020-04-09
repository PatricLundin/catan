const Road = require('./Road');
const Building = require('./Building');

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
  constructor(game, name, color) {
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

  performAction(id) {
    this.actions[id]();
  }

  getActions() {
    this.actions = [];
    this.actions.push(() => {});
    if (this.canBuild('VILLAGE')) {
      const buildings = this.roads.reduce((arr, road) => {
        road.nodes.forEach(node => { if (!node.building && !node.connections.some(c => c.building)) arr.push(node); });
        return arr;
      }, []).map(n => this.buildingAction(n));
      this.actions.push(...buildings);
    }
    if (this.canBuild('CITY')) {
      const buildings = this.buildings.filter(b => b.type === 'VILLAGE').map(b => this.upgradeBuildingAction(b));
      this.actions.push(...buildings);
    }
    if (this.canBuild('ROAD')) {
      const roads = this.roads.reduce((arr, road) => {
        road.nodes.forEach(node => {
          node.getFreeConnections().forEach(n => arr.push([node, n]));
        });
        return arr;
      }, []).map(n => this.roadAction(n));
      this.actions.push(...roads);
    }
    const trades = Object.entries(this.cards).reduce((arr, [type, amount]) => {
      if (amount >= 4) Object.keys(this.cards).filter(c => c !== type).forEach(c => arr.push(this.tradeAction(type, c)));
      return arr;
    }, []);
    this.actions.push(...trades);
    return [...this.actions.map((a, i) => i)];
  }

  toJSON() {
    return {
      name: this.name,
      color: this.color,
      buildings: this.buildings,
      roads: this.roads,
      cards: this.cards,
    };
  }
}

module.exports = Player;
