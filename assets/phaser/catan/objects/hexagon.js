import Phaser from 'phaser';

const typesToColor = {
  STONE: Phaser.Display.Color.GetColor32(126, 142, 168, 1),
  WOOD: Phaser.Display.Color.GetColor32(41, 166, 66, 1),
  WHEAT: Phaser.Display.Color.GetColor32(216, 219, 46, 1),
  BRICKS: Phaser.Display.Color.GetColor32(222, 142, 44, 1),
  SHEEP: Phaser.Display.Color.GetColor32(194, 255, 133, 1),
  DESERT: Phaser.Display.Color.GetColor32(245, 235, 201, 1),
};

const getColor = type => (
  typesToColor[type]
  || Phaser.Display.Color.GetColor32(
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    1,
  )
);

export default class Hexagon extends Phaser.GameObjects.Polygon {
  constructor(scene, size, x, y, type, value, nodes) {
    const fillColor = getColor(type); // color of the hexagon
    const offSets = [1.5, 1, 0.5, 1, 1.5]; // offsets per row
    const width = Math.sqrt(3) * size; // hexagon width
    const height = 2 * size; // hexagon height
    const cordX = width * x + offSets[y] * width + width * 0.5; // X position in game world
    const cordY = height * y * 0.75 + height * 0.75; // Y positionn in game world
    const points = [ // All points to draw hexagon
      { x: 0, y: height / 4 },
      { x: width / 2, y: 0 },
      { x: width, y: height / 4 },
      { x: width, y: height * 0.75 },
      { x: width / 2, y: height },
      { x: 0, y: height * 0.75 },
    ];
    super(scene, cordX, cordY, points, fillColor);
    this.scene = scene;
    this.points = points;
    this.strokeColor = 'RED';
    this.cordX = cordX;
    this.cordY = cordY;
    this.type = type;
    this.xPos = x;
    this.yPos = y;
    this.nodes = nodes;
    this.objects = [];
    this.nodeInfo = [];
    this.shwoingNodeInfo = false;

    this.addInteractions();
    scene.add.existing(this);
    this.drawBorder();
    if (type !== 'DESERT') this.addValueBadge(value);
    // this.addCornerPoints();
    this.on('pointerdown', () => {
      this.shwoingNodeInfo = !this.shwoingNodeInfo;
      this.nodeInfo.forEach(t => t.setVisible(this.shwoingNodeInfo));
    });
  }

  addScene(scene) {
    this.scene = scene;
  }

  addInteractions() {
    this.setInteractive(new Phaser.Geom.Polygon(this.points), Phaser.Geom.Polygon.Contains);
    // this.on('pointerdown', (pointer, localX, localY) => {
    //   console.log({
    //     x: this.xPos,
    //     y: this.yPos,
    //     localX,
    //     localY,
    //   });
    // });
  }

  drawBorder() {
    const graphics = this.scene.add.graphics({
      x: this.cordX - this.width / 2,
      y: this.cordY - this.height / 2,
      lineStyle: {
        width: 5,
        color: '0xffffff',
        alpha: 1,
      },
    });
    graphics.strokePoints(this.points, true, true);
  }

  drawNodes() {
    this.nodes.forEach((node, idx) => {
      const point = this.points[idx];
      const text = this.scene.add.text(
        point.x + this.cordX - this.width / 2,
        point.y + this.cordY - this.height / 2,
        `${node.x}, ${node.y}`,
        { fontFamily: '"Roboto Condensed"', fontSize: '1.6rem', color: '#000' },
      );
      text.x -= text.width / 2;
      text.y -= text.height / 2;
      text.setInteractive();
      text.setVisible(false);
      this.objects.push(text);
      this.nodeInfo.push(text);
    });
  }

  drawConnections() {
    this.nodes.forEach((node, idx) => node.connections.forEach(conn => {
      const connIdx = this.nodes.findIndex(n => n.x === conn.x && n.y === conn.y);
      if (connIdx > -1) {
        const points = [this.points[idx], this.points[connIdx]];
        const graphics = this.scene.add.graphics({
          x: this.cordX - this.width / 2,
          y: this.cordY - this.height / 2,
          lineStyle: {
            width: 2,
            color: '0x000000',
            alpha: 1,
          },
        });
        graphics.strokePoints(points, true, true);
      }
    }));
  }

  drawBuilding(node, color, type) {
    const nodeIdx = this.nodes.findIndex(n => n.x === node.x && n.y === node.y);
    const point = this.points[nodeIdx];
    if (type === 'VILLAGE') {
      this.addVillage(point.x + this.cordX - this.width / 2, point.y + this.cordY - this.height / 2, color);
    } else {
      this.addCity(point.x + this.cordX - this.width / 2, point.y + this.cordY - this.height / 2, color);
    }
  }

