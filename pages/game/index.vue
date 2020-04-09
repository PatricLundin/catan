<template>
  <div class="container">
    <Game
      v-if="windowHeight"
      :width="windowHeight * 1.6"
      :height="windowHeight"
      :fixed-size="true"
      :game="componentPayload"
    />
  </div>
</template>

<script>
import Game from '../../components/PhaserContainer.vue';

export default {
  components: {
    Game,
  },
  data() {
    return {
      windowHeight: null,
    };
  },
  computed: {
    componentPayload() {
      if (!this.$phaserLoader) return {};
      return this.$phaserLoader.loadGame('catan');
    },
  },
  mounted() {
    this.windowHeight = window.innerHeight;
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      this.windowHeight = window.innerHeight;
    },
  },
};
</script>

<style>

</style>
