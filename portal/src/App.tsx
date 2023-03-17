import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import debounce from 'lodash.debounce';
import {Canvas} from '@react-three/fiber';
import {DoubleSide, type InstancedMesh, Vector3, Color, Matrix4} from 'three';
import {OrbitControls} from '@react-three/drei';
import type * as threelib from 'three-stdlib';
import ControlPanel from './ControlPanel';
import './App.css';
import CameraButton from './buttons/CameraButton';
import GearButton from './buttons/GearButton';
import UndoButton from './buttons/UndoButton';
import RedoButton from './buttons/RedoButton';
import {HistoryLinkedList} from './utils/HistoryLinkedList';
import UpButton from './buttons/UpButton';
import DownButton from './buttons/DownButton';
import {NodeTypes} from './utils/NodeTypes';
import {Graph} from './utils/Graph';

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

interface RunResponse {
  solution: number[][];
  visited: number[][];
  executionTime: number;
}

const typeToColorCode = (type: NodeTypes) => {
  switch (type) {
    case NodeTypes.START:
      return '#afa';
    case NodeTypes.GOAL:
      return '#aaf';
    case NodeTypes.SOLUTION:
      return '#49f';
    case NodeTypes.VISITED:
      return '#324c75';
    case NodeTypes.WALL:
    case NodeTypes.EMPTY:
    default:
      return '#aaa';
  }
};

const tempColor = new Color();
const tempMatrix = new Matrix4();
const initialMatrixScale = 32;
const initialMatrixScalePow = initialMatrixScale * initialMatrixScale;
const floors = 32;
const matrixSize = initialMatrixScalePow * floors;
const initialStart = new Vector3(1, 1, 0);
const initialGoal = new Vector3(
  initialMatrixScale - 2,
  initialMatrixScale - 2,
  0
);
const graphHistoryLinkedList =
  new HistoryLinkedList<Array<[number, NodeTypes]>>();

