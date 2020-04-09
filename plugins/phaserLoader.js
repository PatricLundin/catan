import Vue from 'vue';

Vue.prototype.$phaserLoader = {
  loadGame(loaderKey) {
    if (process.client) {
      return require(`../assets/phaser/${loaderKey}/game`);
    }
    return {};
  },
};
