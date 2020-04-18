const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const { ArgumentParser } = require('argparse');
const Agent = require('./Agent');
const Game = require('../game/Game');

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
});
parser.addArgument(
  ['-l', '--layers'],
  { help: 'Numer layers to initialize model with. Could be a number or 3 numbers separated by :' },
);
// parser.addArgument(
//   '--baz',
//   { help: 'baz bar' },
// );
const args = parser.parseArgs();
const layers = args.layers.split(':').map(l => parseInt(l, 10));

const currDate = new Date().toLocaleString('sv').replace(' ', '_').replace(':', '-').replace(':', '-');
const layersDir = layers.reduce((s, l, idx) => (idx !== layers.length - 1 ? `${s}:${l}` : s + l), 'layers');
const numOfAgents = 54; // 18, 54
const numGenerations = 100000;
const agentsPerGame = 3;

const shuffle = a => {
  let j;
  let x;
  let i;
  for (i = a.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
};

const deleteFolderRecursive = p => {
  console.log('deleteFolderRecursive', p);
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach(file => {
      const curPath = path.join(p, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(p);
  }
};

const getNewAgentChild = (a1, a2) => {
  const mixedWeights = Agent.getMixedWeights(a1.model, a2.model);
  const a = new Agent('evaluate', true, layers);
  a.model.setWeights(mixedWeights);
  return a;
};

(async () => {
  // initiate population
  let agents = new Array(numOfAgents).fill(0).map(() => new Agent('evaluate', true, layers));
  // const finalGameStates = [];
  const summaryWriter = tf.node.summaryFileWriter('tmp/competitors');

  for (let i = 0; i < numGenerations; i += 1) {
    tf.engine().startScope();
    const gameTimes = [];
    const numTurns = [];
    const avgRoadsPerPlayer = [];
    const avgVillagesPerPlayer = [];
    const avgCitiesPerPlayer = [];

    console.time(`---- Generation ${i + 1} ----`);
    shuffle(agents);
    const games = new Array(numOfAgents / agentsPerGame).fill(0).map((dummy, idx) => new Game(agents.slice(idx * 3, idx * 3 + 3)));
    let winners = [];
    await Promise.all(games.map(game => new Promise((resolve, reject) => {
      game.run();
      numTurns.push(game.numTurns);
      gameTimes.push(game.time);
      game.endGame();
      // finalGameStates.push(game.getState());
      winners.push(game.winner);
      avgRoadsPerPlayer.push(game.getAvgRoadsPerPlayer());
      avgVillagesPerPlayer.push(game.getAvgVillagesPerPlayer());
      avgCitiesPerPlayer.push(game.getAvgCitiesPerPlayer());
      resolve();
    })));
    winners = winners.map(id => agents.find(a => a.id === id));
    const children = winners.reduce((childArr, a) => {
      winners.forEach(a2 => {
        if (a.id !== a2.id && childArr.length < numOfAgents - winners.length) {
          childArr.push(getNewAgentChild(a, a2));
        }
      });
      return childArr;
    }, []);
    const losers = agents.filter(a => winners.findIndex(w => w.id === a.id) === -1);
    losers.forEach(l => tf.dispose(l.model));

    agents = [...winners, ...children];
    console.timeEnd(`---- Generation ${i + 1} ----`);
    console.log(`Average turns for gen: ${numTurns.reduce((sum, t) => sum + t, 0) / numTurns.length}`);
    console.log(`Average game time for gen: ${gameTimes.reduce((sum, t) => sum + t, 0) / gameTimes.length}`);
    summaryWriter.scalar('averageTurns', numTurns.reduce((sum, t) => sum + t, 0) / numTurns.length, i + 1);
    summaryWriter.scalar('averageGameTime', gameTimes.reduce((sum, t) => sum + t, 0) / gameTimes.length, i + 1);
    summaryWriter.scalar('avgRoadsPerPlayer', avgRoadsPerPlayer.reduce((sum, t) => sum + t, 0) / avgRoadsPerPlayer.length, i + 1);
    summaryWriter.scalar('avgVillagesPerPlayer', avgVillagesPerPlayer.reduce((sum, t) => sum + t, 0) / avgVillagesPerPlayer.length, i + 1);
    summaryWriter.scalar('avgCitiesPerPlayer', avgCitiesPerPlayer.reduce((sum, t) => sum + t, 0) / avgCitiesPerPlayer.length, i + 1);
    if ((i + 1) % 10 === 0) summaryWriter.flush();
    if ((i + 1) % 50 === 0) {
      await Promise.all(agents.slice(0, 3).map((agent, aIdx) => {
        const dir = `competitors_${i + 1}`;
        if (!fs.existsSync(`${__dirname}/models/${currDate}/${layersDir}/${dir}`)) fs.mkdirSync(`${__dirname}/models/${currDate}/${layersDir}/${dir}`, { recursive: true });
        return agent.model.save(`file://${__dirname}/models/${currDate}/${layersDir}/${dir}/model${aIdx}`);
      }));
    }
    // console.table(tf.memory());
    tf.engine().endScope();
  }

  summaryWriter.flush();
})();