function App() {
  const colorArray = useMemo(() => Float32Array.from(
    new Array(matrixSize)
      .fill(undefined, undefined)
      .flatMap(
        () => [...tempColor.set('#fff').toArray(), 1])), []);
  const debouncedSearch = useMemo(() =>
    debounce((options, graph, instancedMesh) => {
      search(options, graph, instancedMesh);
    }, 500), []);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const orbitControlsRef = useRef<threelib.OrbitControls>(null!);
  const [instancedMesh, setInstancedMesh] = useState<InstancedMesh>(null!);
  const instancedMeshRef = useCallback((instancedMesh: InstancedMesh) => {
    setInstancedMesh(instancedMesh);
  }, []);
  const [activeState, setActiveState] = useState(false);
  const [editState, setEditState] = useState(true);
  const [currentFloorLevel, setCurrentFloorLevel] = useState(1);
  const [
    controlPanelVisibilityState,
    setControlPanelVisibilityState
  ] = useState(false);
  const [options, setOptions] = useState<Options>(null!);
  const graph = useMemo(
    () => new Graph(initialMatrixScale, initialStart, initialGoal),
    []
  );
  const selection = useMemo(() => ({
    positions: new Map<number, Vector3>()
  }), []);

  useEffect(() => {
    if (options === null) return;
    if (options.algorithm && options.heuristic) {
      search(options, graph, instancedMesh);
    } else {
      // Reset visited and solution states
      graph.matrix.forEach((node: NodeTypes, key: number) => {
        if (node !== NodeTypes.VISITED && node !== NodeTypes.SOLUTION) {
          graph.matrix.delete(key);
        }
      });
    }
  }, [options]);

  // Only runs once!
  useEffect(() => {
    if (instancedMesh === null) return;

    fetch('http://localhost:8080/api/options').then(async(response) => {
      if (!response.ok) throw new Error('Network response not OK');
      return await response.json();
    }).then((data) => {
      setOptions(data);
    }).catch((err) => { console.error(err); });

    for (let i = 0; i < graph.matrixSize; i++) {
      const x = i % graph.matrixScale;
      const y = Math.floor(i / graph.matrixScale) % graph.matrixScale;
      const z = Math.floor(i / graph.matrixScalePow);
      const canvasPosition = graphToCanvasPosition(x, y, z);
      tempMatrix.setPosition(canvasPosition);
      instancedMesh.setMatrixAt(i, tempMatrix);
    }

    updateGraph(instancedMesh);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }, [instancedMesh]);

  const updateGraph = (instancedMesh: InstancedMesh) => {
    for (let i = 0; i < graph.matrixSize; i++) {
      const node = graph.matrix.get(i) ?? NodeTypes.EMPTY;
      tempColor.set(typeToColorCode(node)).toArray(colorArray, i * 4);
      if (node === NodeTypes.EMPTY) {
        colorArray[i * 4 + 3] = 0;
        continue;
      }

      if (node === NodeTypes.VISITED) {
        colorArray[i * 4 + 3] = 0.6;
      } else {
        colorArray[i * 4 + 3] = 1;
      }
    }

    instancedMesh.geometry.attributes.color.needsUpdate = true;
  };

  function graphToCanvasPosition(x: number, y: number, z: number) {
    return new Vector3(
      0.5 * graph.matrixScale - x - 0.5,
      y - 0.5 * graph.matrixScale + 0.5,
      -0.5 * z - 0.25
    );
  }

  function canvasToGraphPosition(x: number, y: number, z: number) {
    return new Vector3(
      0.5 * graph.matrixScale - x - 0.5,
      y + 0.5 * graph.matrixScale - 0.5,
      z
    );
  }

  function search(
    options: Options,
    graph: Graph,
    instancedMesh: InstancedMesh
  ) {
    const data = JSON.stringify({
      ...graph,
      matrix: Object.fromEntries(Array.from(graph.matrix.entries()).filter(
        (pair) => pair[1] !== NodeTypes.SOLUTION &&
                  pair[1] !== NodeTypes.VISITED
      )),
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
        // Reset visited and solution states
        graph.matrix.forEach((node: NodeTypes, key: number) => {
          if (node !== NodeTypes.VISITED && node !== NodeTypes.SOLUTION) {
            graph.matrix.set(key, node);
          }
        });

        const {solution, visited} = data;

        visited.forEach((p: number[]) => {
          graph.matrix.set(
            p[0] + graph.matrixScale * p[1] + graph.matrixScalePow * p[2],
            NodeTypes.VISITED
          );
        });

        solution.forEach((p: number[]) => {
          graph.matrix.set(
            p[0] + graph.matrixScale * p[1] + graph.matrixScalePow * p[2],
            NodeTypes.SOLUTION
          );
        });

        updateGraph(instancedMesh);
        graphHistoryLinkedList.add(Array.from(graph.matrix.entries()));
      })
      .catch((err) => { console.error(err); });
  }

  const updateNode = (key: number, newNodeState: NodeTypes) => {
    tempColor.set(typeToColorCode(newNodeState)).toArray(colorArray, key * 4);
    if (newNodeState === NodeTypes.EMPTY) {
      colorArray[key * 4 + 3] = 0;
    } else if (newNodeState === NodeTypes.VISITED) {
      colorArray[key * 4 + 3] = 0.7;
    } else {
      colorArray[key * 4 + 3] = 1;
    }

    return key;
  };

  const updateNodeAndSearch = (
    x: number,
    y: number,
    z: number,
    newNodeState: NodeTypes
  ) => {
    const key = x +
    graph.matrixScale * y +
    graph.matrixScalePow * z;
    updateNode(key, newNodeState);
    graph.matrix.set(key, newNodeState);
    instancedMesh.geometry.attributes.color.needsUpdate = true;
    debouncedSearch(options, graph, instancedMesh);
  };

  const undo = () => {
    const prev = graphHistoryLinkedList.undo();
    if (prev !== null) {
      graph.matrix.clear();
      for (const entry of prev) {
        graph.matrix.set(entry[0], entry[1]);
      }
      updateGraph(instancedMesh);
    }
  };

  const redo = () => {
    const next = graphHistoryLinkedList.redo();
    if (next !== null) {
      graph.matrix.clear();
      for (const entry of next) {
        graph.matrix.set(entry[0], entry[1]);
      }
      updateGraph(instancedMesh);
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
          position={[0, 0, 0.5 - 0.5 * currentFloorLevel]}
          onPointerLeave={() => {
            if (instancedMesh === null) return;
            if (!editState) return;
            selection.positions.forEach((_, i) => {
              updateNode(i, graph.matrix.get(i) ?? NodeTypes.EMPTY);
            });
            selection.positions.clear();
            instancedMesh.geometry.attributes.color.needsUpdate = true;
          }}
          onPointerMove={(e) => {
            if (instancedMesh === null) return;
            if (!editState) return;

            selection.positions.forEach((_, i) => {
              updateNode(i, graph.matrix.get(i) ?? NodeTypes.EMPTY);
            });
            selection.positions.clear();

            e.intersections.forEach((intersect) => {
              const highlightPos = new Vector3()
                .copy(intersect.point)
                .floor()
                .addScalar(0.5);
              const {x, y} = highlightPos;
              const graphPosition = canvasToGraphPosition(
                x,
                y,
                currentFloorLevel - 1
              );
              const key = graphPosition.x +
                graph.matrixScale * graphPosition.y +
                graph.matrixScalePow * graphPosition.z;
              selection.positions.set(key, graphPosition);
              updateNode(key, NodeTypes.WALL);
            });

            instancedMesh.geometry.attributes.color.needsUpdate = true;

            if (e.buttons === 1) {
              selection.positions.forEach((graphPosition, i) => {
                const nodeState = graph.matrix.get(i);
                if (
                  nodeState === NodeTypes.START ||
                  nodeState === NodeTypes.GOAL
                ) return;
                if (activeState && nodeState !== NodeTypes.WALL) {
                  updateNodeAndSearch(
                    graphPosition.x,
                    graphPosition.y,
                    graphPosition.z,
                    NodeTypes.WALL
                  );
                } else if (!activeState && nodeState === NodeTypes.WALL) {
                  updateNodeAndSearch(
                    graphPosition.x,
                    graphPosition.y,
                    graphPosition.z,
                    NodeTypes.EMPTY
                  );
                }
              });
            }
          }}
          onPointerDown={(e) => {
            if (!editState) return;
            if (e.buttons !== 1) return;
            const {x, y} = new Vector3()
              .copy(e.intersections[0].point)
              .floor()
              .addScalar(0.5);
            const graphPosition = canvasToGraphPosition(
              x,
              y,
              currentFloorLevel - 1
            );
            const nodeState = graph.matrix.get(
              graphPosition.x +
              graph.matrixScale * graphPosition.y +
              graph.matrixScalePow * graphPosition.z
            );
            if (
              nodeState === NodeTypes.START ||
              nodeState === NodeTypes.GOAL
            ) return;
            if (nodeState === NodeTypes.WALL) {
              setActiveState(false);
              updateNodeAndSearch(
                graphPosition.x,
                graphPosition.y,
                graphPosition.z,
                NodeTypes.EMPTY
              );
            } else {
              setActiveState(true);
              updateNodeAndSearch(
                graphPosition.x,
                graphPosition.y,
                graphPosition.z,
                NodeTypes.WALL
              );
            }
          }}
        >
          <planeGeometry args={[graph.matrixScale, graph.matrixScale]} />
          <meshBasicMaterial side={DoubleSide} visible={false} />
        </mesh>
        <gridHelper
          rotation={[-Math.PI / 2, 0, 0]}
          args={[graph.matrixScale, graph.matrixScale]}
          position={[0, 0, 0.5 - 0.5 * currentFloorLevel]}
        />
        <instancedMesh
          ref={instancedMeshRef}
          args={[undefined, undefined, matrixSize]}
        >
          <boxGeometry args={[0.8, 0.8, 0.49]}>
            <instancedBufferAttribute attach='attributes-color' args={[colorArray, 4]} />
          </boxGeometry>
          <meshBasicMaterial
            attach='material'
            side={DoubleSide}
            transparent={true}
            alphaTest={0.1}
            vertexColors
          />
        </instancedMesh>
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
            if (editState) {
              selection.positions.forEach((_, i) => {
                updateNode(i, graph.matrix.get(i) ?? NodeTypes.EMPTY);
              });
              selection.positions.clear();
              instancedMesh.geometry.attributes.color.needsUpdate = true;
            }

            setEditState(!editState);
          }}>
            <CameraButton isActive={!editState} />
          </div>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            setControlPanelVisibilityState(true);
          }}>
            <GearButton />
          </div>
        </div>
        <div>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            setCurrentFloorLevel(Math.min(currentFloorLevel + 1, floors));
          }}>
            <UpButton />
          </div>
          <div style={{height: 24, width: 24, textAlign: 'center'}}>
            {currentFloorLevel}
          </div>
          <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
            setCurrentFloorLevel(Math.max(currentFloorLevel - 1, 1));
          }}>
            <DownButton />
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
              graph.matrix.clear();

              for (let i = 0; i < data.matrix.length; i++) {
                const node = data.matrix[i];
                if (node === 'Wall') {
                  graph.matrix.set(i, NodeTypes.WALL);
                } else if (node === 'Start') {
                  graph.matrix.set(i, NodeTypes.START);
                } else if (node === 'Goal') {
                  graph.matrix.set(i, NodeTypes.GOAL);
                }
              }

              debouncedSearch(options, graph, instancedMesh);
            })
            .catch((err) => { console.error(err); });
        }}
      />
    </div>
  );
};

export default App;
