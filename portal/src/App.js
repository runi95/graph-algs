import React, {useEffect, useState, useCallback} from 'react';
import debounce from 'lodash.debounce';
import Grid from './Grid';
import RadioButton from './RadioButton';
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
  const debouncedSearch = useCallback(
      debounce((options) => search(options), 500),
      [],
  );
  const [pathLength, setPathLength] = useState('');
  const [visitedNodes, setVisitedNodes] = useState('');
  const [options, setOptions] = useState(null);
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
    if (options === null) {
      fetch('http://localhost:8080/api/options')
          .then((response) => response.json())
          .then((data) => {
            setOptions(data);
          });
    } else {
      if (options.algorithm && options.heuristic) {
        search(options);
      } else {
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

        setGraph({...graph, matrix: newMatrix});
      }
    }
  }, [options]);

  function search(options) {
    const data = JSON.stringify({
      ...graph,
      algorithm: options.algorithm.value,
      heuristic: options.heuristic.value,
    });

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

  const updateNode = (x, y, newNodeState) => {
    const newMatrix = [...graph.matrix];
    newMatrix[x][y] = newNodeState;
    updateGraph(newMatrix);
  };

  const updateGraph = (newMatrix) => {
    setGraph({...graph, matrix: newMatrix});
    debouncedSearch(options);
  };

  return (
    <div className='App'>
      <Grid matrix={graph.matrix} updateGraph={updateNode} />
      <div className='ControlPanel'>
        <h1>Information</h1>
        <p>Path Length: {pathLength}</p>
        <p>Visited nodes: {visitedNodes}</p>
        <h1>Options</h1>
        {
          options ?
            <div>
              <p>Algorithm:</p>
              {options.algorithms.map((algorithm) =>
                <RadioButton
                  key={algorithm.value}
                  label={algorithm.label}
                  checked={algorithm.value === options.algorithm.value}
                  onChange={() => setOptions({...options, algorithm})}
                />)}
              <p>Heuristic:</p>
              {options.heuristics.map((heuristic) =>
                <RadioButton
                  key={heuristic.value}
                  disabled={options.algorithm?.usesHeuristics !== true}
                  label={heuristic.label}
                  checked={heuristic.value === options.heuristic.value}
                  onChange={() => setOptions({...options, heuristic})}
                />)}
              <p>Templates:</p>
              {options.templates.map((template) =>
                <RadioButton
                  key={template}
                  label={template}
                  checked={false}
                  onChange={() => {
                    fetch(`http://localhost:8080/templates/${template}.json`, {
                      method: 'GET',
                    })
                        .then((response) => response.json())
                        .then((data) => {
                          const newMatrix = [...graph.matrix];
                          data.forEach((_, x) =>
                            data[x].forEach((_, y) =>
                              newMatrix[x][y] = data[x][y]));
                          updateGraph(newMatrix);
                        });
                  }}
                />)}
            </div> :
          undefined
        }
      </div>
    </div>
  );
};

export default App;
