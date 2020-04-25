import Phaser from 'phaser';
import ReplayGameScene from './scenes/replayGame';
// import GameScene from './scene';
// import ReplayScene from './replayScene';
import event from './event';

function launch({
  width = 800,
  height = 600,
  parent = 'phaser-container',
  store,
}) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width,
    height,
    parent,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: true,
      },
    },
    scene: [ReplayGameScene],
  });

  // replace the EventEmitter on the DataManager with our own imported EventEmitter
  game.registry.events = event;

  // append the Vuex store to EventEmitter
  game.registry.events.store = store;

  // if there is no pre-existing game state, initialize it
  if (store && store.getters && store.getters.phaser && !store.getters.phaser.catan) {
    event.store.commit('save', {
      gameName: 'catan',
      prop: 'test',
      value: 0,
    });
  }

  return game;
}

export default launch;
export { launch };
