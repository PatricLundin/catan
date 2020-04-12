const fs = require('fs');
const path = require('path');
const Agent = require('./Agent');
const Game = require('../game/Game');

const numOfAgents = 3;
const numGames = 1000;
const numTrainingOnBatch = 2000;
const BATCH_SIZE = 100;
const EPOCHS = 1;

const networkAgents = new Array(numOfAgents).fill(0).map(() => new Agent('evaluate'));
let trainingData;
if (fs.existsSync(path.join(__dirname, 'trainingData.txt'))) {
  trainingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'trainingData.txt')));
} else {
  const randomAgents = new Array(numOfAgents).fill(0).map(() => new Agent());
  const numTurns = [];
  const gameTimes = [];

  console.time('Data generation time:');
  for (let i = 0; i < numGames; i += 1) {
    const game = new Game(randomAgents);
    game.run();
    numTurns.push(game.numTurns);
    gameTimes.push(game.time);
    game.endGame();
    if (i % 50 === 0) console.log(`Progress: ${i}/${numGames}`);
  }
  console.timeEnd('Data generation time:');

  trainingData = randomAgents.reduce((data, agent) => ([...data, ...agent.memory]), []);
  console.log('Length of Training data', trainingData.length);
  console.log('Average game time', gameTimes.reduce((sum, t) => sum + t, 0) / gameTimes.length, 'ms');

  fs.writeFileSync(path.join(__dirname, 'trainingData.txt'), JSON.stringify(trainingData), err => {
    if (err) throw err;
    console.log('Saved to trainingData.txt');
  });
}

console.log(trainingData.length);
networkAgents.forEach(agent => agent.setMemory(trainingData));

(async () => {
  console.time('Network training times');
  for (let i = 0; i < numTrainingOnBatch; i += 1) {
    // eslint-disable-next-line
    await Promise.all(networkAgents.map(agent => agent.train(BATCH_SIZE, EPOCHS)));
    if (i % 50 === 0) console.log(`Progress: ${i}/${numTrainingOnBatch}`);
  }
  console.timeEnd('Network training times');

  networkAgents.forEach(agent => console.log(agent.lossArr[agent.lossArr.length - 1]));
  await Promise.all(networkAgents.map((agent, idx) => agent.model.save(`file://${__dirname}/models/model${idx + 1}`)));
})();
