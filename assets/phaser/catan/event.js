const { Events } = require('phaser');

const events = new Events.EventEmitter();

// events.on('bounce', () => {
//   let value = events.store.getters.phaser.game.bounces
//   value++

//   events.store.commit('savePhaser', {
//     gameName: 'exampleGame',
//     prop: 'bounces',
//     value
//   })
// })

export default events;
