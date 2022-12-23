/* eslint-disable react/no-unknown-property */
import React, {useEffect, useState, useCallback} from 'react';
import debounce from 'lodash.debounce';
import {Canvas} from '@react-three/fiber';
import ControlPanel from './ControlPanel';
import './App.css';
import Grid from './Grid';

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
  const [executionTime, setExecutionTime] = useState('');
  const [options, setOptions] = useState(null);
  const [previousElement, setPreviousElement] = useState(null);
  const [activeState, setActiveState] = useState(false);
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

          const {solution, visited, executionTime} = data;

          setPathLength(solution.length.toString());
          setVisitedNodes((solution.length + visited.length).toString());
          setExecutionTime(`${executionTime.toFixed(2)}ms`);

          visited.forEach((p) => {
            newMatrix[p[0]][p[1]] = 'Visited';
          });

          solution.forEach((p) => {
            newMatrix[p[0]][p[1]] = 'Solution';
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
      <div style={{width: 1377}}>
        <Canvas className='canvas' shadows onMouseDown={(mouseEvent) => {
          if (mouseEvent.buttons !== 1) return;

          const {clientX, clientY} = mouseEvent;
          const {left, top} = mouseEvent.target.getBoundingClientRect();
          const dx = (clientX - left);
          const dy = (clientY - top);
          const canvasWidth = mouseEvent.target.width;
          const canvasHeight = mouseEvent.target.height;
          const x = Math.floor(dx / (canvasWidth / gridWidth));
          const y = Math.floor(dy / (canvasHeight / gridHeight));

          const currentNodeState = graph.matrix[x][y];
          if (currentNodeState === 'Start' || currentNodeState === 'Goal') return;

          if (currentNodeState === 'Wall') {
            setActiveState(false);
            updateNode(x, y, '');
          } else {
            setActiveState(true);
            updateNode(x, y, 'Wall');
          }
        }} onMouseMove={(mouseEvent) => {
          if (mouseEvent.buttons !== 1) return;

          const {clientX, clientY} = mouseEvent;
          const {left, top} = mouseEvent.target.getBoundingClientRect();
          const dx = (clientX - left);
          const dy = (clientY - top);
          const canvasWidth = mouseEvent.target.width;
          const canvasHeight = mouseEvent.target.height;
          const x = Math.floor(dx / Math.floor(canvasWidth / gridWidth));
          const y = Math.floor(dy / Math.floor(canvasHeight / gridHeight));

          if (x === previousElement?.x && y === previousElement?.y) return;
          setPreviousElement({x, y});

          const currentNodeState = graph.matrix[x][y];
          if (!activeState && currentNodeState !== 'Wall') return;
          if (activeState && currentNodeState === 'Wall') return;
          if (currentNodeState === 'Start' || currentNodeState === 'Goal') return;

          updateNode(x, y, activeState ? 'Wall' : '');
        }} >
          <ambientLight intensity={1} />
          <directionalLight position={[0, 0, 100]} intensity={1} />
          <perspectiveCamera makeDefault position={[0, 0, -10.6]}>
            <Grid matrix={graph.matrix} height={gridHeight} width={gridWidth} />
          </perspectiveCamera>
        </Canvas>
      </div>
      <ControlPanel
        pathLength={pathLength}
        visitedNodes={visitedNodes}
        executionTime={executionTime}
        algorithmOptions={options?.algorithms}
        setAlgorithm={(algorithm) => setOptions({...options, algorithm})}
        algorithm={options?.algorithm}
        heuristicOptions={options?.heuristics}
        setHeuristic={(heuristic) => setOptions({...options, heuristic})}
        heuristic={options?.heuristic}
        templates={options?.templates}
        setTemplate={(template) => {
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
      />
    </div>
  );
};

export default App;
