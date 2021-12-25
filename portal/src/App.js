import React, {useEffect, useState, useCallback} from 'react';
import debounce from 'lodash.debounce';
import Grid from './Grid';
import './App.css';

const gridHeight = 20;
const gridWidth = 32;
const initialStart = {
  x: 1,
  y: gridHeight - 2,
};
const initialGoal = {
  x: gridWidth - 2,
  y: 1,
};

function App() {
  const debouncedSearch = useCallback(debounce(() => search(), 500), []);
  const [pathLength, setPathLength] = useState('');
  const [visitedNodes, setVisitedNodes] = useState('');
  const [graph, setGraph] = useState({
    start: initialStart,
    goal: initialGoal,
    matrix: [...Array(gridWidth)]
        .map((_, x) => [...Array(gridHeight)]
            .map((_, y) => {
              if (x === initialStart.x && y === initialStart.y) {
                return 'Start';
              }

              if (x === initialGoal.x && y === initialGoal.y) {
                return 'Goal';
              }

              return '';
            })),
  });

  useEffect(() => {
    search();
  }, []);

  function search() {
    const data = JSON.stringify(graph);
    fetch('http://localhost:8080/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    })
        .then((response) => response.json())
        .then((data) => {
          const newMatrix = [...graph.matrix];

          // Reset visited and solution states
          for (let x = 0; x < newMatrix.length; x++) {
            for (let y = 0; y < newMatrix[x].length; y++) {
              const tileState = newMatrix[x][y];
              if (tileState === 'Visited' || tileState === 'Solution') {
                newMatrix[x][y] = '';
              }
            }
          }

          const {solution, visited} = data;

          setPathLength(solution.length.toString());
          setVisitedNodes((solution.length + visited.length).toString());

          visited.forEach(({x, y}) => {
            newMatrix[x][y] = 'Visited';
          });

          solution.forEach(({x, y}) => {
            newMatrix[x][y] = 'Solution';
          });

          setGraph({...graph, matrix: newMatrix});
        });
  }

  const updateGraph = (x, y, newNodeState) => {
    const newMatrix = [...graph.matrix];
    newMatrix[x][y] = newNodeState;
    setGraph({...graph, matrix: newMatrix});

    debouncedSearch();
  };

  return (
    <div className="App">
      <Grid matrix={graph.matrix} updateGraph={updateGraph} />
      <div className="ControlPanel">
        <h1>Information</h1>
        <p>Path Length: {pathLength}</p>
        <p>Visited nodes: {visitedNodes}</p>
      </div>
    </div>
  );
};

export default App;
