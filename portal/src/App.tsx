import {useEffect, useState, useCallback, useRef} from 'react';
import debounce from 'lodash.debounce';
import {Canvas} from '@react-three/fiber';
import {DoubleSide, Vector3, type Mesh} from 'three';
import {OrbitControls} from '@react-three/drei';
import type * as threelib from 'three-stdlib';
import ControlPanel from './ControlPanel';
import Tile from './Tile';
import './App.css';
import CameraButton from './buttons/CameraButton';
import GearButton from './buttons/GearButton';
import UndoButton from './buttons/UndoButton';
import RedoButton from './buttons/RedoButton';
import {HistoryLinkedList} from './utils/HistoryLinkedList';

interface Algorithm {
  label: string;
  value: string;
  usesHeuristics: boolean;
}

interface Heuristic {
  label: string;
  value: string;
}

interface Options {
  algorithms: Algorithm[];
  algorithm: Algorithm;
  heuristics: Heuristic[];
  heuristic: Heuristic;
  templates: string[];
}

interface GraphVector {
  x: number;
  y: number;
  z: number;
}

interface Graph {
  start: GraphVector;
  goal: GraphVector;
  matrixScale: number;
  matrix: string[];
}

interface RunResponse {
  solution: number[][];
  visited: number[][];
  executionTime: number;
}

const initialMatrixScale = 32;
const initialStart = {
  x: 1,
  y: 1,
  z: 0
};
const initialGoal = {
  x: initialMatrixScale - 2,
  y: initialMatrixScale - 2,
  z: 0
};

const graphHistoryLinkedList = new HistoryLinkedList<string[]>();

function App() {
  const debouncedSearch = useCallback(() =>
    debounce((options, graph) => { search(options, graph); }, 500), []);
  const highlightMeshRef = useRef<Mesh>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const orbitControlsRef = useRef<threelib.OrbitControls>(null!);
  const [activeState, setActiveState] = useState(false);
  const [editState, setEditState] = useState(true);
  const [
    controlPanelVisibilityState,
    setControlPanelVisibilityState
  ] = useState(false);
  const [options, setOptions] = useState<Options>(null!);
  const [graph, setGraph] = useState<Graph>({
    start: initialStart,
    goal: initialGoal,
    matrixScale: initialMatrixScale,
    matrix: [...Array(initialMatrixScale * initialMatrixScale)].map((_, i) => {
      const x = i % initialMatrixScale;
      const y = Math.floor(i / initialMatrixScale);
      if (x === initialStart.x && y === initialStart.y) {
        return 'Start';
      }

      if (x === initialGoal.x && y === initialGoal.y) {
        return 'Goal';
      }

      return '';
    })
  });

  useEffect(() => {
    if (options === null) {
      fetch('http://localhost:8080/api/options').then(async(response) => {
        if (!response.ok) throw new Error('Network response not OK');
        return await response.json();
      }).then((data) => {
        setOptions(data);
      }).catch((err) => { console.error(err); });
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

  function graphToCanvasPosition(x: number, y: number, z: number) {
    return new Vector3(
      0.5 * graph.matrixScale - x - 0.5,
      y - 0.5 * graph.matrixScale + 0.5,
      z - 0.25
    );
  }

  function canvasToGraphPosition(x: number, y: number, z: number) {
    return new Vector3(
      0.5 * graph.matrixScale - x - 0.5,
      y + 0.5 * graph.matrixScale - 0.5,
      z + 0.25
    );
  }

  function search(options: Options, graph: Graph) {
    const data = JSON.stringify({
      ...graph,
      algorithm: options.algorithm.value,
      heuristic: options.heuristic.value
    });

    fetch('http://localhost:8080/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then(async(response) => {
        if (!response.ok) throw new Error('Network response not OK');
        return await response.json();
      })
      .then((data: RunResponse) => {
        const newMatrix = [...graph.matrix];

        // Reset visited and solution states
        for (let i = 0; i < graph.matrixScale * graph.matrixScale; i++) {
          if (newMatrix[i] === 'Visited' || newMatrix[i] === 'Solution') {
            newMatrix[i] = '';
          }
        }

        const {solution, visited} = data;

        visited.forEach((p: number[]) => {
          newMatrix[p[0] + graph.matrixScale * p[1]] = 'Visited';
        });

        solution.forEach((p: number[]) => {
          newMatrix[p[0] + graph.matrixScale * p[1]] = 'Solution';
        });

        graphHistoryLinkedList.add(newMatrix);
        setGraph({...graph, matrix: newMatrix});
      })
      .catch((err) => { console.error(err); });
  }

  const updateNode = (x: number, y: number, newNodeState: string) => {
    const newMatrix = [...graph.matrix];
    newMatrix[x + graph.matrixScale * y] = newNodeState;
    updateGraph(newMatrix);
  };

  const updateGraph = (newMatrix: string[]) => {
    const newGraph = {...graph, matrix: newMatrix};
    setGraph(newGraph);
    debouncedSearch();
  };

  const undo = () => {
    const prev = graphHistoryLinkedList.undo();
    if (prev !== null) {
      setGraph({...graph, matrix: prev});
    }
  };

  const redo = () => {
    const next = graphHistoryLinkedList.redo();
    if (next !== null) {
      setGraph({...graph, matrix: next});
    }
  };

  return (
    <div className='App'>
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          outline: 'none'
        }}
        ref={canvasRef}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, -1.25 * graph.matrixScale]
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
              (highlightMeshRef.current).position
                .set(highlightPos.x, highlightPos.y, 0);
            });

            if (e.buttons === 1) {
              const {x, y, z} = (highlightMeshRef.current).position;
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
          <planeGeometry args={[graph.matrixScale, graph.matrixScale]} />
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
        {graph.matrix.map((type: string, i: number) => {
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
          gap: 10
        }}>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            undo();
          }}>
            <UndoButton />
          </div>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            redo();
          }}>
            <RedoButton />
          </div>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            setEditState(!editState);
          }}>
            <CameraButton isActive={editState} />
          </div>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            setControlPanelVisibilityState(true);
          }}>
            <GearButton />
          </div>
        </div>
      </div>
      <ControlPanel
        onPanelClose={() => {
          setControlPanelVisibilityState(false);
        }}
        isHidden={!controlPanelVisibilityState}
        algorithmOptions={options?.algorithms}
        setAlgorithm={
          (algorithm: Algorithm) => { setOptions({...options, algorithm}); }}
        algorithm={options?.algorithm}
        heuristicOptions={options?.heuristics}
        setHeuristic={
          (heuristic: Heuristic) => { setOptions({...options, heuristic}); }}
        heuristic={options?.heuristic}
        templates={options?.templates}
        setTemplate={(template: string) => {
          fetch(`http://localhost:8080/templates/${template}.json`, {
            method: 'GET'
          })
            .then(async(response) => {
              if (!response.ok) throw new Error('Network response not OK');
              return await response.json();
            })
            .then((data) => {
              const newGraph = {
                ...graph,
                ...data
              };
              setGraph(newGraph);
              debouncedSearch();
            })
            .catch((err) => { console.error(err); });
        }}
      />
    </div>
  );
};

export default App;