  drawValueOnNode(node, color, value) {
    const nodeIdx = this.nodes.findIndex(n => n.x === node.x && n.y === node.y);
    const point = this.points[nodeIdx];
    const text = this.scene.add.text(
      point.x + this.cordX - this.width / 2,
      point.y + this.cordY - this.height / 2,
      value,
      { fontFamily: '"Roboto Condensed"', fontSize: '1rem', color },
    );
    text.x -= text.width / 2;
    this.objects.push(text);
  }

  drawRoad(nodes, color) {
    const node0Idx = this.nodes.findIndex(n => n.x === nodes[0].x && n.y === nodes[0].y);
    const node1Idx = this.nodes.findIndex(n => n.x === nodes[1].x && n.y === nodes[1].y);
    const points = [this.points[node0Idx], this.points[node1Idx]];
    const graphics = this.scene.add.graphics({
      x: this.cordX - this.width / 2,
      y: this.cordY - this.height / 2,
      lineStyle: {
        width: 8,
        color,
        alpha: 1,
      },
    });
    graphics.strokePoints(points, true, true);
    this.objects.push(graphics);
  }

  drawValueOnRoad(nodes, color, value) {
    const node0Idx = this.nodes.findIndex(n => n.x === nodes[0].x && n.y === nodes[0].y);
    const node1Idx = this.nodes.findIndex(n => n.x === nodes[1].x && n.y === nodes[1].y);
    if (node0Idx === -1 || node1Idx === -1) return;
    const points = [this.points[node0Idx], this.points[node1Idx]];
    const pX = points.reduce((sum, p) => p.x + sum, 0) / 2;
    const pY = points.reduce((sum, p) => p.y + sum, 0) / 2;
    const text = this.scene.add.text(
      pX + this.cordX - this.width / 2,
      pY + this.cordY - this.height / 2,
      value,
      { fontFamily: '"Roboto Condensed"', fontSize: '1rem', color },
    );
    text.x -= text.width / 2;
    this.objects.push(text);
  }

  clearBuildings() {
    this.objects.forEach(o => o.destroy());
  }

  addValueBadge(value) {
    const graphics = this.scene.add.graphics({
      x: this.cordX,
      y: this.cordY,
      fillStyle: {
        color: '#ecede4',
        alpha: 1,
      },
    });
    graphics.fillCircle(0, 0, 25);

    const text = this.scene.add.text(
      this.cordX,
      this.cordY,
      value,
      { fontFamily: '"Roboto Condensed"', fontSize: '2rem' },
    );
    text.x -= text.width / 2;
    text.y -= text.height / 2;
  }

  addCornerPoints() {
    this.points.forEach(point => {
      const graphics = this.scene.add.graphics({
        x: point.x + this.cordX - this.width / 2,
        y: point.y + this.cordY - this.height / 2,
        lineStyle: {
          width: 2,
          color: '0x000000',
          alpha: 1,
        },
      });
      let villageAdded = false;
      graphics.setInteractive(new Phaser.Geom.Circle(0, 0, 10), Phaser.Geom.Circle.Contains);
      graphics.on('pointerover', () => { if (!villageAdded) graphics.strokeCircle(0, 0, 10); });
      graphics.on('pointerout', () => { if (!villageAdded) graphics.clear(); });
      graphics.on('pointerdown', () => {
        this.addVillage(graphics.x, graphics.y);
        villageAdded = true;
        graphics.clear();
      });
    });
  }

  addVillage(x, y, color) {
    const size = 20;
    const points = [
      { x: 0, y: 0.5 * size },
      { x: 0.5 * size, y: 0 },
      { x: size, y: 0.5 * size },
      { x: 1.5 * size, y: 0 },
      { x: 2 * size, y: 0.5 * size },
      { x: 2 * size, y: 1.5 * size },
      { x: 0, y: 1.5 * size },
    ];
    const poly = this.scene.add.polygon(x, y, points, color);
    this.objects.push(poly);
    const graphics = this.scene.add.graphics({
      x: x - poly.width / 2,
      y: y - poly.height / 2,
      lineStyle: {
        width: 1,
        color: '0xffffff',
        alpha: 1,
      },
    });
    graphics.strokePoints(points, true, true);
    this.objects.push(graphics);
  }

  addCity(x, y, color) {
    const size = 50;
    const points = [
      { x: 0, y: size / 4 },
      { x: size / 2, y: 0 },
      { x: size, y: size / 4 },
      { x: size, y: size * 0.75 },
      { x: size / 2, y: size },
      { x: 0, y: size * 0.75 },
    ];
    const poly = this.scene.add.polygon(x, y, points, color);
    this.objects.push(poly);
    const graphics = this.scene.add.graphics({
      x: x - poly.width / 2,
      y: y - poly.height / 2,
      lineStyle: {
        width: 1,
        color: '0xffffff',
        alpha: 1,
      },
    });
    graphics.strokePoints(points, true, true);
    this.objects.push(graphics);
  }

  // preUpdate(time, delta) {}
}
