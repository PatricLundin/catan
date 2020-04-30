import Phaser from 'phaser';

export default class City extends Phaser.GameObjects.Polygon {
  constructor(scene, size, x, y, node, fillColor) {
    const points = [
      { x: 0, y: size / 4 },
      { x: size / 2, y: 0 },
      { x: size, y: size / 4 },
      { x: size, y: size * 0.75 },
      { x: size / 2, y: size },
      { x: 0, y: size * 0.75 },
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
    this.setDepth(2);
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
    graphics.setDepth(2);
    this.objects.push(graphics);
  }
}
