function seed() {
  return [...arguments]
}

function same([x, y], [j, k]) {
  return ( (x === j) && (y === k))
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  const state = this;
  let exists = false;

  // cidx = Cell Index
  for (let cidx = 0; cidx < state.length; cidx++) {
    if (same(state[cidx], cell)) { 
      exists = true;
      break;
    }
  }

  return exists;
}

const printCell = (cell, state) => {
  if ( contains.call(state, cell) ) {
    return '\u25A3';
  }else {
    return '\u25A2';
  }
};

const corners = (state = []) => {
  const response = {
    topRight: [0, 0],
    bottomLeft: [0, 0]
  };

  if (!state.length) { 
    return response;
  }

  const tracker = {x: [], y: []}
  for(let cell of state ) {
    const [x,y] = cell;
    tracker.x.push(x);
    tracker.y.push(y);
  };


  tracker.x.sort();
  tracker.y.sort();

  response.bottomLeft = [
    tracker.x[0],
    tracker.y[0],
  ]
  
  response.topRight = [
    tracker.x[tracker.x.length - 1],
    tracker.y[tracker.y.length - 1]
  ];

  return response;
};

const printCells = (state) => {
  const stateSearchSpace = corners(state);
  const [bx, by] = stateSearchSpace.bottomLeft;
  const [tx, ty] = stateSearchSpace.topRight;

  let result = '';

  for(let row=ty; row >= by; row--) {
    const currentRow = []
    for(let col=bx; col <= tx; col++) {
      const currentCell = [col, row]
      currentRow.push(printCell(currentCell, state));
    }

    result += currentRow.join(' ') + '\n';
  }

  return result;
};

const getNeighborsOf = ([x, y]) => {
  const neighbours = [
    [x-1, y+1], [x, y+1], [x+1, y+1],
    [x-1, y] /*, [x, y] */ , [x+1, y],
    [x-1, y-1], [x, y-1], [x+1, y-1]
  ];

  return neighbours;
};

const getLivingNeighbors = (cell, state) => {
  const neighbours = getNeighborsOf(cell);
  const _contains = contains.bind(state);

  const livingNeighbours = [];
  for (let neighbourCell of neighbours) {
    if (_contains(neighbourCell)) {
      livingNeighbours.push(neighbourCell);
    }
  };
  return livingNeighbours;
};

const willBeAlive = (cell, state) => {
  const livingNeighbours = getLivingNeighbors(cell, state);

  if (livingNeighbours.length === 3) { return true; }
  if (livingNeighbours.length == 2 && contains.call(state, cell)) { return true; }

  return false;
};

const calculateNext = (state) => {
  const stateSearchSpace = corners(state);
  const extendedBottomLeft = stateSearchSpace.bottomLeft.map(point => {
    return point - 1;
  });
  const extendedTopRight = stateSearchSpace.topRight.map(point => {
    return point + 1;
  });
  
  const [bx, by] = extendedBottomLeft;
  const [tx, ty] = extendedTopRight;
  
  const nextState = [];
  let currentCell;

  for(let row = ty; row >= by; row--) { // Printing across and down, starting from [bx, ty]
    for(let col = bx; col <= tx; col++) {
      currentCell = [col, row]; 
      
      if (willBeAlive(currentCell, state)) {
        nextState.push(currentCell);
      }
    }
  }

  return nextState;
};

const iterate = (state, iterations) => {
  const newGameStates = [];

  let cycles;
  let currentGameState;

  cycles = iterations + 1; // +1 accounts for the initial game state
  currentGameState = state;

  while (cycles > 0) {
    newGameStates.push(currentGameState);
    currentGameState = calculateNext(currentGameState);
    cycles--;
  }

  return newGameStates;
};

const main = (pattern, iterations) => {
  const initialGameState = startPatterns[pattern];
  const futureGameStates = iterate(initialGameState, iterations);
  for(const futureGameState of futureGameStates) {
    console.log(printCells(futureGameState) + '\n');
  }
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;