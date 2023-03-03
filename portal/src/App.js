/* eslint-disable react/no-unknown-property */
import React, {useEffect, useState, useCallback, useRef} from 'react';
import debounce from 'lodash.debounce';
import {Canvas} from '@react-three/fiber';
import {DoubleSide, Vector3} from 'three';
import {OrbitControls} from '@react-three/drei';
import ControlPanel from './ControlPanel';
import Tile from './Tile';
import './App.css';
import ToggleButton from './ToggleButton';
import Button from './Button';

const initialMatrixScale = 32;
const initialStart = {
  x: 1,
  y: 1,
  z: 0,
};
const initialGoal = {
  x: initialMatrixScale - 2,
  y: initialMatrixScale - 2,
  z: 0,
};

function App() {
  const debouncedSearch = useCallback(
      debounce((options, graph) => search(options, graph), 500),
      [],
  );
  const highlightMeshRef = useRef(null);
  const canvasRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const [activeState, setActiveState] = useState(false);
  const [editState, setEditState] = useState(true);
  const [
    controlPanelVisibilityState,
    setControlPanelVisibilityState,
  ] = useState(false);
  const [pathLength, setPathLength] = useState('');
  const [visitedNodes, setVisitedNodes] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [options, setOptions] = useState(null);
  const [graph, setGraph] = useState({
    start: initialStart,
    goal: initialGoal,
    matrixScale: initialMatrixScale,
    matrix: [...Array(initialMatrixScale * initialMatrixScale)]
        .map((_, i) => {
          const x = i % initialMatrixScale;
          const y = Math.floor(i / initialMatrixScale);
          if (x === initialStart.x && y === initialStart.y) {
            return 'Start';
          }

          if (x === initialGoal.x && y === initialGoal.y) {
            return 'Goal';
          }

          return '';
        }),
  });

  useEffect(() => {
    if (options === null) {
      fetch('http://localhost:8080/api/options')
          .then((response) => {
            if (!response.ok) throw new Error('Network response not OK');
            return response.json();
          })
          .then((data) => {
            setOptions(data);
          })
          .catch((err) => console.error(err));
    } else {
      if (options.algorithm && options.heuristic) {
        search(options, graph);
      } else {
        const newMatrix = [...graph.matrix];

        // Reset visited and solution states
        for (let i = 0; i < graph.matrixScale * graph.matrixScale; i++) {
          if (newMatrix[i] === 'Visited' || newMatrix[i] === 'Solution') {
            newMatrix[i] = '';
          }
        }

        setGraph({...graph, matrix: newMatrix});
      }
    }
  }, [options]);

  function graphToCanvasPosition(x, y, z) {
    return new Vector3(
        0.5 * graph.matrixScale - x - 0.5,
        y - 0.5 * graph.matrixScale + 0.5,
        z - 0.25,
    );
  }

  function canvasToGraphPosition(x, y, z) {
    return new Vector3(
        0.5 * graph.matrixScale - x - 0.5,
        y + 0.5 * graph.matrixScale - 0.5,
        z + 0.25,
    );
  }

  function search(options, graph) {
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
        .then((response) => {
          if (!response.ok) throw new Error('Network response not OK');
          return response.json();
        })
        .then((data) => {
          const newMatrix = [...graph.matrix];

          // Reset visited and solution states
          for (let i = 0; i < graph.matrixScale * graph.matrixScale; i++) {
            if (newMatrix[i] === 'Visited' || newMatrix[i] === 'Solution') {
              newMatrix[i] = '';
            }
          }

          const {solution, visited, executionTime} = data;

          setPathLength(solution.length.toString());
          setVisitedNodes((solution.length + visited.length).toString());
          setExecutionTime(`${executionTime.toFixed(2)}ms`);

          visited.forEach((p) => {
            newMatrix[p[0] + graph.matrixScale * p[1]] = 'Visited';
          });

          solution.forEach((p) => {
            newMatrix[p[0] + graph.matrixScale * p[1]] = 'Solution';
          });

          setGraph({...graph, matrix: newMatrix});
        })
        .catch((err) => console.error(err));
  }

  const updateNode = (x, y, newNodeState) => {
    const newMatrix = [...graph.matrix];
    newMatrix[x + graph.matrixScale * y] = newNodeState;
    updateGraph(newMatrix);
  };

  const updateGraph = (newMatrix) => {
    const newGraph = {...graph, matrix: newMatrix};
    setGraph(newGraph);
    debouncedSearch(options, newGraph);
  };

  return (
    <div className='App'>
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          outline: 'none',
        }}
        ref={canvasRef}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, -1.25 * graph.matrixScale],
        }}
        className='canvas'
        shadows
        onPointerDown={(e) => {
          if (e.buttons !== 4) return;
          orbitControlsRef.current.reset();
        }}
      >
        <mesh
          name={'ground'}
          onPointerMove={(e) => {
            if (!editState) return;
            e.intersections.forEach((intersect) => {
              const highlightPos = new Vector3()
                  .copy(intersect.point)
                  .floor()
                  .addScalar(0.5);
              highlightMeshRef.current.position
                  .set(highlightPos.x, highlightPos.y, 0);
            });

            if (e.buttons === 1) {
              const {x, y, z} = highlightMeshRef.current.position;
              const graphPosition = canvasToGraphPosition(x, y, z);
              const nodeState = graph.matrix[
                  graphPosition.x + graph.matrixScale * graphPosition.y
              ];
              if (nodeState === 'Start' || nodeState === 'Goal') return;
              if (activeState && nodeState !== 'Wall') {
                updateNode(graphPosition.x, graphPosition.y, 'Wall');
              } else if (!activeState && nodeState === 'Wall') {
                updateNode(graphPosition.x, graphPosition.y, '');
              }
            }
          }}
          onPointerDown={(e) => {
            if (!editState) return;
            if (e.buttons !== 1) return;
            const {x, y, z} = new Vector3()
                .copy(e.intersections[0].point)
                .floor()
                .addScalar(0.5);
            const graphPosition = canvasToGraphPosition(x, y, z);
            const nodeState = graph.matrix[
                graphPosition.x + graph.matrixScale * graphPosition.y
            ];
            if (nodeState === 'Start' || nodeState === 'Goal') return;
            if (nodeState === 'Wall') {
              setActiveState(false);
              updateNode(graphPosition.x, graphPosition.y, '');
            } else {
              setActiveState(true);
              updateNode(graphPosition.x, graphPosition.y, 'Wall');
            }
          }}
        >
          <planeGeometry args={[graph.matrixScale, graph.matrixScale]}/>
          <meshBasicMaterial side={DoubleSide} visible={false} />
        </mesh>
        <gridHelper
          rotation={[-Math.PI / 2, 0, 0]}
          args={[graph.matrixScale, graph.matrixScale]}
        />
        <mesh
          ref={highlightMeshRef}
          position={[0.5, 0.5, 0.5]}
          visible={editState}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial side={DoubleSide} />
        </mesh>
        {graph.matrix.map((type, i) => {
          const x = i % graph.matrixScale;
          const y = Math.floor(i / graph.matrixScale);
          const canvasPosition = graphToCanvasPosition(x, y, 0);
          return <Tile
            key={`tile-${i}`}
            type={type}
            position={canvasPosition}
          />;
        })}
        <OrbitControls
          ref={orbitControlsRef}
          enableRotate={!editState}
          enablePan={!editState}
        />
      </Canvas>
      <div className='information-panel'>
        <div style={{
          display: 'flex',
          textAlign: 'right',
          justifyContent: 'space-evenly',
        }}>
          <ToggleButton defaultChecked={editState} onChange={(e) => {
            setEditState(e.target.checked);
          }} />
          <Button onClick={() => {
            setControlPanelVisibilityState(true);
          }} text='Settings' />
        </div>
        <div style={{
          pointerEvents: 'none',
          marginTop: 15,
          opacity: 0.5,
          fontFamily: 'monospace',
          fontSize: 'larger',
          fontWeight: 700,
          textShadow: '-1px -1px 2px #000, 3px -1px 2px #000, -1px 1px 2px #000, 1px 1px 2px #000',
        }}>
          <p style={{margin: 0}}>Path Length: {pathLength}</p>
          <p style={{margin: 0}}>Visited nodes: {visitedNodes}</p>
          <p style={{margin: 0}}>Time: {executionTime}</p>
        </div>
      </div>
      <ControlPanel
        onPanelClose={() => {
          setControlPanelVisibilityState(false);
        }}
        isHidden={!controlPanelVisibilityState}
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
              .then((response) => {
                if (!response.ok) throw new Error('Network response not OK');
                return response.json();
              })
              .then((data) => {
                const newGraph = {
                  ...graph,
                  ...data,
                };
                setGraph(newGraph);
                debouncedSearch(options, newGraph);
              })
              .catch((err) => console.error(err));
        }}
      />
    </div>
  );
};

export default App;
