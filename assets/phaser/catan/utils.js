import {
  valTogridType,
  tileIdxToGrid,
  nodeIdxToNodePos,
  nodeToHex,
} from './constants';

export default boardData => {
  const { types, values, harbors } = boardData;
  const board = types.map((type, idx) => ({
    x: tileIdxToGrid[idx].x,
    y: tileIdxToGrid[idx].y,
    type: valTogridType[type],
    value: values[idx],
    nodes: [],
  }));

  const nodes = nodeIdxToNodePos.map((n, idx) => ({
    x: n.x,
    y: n.y,
    type: 'EMPTY',
    harbor: harbors[idx],
    hexIds: nodeToHex[idx],
  }));
  nodes.forEach(n => n.hexIds.forEach(id => board[id].nodes.push((({
    x: n.x,
    y: n.y,
    harbor: n.harbor,
    connections: [],
  })))));

  board.forEach(b => { // Fix node order issue
    const tmp = b.nodes[3];
    // eslint-disable-next-line
    b.nodes[3] = b.nodes[5];
    // eslint-disable-next-line
    b.nodes[5] = tmp;
  });

  return {
    board,
    nodes,
  };
};

// export default parseBoard;
