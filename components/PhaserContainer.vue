<template>
  <div :id="phaserContainer" />
</template>

<script>
export default {
  name: 'PhaserContainer',

  props: {
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 600,
    },
    pageContainer: {
      type: String,
      default: 'container',
    },
    phaserContainer: {
      type: String,
      default: 'phaser-container',
    },
    fixedSize: {
      type: Boolean,
      default: false,
    },
    // eslint-disable-next-line
    game: {
      default() {
        return {};
      },
    },
  },
  destroyed() {
    this.gameObject.destroy();
  },
  mounted() {
    this.$nextTick(async () => {
      // get page's main container (for sizing)
      const pageContainer = document.getElementsByClassName(this.pageContainer)[0];

      // launch game with resizing
      if (this.fixedSize === false) {
        this.gameObject = this.game.launch({
          width:
            pageContainer.clientWidth < this.width
              ? pageContainer.clientWidth
              : this.width,
          height: this.getHeight(pageContainer.clientHeight, pageContainer.clientWidth),
          parent: this.phaserContainer,
          store: this.$store ? this.$store : null,
        });
        // launch game without resizing
      } else {
        this.gameObject = this.game.launch({
          width: this.width,
          height: this.height,
          parent: this.phaserContainer,
          store: this.$store ? this.$store : null,
        });
      }
    });
  },
  methods: {
    getHeight(clientHeight, clientWidth) {
      if (clientHeight < this.height) return clientHeight;
      if (clientWidth * 0.7 < this.height) return clientWidth * 0.7;
      return this.height;
    },
  },
};
</script>
