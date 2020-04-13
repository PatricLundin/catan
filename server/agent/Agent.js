const tf = require('@tensorflow/tfjs-node');

const randomAction = actions => {
  const possible = actions.map((a, i) => (a ? i : null)).filter(a => a !== null);
  return possible[Math.floor(Math.random() * possible.length)];
};

const getActionsType = idx => {
  if (idx === 0) return 'NOTHING';
  if (idx > 0 && idx < 55) return 'VILLAGE';
  if (idx >= 55 && idx < 109) return 'CITY';
  if (idx >= 109 && idx < 181) return 'ROAD';
  return 'TRADE';
};

const INITIAL_EPS = 0.1;
const DECAY_FACTOR = 0.01;
const GAMMA = 0.95;
// const LAMDA = 0.9;
const LEARNING_RATE = 0.001;

class Agent {
  constructor(strategy = 'random', model) {
    this.strategy = strategy;
    this.memory = [];
    this.eps = INITIAL_EPS;
    this.steps = 0;
    this.lossArr = [];
    this.model = model;
    if (!model) this.initStrategy();
    this.currentPrediction = null;
  }

  setPlayer(player) {
    this.player = player;
    this.game = player.game;
  }

  setMemory(memory) {
    this.memory = memory;
  }

  addSample(sample) {
    this.memory.push(sample);
  }

  getSamples(num) {
    return new Array(num).fill(0).map(() => this.memory[Math.floor(Math.random() * this.memory.length)]);
  }

  chooseAction(actions) {
    if (this.strategy === 'evaluate') return this.evaluateStrategy(actions);
    return randomAction(actions);
  }

  chooseStartingVillage() {
    const performedActions = [];
    // Choose village
    const actions = this.player.getStartingActions();
    const actionIdx = this.chooseAction(actions);
    if (this.strategy === 'evaluate' && this.currentPrediction) {
      performedActions.push({
        state: this.game.getState(this.player),
        action: actionIdx,
        output: this.currentPrediction,
      });
    }
    const action = actions[actionIdx];
    action();

    // Choose road on village
    const node = this.game.nodes[actionIdx - 1];
    const roadActions = this.player.getStartingRoad(node);
    const roadActionIdx = this.chooseAction(roadActions);
    if (this.strategy === 'evaluate' && this.currentPrediction) {
      performedActions.push({
        state: this.game.getState(this.player),
        action: roadActionIdx,
        output: this.currentPrediction,
      });
    }
    const roadAction = roadActions[roadActionIdx];
    roadAction();
    return performedActions;
  }

  turn() {
    let action;
    const performedActions = [];
    while (action !== 'STOP') {
      const state = this.game.getState(this.player);
      const actions = this.player.getAllActions();
      const actionIdx = this.chooseAction(actions);
      action = actions[actionIdx];
      if (action !== 'STOP') action();
      let reward = 0;
      if (getActionsType(actionIdx) === 'VILLAGE') reward += 2;
      if (getActionsType(actionIdx) === 'CITY') reward += 4;
      if (getActionsType(actionIdx) === 'ROAD') reward += 1;
      if (getActionsType(actionIdx) === 'NOTHING' && actions.filter(a => !!a).length > 1) reward -= 1;
      const nextState = this.game.getState(this.player);
      this.addSample({
        state,
        action: actionIdx,
        reward,
        nextState,
      });
      if (this.strategy === 'evaluate' && this.currentPrediction) {
        performedActions.push({
          state,
          action: actionIdx,
          output: this.currentPrediction,
        });
      }
      this.steps += 1;
      this.eps = INITIAL_EPS * (1 - DECAY_FACTOR) ** this.steps;
    }
    return performedActions;
  }

  initStrategy() {
    if (this.strategy === 'evaluate') {
      this.optimizer = tf.train.adam(LEARNING_RATE);

      const model = tf.sequential();
      model.add(tf.layers.inputLayer({ inputShape: [169] }));
      model.add(tf.layers.dense({ units: 100, activation: 'relu' }));
      model.add(tf.layers.batchNormalization());
      model.add(tf.layers.dense({ units: 100, activation: 'relu' }));
      model.add(tf.layers.batchNormalization());
      model.add(tf.layers.dense({ units: 100, activation: 'relu' }));
      // model.add(tf.layers.dropout({ rate: 0.25 }));
      model.add(tf.layers.dense({ units: 201, activation: 'sigmoid' }));
      model.compile({ optimizer: this.optimizer, loss: 'meanSquaredError' });

      this.model = model;
    }
  }

  evaluateStrategy(actions) {
    if (!this.model) this.initStrategy();
    this.currentPrediction = null;
    if (this.eps > Math.random()) {
      this.currentPrediction = 'RANDOM';
      return randomAction(actions);
    }
    const state = this.game.getState(this.player);
    let action;
    tf.tidy(() => {
      const t = tf.tensor([state]);
      let predictions = this.model.predict(t).arraySync()[0];
      this.currentPrediction = JSON.parse(JSON.stringify(predictions));
      predictions = predictions.map((prediction, index) => ({ prediction, index }));
      predictions.sort((a, b) => (a.prediction > b.prediction ? -1 : 1));
      predictions = predictions.map(p => p.index);
      predictions.some((idx, i) => {
        if (!actions[idx]) {
          if (i === 0) {
            this.addSample({
              state,
              action: idx,
              reward: -0.5,
              nextState: state,
            });
          }
          return false;
        }
        action = idx;
        return true;
      });
    });
    return action;
  }

  async train(batchSize, epochs) {
    return new Promise((resolve, reject) => {
      let x;
      let y;
      try {
        tf.tidy(() => {
          const batch = this.getSamples(batchSize);
          const states = tf.tensor(batch.map(b => b.state));
          const nextStates = tf.tensor(batch.map(b => b.nextState));

          const qSA = this.model.predictOnBatch(states).arraySync();
          const qSAD = this.model.predictOnBatch(nextStates).arraySync();

          const { x: tx, y: ty } = batch.reduce((vals, b, index) => {
            const { state, action, reward } = b;
            const currentQ = qSA[index];
            const maxIndex = qSAD[index].indexOf(Math.max(...qSAD[index]));
            currentQ[action] = reward + GAMMA * qSAD[index][maxIndex];
            // console.log('Action', action, 'reward', reward, 'GAMMA * qSAD[index][maxIndex]', GAMMA * qSAD[index][maxIndex]);
            vals.x.push(state);
            vals.y.push(currentQ);
            return vals;
          }, { x: [], y: [] });
          x = tx;
          y = ty;
        });
        this.model.fit(tf.tensor(x), tf.tensor(y), { batchSize, epochs, verbose: 0 })
          .then(value => {
            this.lossArr.push(...value.history.loss);
            // console.log(this.player.name, ': Loss:', value.history.loss);
            resolve();
          })
          .catch(err => {
            console.log('Error in fit');
            console.log(err);
            reject(err);
          });
      } catch (err) {
        console.log(err);
        reject();
      }
    });
  }
}

module.exports = Agent;
