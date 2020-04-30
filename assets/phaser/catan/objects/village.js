import Phaser from 'phaser';

export default class Village extends Phaser.GameObjects.Polygon {
  constructor(scene, size, x, y, node, fillColor) {
    const points = [
      { x: 0, y: 0.5 * size },
      { x: 0.5 * size, y: 0 },
      { x: size, y: 0.5 * size },
      { x: 1.5 * size, y: 0 },
      { x: 2 * size, y: 0.5 * size },
      { x: 2 * size, y: 1.5 * size },
      { x: 0, y: 1.5 * size },
    ];
    super(scene, x, y, points, fillColor);
    this.node = node;
    this.scene = scene;
    this.points = points;
    this.xPos = x;
    this.yPos = y;
    this.objects = [];

    this.addInteractions();
    scene.add.existing(this);
    this.setDepth(3);
    this.drawBorder();
  }

  addInteractions() {
    this.setInteractive(new Phaser.Geom.Polygon(this.points), Phaser.Geom.Polygon.Contains);
  }

  removeFromScene() {
    this.clearObjects();
    this.destroy();
  }

  clearObjects() {
    this.objects.forEach(o => o.destroy());
    this.objects = [];
  }

  drawBorder() {
    const graphics = this.scene.add.graphics({
      x: this.xPos - this.width / 2,
      y: this.yPos - this.height / 2,
      lineStyle: {
        width: 1,
        color: '0xffffff',
        alpha: 1,
      },
    });
    graphics.strokePoints(this.points, true, true);
    graphics.setDepth(3);
    this.objects.push(graphics);
  }
}
