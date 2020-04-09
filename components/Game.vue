<template>
  <div class="game">
    <h1>This is Game page</h1>
  </div>
</template>

<script>
import Phaser from 'phaser';
import settings from '~/game/Settings';

export default {
  name: 'Game',
  data() {
    return {
      game: null,
    };
  },
  mounted() {
    console.log('window', window);
  },
  methods: {
    init() {
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 200 },
          },
        },
        scene: {
          preload: this.preload,
          create: this.create,
        },
      };

      this.game = new Phaser.Game(config);
    },
    preload() {
      Phaser.load.setBaseURL('http://labs.phaser.io');
      Phaser.load.image('sky', 'assets/skies/space3.png');
      Phaser.load.image('logo', 'assets/sprites/phaser3-logo.png');
      Phaser.load.image('red', 'assets/particles/red.png');
    },
    create() {
      Phaser.add.image(400, 300, 'sky');

      const particles = Phaser.add.particles('red');

      const emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD',
      });

      const logo = Phaser.physics.add.image(400, 100, 'logo');

      logo.setVelocity(100, 200);
      logo.setBounce(1, 1);
      logo.setCollideWorldBounds(true);

      emitter.startFollow(logo);
    },x
  },
};
</script>

<style lang="scss" scoped>

</style>
