import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import debounce from 'lodash.debounce';
import {Canvas} from '@react-three/fiber';
import {type InstancedMesh, Vector3, Color, Matrix4, NotEqualDepth, DoubleSide} from 'three';
import {OrbitControls} from '@react-three/drei';
import type * as threelib from 'three-stdlib';
import ControlPanel from '../ControlPanel/ControlPanel';
import './App.css';
import {HistoryLinkedList} from '../../utils/HistoryLinkedList';
import {NodeTypes, nodeTypeToAlpha, nodeTypeToColor} from '../../utils/NodeTypes';
import {Graph} from '../../utils/Graph';
import {StackButtonState} from '../../buttons/StackButton';
import InformationPanel from '../InformationPanel/InformationPanel';
import {type Heuristic, type Options, type Algorithm, getOptions, runPathfindingAlgorithm, getTemplate} from '../../lib/API';

interface Replay {
  solution: number[][];
  solutionIndex: number;
  visited: number[][];
  visitedIndex: number;
  interval: NodeJS.Timer;
  isActive: boolean;
};

const tempColor = new Color();
const tempMatrix = new Matrix4();
const initialTransparency = 1;
const initialMatrixScale = 32;
const floors = 10;
const initialStart = new Vector3(1, 1, Math.min(floors - 1, 2));
const initialGoal = new Vector3(
  initialMatrixScale - 2,
  initialMatrixScale - 2,
  Math.min(floors - 1, 8)
);

function App() {
  const debouncedSearch = useMemo(() =>
    debounce((options, graph, instancedMesh, replayState) => {
      search(options, graph, instancedMesh, replayState);
    }, 500), []);
  const orbitControlsRef = useRef<threelib.OrbitControls>(null!);
  const [instancedMesh, setInstancedMesh] = useState<InstancedMesh>(null!);
  const instancedMeshRef = useCallback((instancedMesh: InstancedMesh) => {
    setInstancedMesh(instancedMesh);
  }, []);
  const [editState, setEditState] = useState(true);
  const graphHistoryLinkedList = useMemo(
    () => new HistoryLinkedList<Array<[number, NodeTypes]>>(),
    []
  );
  const [replayState, setReplayState] = useState(true);
  const [undoAndRedoState, setUndoAndRedoState] = useState({
    isUndoActive: false,
    isRedoActive: false
  });
  const [stackState, setStackState] = useState(StackButtonState.SINGLE);
  const [currentFloorLevel, setCurrentFloorLevel] = useState(1);
  const [
    controlPanelVisibilityState,
    setControlPanelVisibilityState
  ] = useState(false);
  const [options, setOptions] = useState<Options>(null!);
  const graph = useMemo(
    () => new Graph(initialMatrixScale, floors, initialStart, initialGoal),
    []
  );
  const replay: Replay = useMemo(() => ({
    visited: [],
    visitedIndex: 0,
    solution: [],
    solutionIndex: 0,
    interval: null!,
    isActive: true
  }), []);
  const colorArray = useMemo(() => Float32Array.from(
    new Array(graph.matrixSize)
      .fill(undefined, undefined)
      .flatMap(
        () => [...tempColor.set('#fff').toArray(), 1])), []);
  const selection = useMemo(() => ({
    positions: new Map<number, Vector3>(),
    activeState: false,
    transparency: initialTransparency,
    wallColor: '#aaa'
  }), []);

  useEffect(() => {
    if (options === null) return;
    if (options.algorithm && options.heuristic) {
      search(options, graph, instancedMesh, replayState);
    } else {
      // Reset visited and solution states
      graph.matrix.forEach((node: NodeTypes, key: number) => {
        if (node === NodeTypes.VISITED || node === NodeTypes.SOLUTION) {
          graph.matrix.delete(key);
        }
      });
    }
  }, [options, replayState]);

  // Only runs once!
  useEffect(() => {
    if (instancedMesh === null) return;

    getOptions().then((data) => {
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
      tempColor.set(
        nodeTypeToColor(node, selection.wallColor)
      ).toArray(colorArray, i * 4);
      switch (node) {
        case NodeTypes.EMPTY:
          colorArray[i * 4 + 3] = 0;
          break;
        case NodeTypes.VISITED:
        case NodeTypes.WALL:
          colorArray[i * 4 + 3] = selection.transparency;
          break;
        default:
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
    instancedMesh: InstancedMesh,
    replayState: boolean
  ) {
    if (options.algorithm.value === 'none') {
      if (replayState) {
        clearInterval(replay.interval);
        replay.solutionIndex = 0;
        replay.visitedIndex = 0;
      }
      return;
    };

    const data = JSON.stringify({
      ...graph,
      matrix: Object.fromEntries(Array.from(graph.matrix.entries()).filter(
        (pair) => pair[1] !== NodeTypes.SOLUTION &&
                  pair[1] !== NodeTypes.VISITED
      )),
      algorithm: options.algorithm.value,
      heuristic: options.heuristic.value
    });

    runPathfindingAlgorithm(data)
      .then((data) => {
        const {solution, visited} = data;
        replay.solution = solution;
        replay.visited = visited;

        if (replayState) {
          clearInterval(replay.interval);
          replay.solutionIndex = 0;
          replay.visitedIndex = 0;
        }

        // Reset visited and solution states
        graph.matrix.forEach((node: NodeTypes, key: number) => {
          if (node === NodeTypes.VISITED || node === NodeTypes.SOLUTION) {
            graph.matrix.delete(key);
          }
        });

        visited.forEach((p: number[]) => {
          const index = p[0] +
            graph.matrixScale * p[1] +
            graph.matrixScalePow * p[2];
          const currentNodeType = graph.matrix.get(index);
          if (
            currentNodeType === NodeTypes.START ||
            currentNodeType === NodeTypes.GOAL
          ) return;
          graph.matrix.set(index, NodeTypes.VISITED);
        });

        solution.forEach((p: number[]) => {
          const index = p[0] +
            graph.matrixScale * p[1] +
            graph.matrixScalePow * p[2];
          const currentNodeType = graph.matrix.get(index);
          if (
            currentNodeType === NodeTypes.START ||
            currentNodeType === NodeTypes.GOAL
          ) return;
          graph.matrix.set(index, NodeTypes.SOLUTION);
        });

        if (replayState) {
          replayGraph(instancedMesh);
        } else {
          updateGraph(instancedMesh);
          instancedMesh.instanceMatrix.needsUpdate = true;
        }

        graphHistoryLinkedList.add(Array.from(graph.matrix.entries()));
        setUndoAndRedoState({
          isUndoActive: graphHistoryLinkedList.canUndo(),
          isRedoActive: graphHistoryLinkedList.canRedo()
        });
      })
      .catch((err) => { console.error(err); });
  }

  const updateNode = (key: number, newNodeState: NodeTypes) => {
    tempColor.set(
      nodeTypeToColor(newNodeState, selection.wallColor)
    ).toArray(colorArray, key * 4);
    colorArray[key * 4 + 3] = nodeTypeToAlpha(
      newNodeState,
      selection.transparency
    );

    return key;
  };

  const replayGraph = (instancedMesh: InstancedMesh) => {
    // Reset visited and solution states
    graph.matrix.forEach((node: NodeTypes, key: number) => {
      if (node === NodeTypes.VISITED || node === NodeTypes.SOLUTION) {
        graph.matrix.delete(key);
      }
    });

    updateGraph(instancedMesh);

    replay.interval = setInterval(() => {
      const v = replay.visited[replay.visitedIndex++];
      if (v !== undefined) {
        const graphIndex = v[0] +
          graph.matrixScale * v[1] +
          graph.matrixScalePow * v[2];
        graph.matrix.set(graphIndex, NodeTypes.VISITED);
        const colorIndex = graphIndex * 4;
        tempColor.set(
          nodeTypeToColor(NodeTypes.VISITED, selection.wallColor)
        ).toArray(colorArray, colorIndex);
        colorArray[colorIndex + 3] = selection.transparency;
      } else {
        const s = replay.solution[replay.solutionIndex++];
        if (s !== undefined) {
          const graphIndex = s[0] +
            graph.matrixScale * s[1] +
            graph.matrixScalePow * s[2];
          graph.matrix.set(graphIndex, NodeTypes.SOLUTION);
          const colorIndex = graphIndex * 4;
          tempColor.set(
            nodeTypeToColor(NodeTypes.SOLUTION, selection.wallColor)
          ).toArray(colorArray, colorIndex);
          colorArray[colorIndex + 3] = 1;
        } else {
          clearInterval(replay.interval);
        }
      }

      instancedMesh.geometry.attributes.color.needsUpdate = true;
    }, 1);
  };

  return (
    <div className='App'>
      <Canvas
        camera={{
          fov: 45,
          near: 1,
          far: 750,
          position: [0, 0, -1.25 * initialMatrixScale]
        }}
        className='canvas'
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
              const selectionNodeState = graph.matrix.get(key);
              if (selectionNodeState === NodeTypes.START) return;
              if (selectionNodeState === NodeTypes.GOAL) return;
              selection.positions.set(key, graphPosition);
              updateNode(key, NodeTypes.WALL);

              const renderHorizontalSelect = () => {
                const isWallSelected = selectionNodeState === NodeTypes.WALL;
                const keyBaseState = key - graphPosition.x;
                for (let i = graphPosition.x + 1; i < initialMatrixScale; i++) {
                  const keyIndex = keyBaseState + i;
                  const nodeState = graph.matrix.get(keyIndex);
                  if (
                    isWallSelected
                      ? nodeState !== NodeTypes.WALL
                      : nodeState === NodeTypes.WALL
                  ) break;
                  if (nodeState === NodeTypes.START) break;
                  if (nodeState === NodeTypes.GOAL) break;
                  selection.positions.set(
                    keyIndex,
                    new Vector3(
                      i,
                      graphPosition.y,
                      graphPosition.z
                    )
                  );
                  updateNode(keyIndex, NodeTypes.WALL);
                }
                for (let i = graphPosition.x - 1; i >= 0; i--) {
                  const keyIndex = keyBaseState + i;
                  const nodeState = graph.matrix.get(keyIndex);
                  if (
                    isWallSelected
                      ? nodeState !== NodeTypes.WALL
                      : nodeState === NodeTypes.WALL
                  ) break;
                  if (nodeState === NodeTypes.START) break;
                  if (nodeState === NodeTypes.GOAL) break;
                  selection.positions.set(
                    keyIndex,
                    new Vector3(
                      i,
                      graphPosition.y,
                      graphPosition.z
                    )
                  );
                  updateNode(keyIndex, NodeTypes.WALL);
                }
              };

              const renderVerticalSelect = () => {
                const isWallSelected = selectionNodeState === NodeTypes.WALL;
                const keyBaseState = key - graph.matrixScale * graphPosition.y;
                for (let i = graphPosition.y + 1; i < initialMatrixScale; i++) {
                  const keyIndex = keyBaseState + graph.matrixScale * i;
                  const nodeState = graph.matrix.get(keyIndex);
                  if (
                    isWallSelected
                      ? nodeState !== NodeTypes.WALL
                      : nodeState === NodeTypes.WALL
                  ) break;
                  if (nodeState === NodeTypes.START) break;
                  if (nodeState === NodeTypes.GOAL) break;
                  selection.positions.set(
                    keyIndex,
                    new Vector3(
                      graphPosition.x,
                      i,
                      graphPosition.z
                    )
                  );
                  updateNode(keyIndex, NodeTypes.WALL);
                }
                for (let i = graphPosition.y - 1; i >= 0; i--) {
                  const keyIndex = keyBaseState + graph.matrixScale * i;
                  const nodeState = graph.matrix.get(keyIndex);
                  if (
                    isWallSelected
                      ? nodeState !== NodeTypes.WALL
                      : nodeState === NodeTypes.WALL
                  ) break;
                  if (nodeState === NodeTypes.START) break;
                  if (nodeState === NodeTypes.GOAL) break;
                  selection.positions.set(
                    keyIndex,
                    new Vector3(
                      graphPosition.x,
                      i,
                      graphPosition.z
                    )
                  );
                  updateNode(keyIndex, NodeTypes.WALL);
                }
              };

              const renderFullSquareSelect = () => {
                const isWallSelected = selectionNodeState === NodeTypes.WALL;
                const keyBaseState = key - graph.matrixScale - 1;
                for (let i = 0; i < 9; i++) {
                  if (i === 4) continue;
                  if (
                    graphPosition.x === 0 &&
                    (i === 0 || i === 3 || i === 6)
                  ) continue;
                  if (
                    graphPosition.x === graph.matrixScale - 1 &&
                    (i === 2 || i === 5 || i === 8)
                  ) continue;
                  if (
                    graphPosition.y === graph.matrixScale - 1 &&
                    i > 5
                  ) continue;
                  const y = Math.floor(i / 3);
                  if (y > graph.matrixScale) continue;
                  const keyIndex =
                    keyBaseState +
                    (i % 3) +
                    graph.matrixScale * y;
                  const nodeState = graph.matrix.get(keyIndex);
                  if (
                    isWallSelected
                      ? nodeState !== NodeTypes.WALL
                      : nodeState === NodeTypes.WALL
                  ) continue;
                  if (nodeState === NodeTypes.START) continue;
                  if (nodeState === NodeTypes.GOAL) continue;
                  selection.positions.set(
                    keyIndex,
                    new Vector3(
                      graphPosition.x,
                      i,
                      graphPosition.z
                    )
                  );
                  updateNode(keyIndex, NodeTypes.WALL);
                }
              };

              switch (stackState) {
                case StackButtonState.HORIZONTAL:
                  renderHorizontalSelect();
                  break;
                case StackButtonState.VERTICAL:
                  renderVerticalSelect();
                  break;
                case StackButtonState.FULL_SQUARE:
                  renderFullSquareSelect();
                  break;
                case StackButtonState.SINGLE:
                default:
              }
            });

            instancedMesh.geometry.attributes.color.needsUpdate = true;

            if (e.buttons === 1) {
              selection.positions.forEach((_, i) => {
                const nodeState = graph.matrix.get(i);
                if (
                  nodeState === NodeTypes.START ||
                  nodeState === NodeTypes.GOAL
                ) return;
                if (
                  selection.activeState && nodeState !== NodeTypes.WALL
                ) {
                  graph.matrix.set(i, NodeTypes.WALL);
                } else if (
                  !selection.activeState && nodeState === NodeTypes.WALL
                ) {
                  graph.matrix.set(i, NodeTypes.EMPTY);
                }
              });
              debouncedSearch(options, graph, instancedMesh, replayState);
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
              selection.activeState = false;
            } else {
              selection.activeState = true;
            }

            selection.positions.forEach((_, i) => {
              const nodeState = graph.matrix.get(i);
              if (
                nodeState === NodeTypes.START ||
                nodeState === NodeTypes.GOAL
              ) return;
              if (
                selection.activeState && nodeState !== NodeTypes.WALL
              ) {
                graph.matrix.set(i, NodeTypes.WALL);
              } else if (
                !selection.activeState && nodeState === NodeTypes.WALL
              ) {
                graph.matrix.set(i, NodeTypes.EMPTY);
                selection.positions.delete(i);
              }
            });
            instancedMesh.geometry.attributes.color.needsUpdate = true;
            debouncedSearch(options, graph, instancedMesh, replayState);
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
          args={[undefined, undefined, graph.matrixSize]}
        >
          <boxGeometry args={[0.8, 0.8, 0.49]}>
            <instancedBufferAttribute attach='attributes-color' args={[colorArray, 4]} />
          </boxGeometry>
          <meshBasicMaterial
            attach='material'
            transparent={true}
            alphaTest={0.1}
            vertexColors
            depthFunc={NotEqualDepth}
          />
        </instancedMesh>
        <OrbitControls
          ref={orbitControlsRef}
          enableRotate={!editState}
          enablePan={!editState}
        />
      </Canvas>
      <InformationPanel
        initialTransparency={initialTransparency}
        undoAndRedoState={undoAndRedoState}
        editState={editState}
        setEditState={setEditState}
        instancedMesh={instancedMesh}
        currentFloorLevel={currentFloorLevel}
        floors={floors}
        selection={selection}
        updateGraph={updateGraph}
        setCurrentFloorLevel={setCurrentFloorLevel}
        setControlPanelVisibilityState={setControlPanelVisibilityState}
        updateNode={updateNode}
        setStackState={setStackState}
        stackState={stackState}
        graph={graph}
        replayState={replayState}
        setReplayState={setReplayState}
        replay={replay}
        replayGraph={replayGraph}
        graphHistoryLinkedList={graphHistoryLinkedList}
        setUndoAndRedoState={setUndoAndRedoState}
      />
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
        clearVisitedNodes={() => {
          graph.matrix.forEach((node: NodeTypes, key: number) => {
            if (node === NodeTypes.VISITED || node === NodeTypes.SOLUTION) {
              graph.matrix.delete(key);
            }
          });
          updateGraph(instancedMesh);
        }}
        heuristic={options?.heuristic}
        templates={options?.templates}
        setTemplate={(template: string) => {
          clearInterval(replay.interval);
          getTemplate(template)
            .then((data) => {
              graph.matrix.clear();

              const matrixKeys = Object.keys(data.matrix);
              for (let i = 0; i < matrixKeys.length; i++) {
                const node = data.matrix[matrixKeys[i]];
                graph.matrix.set(Number(matrixKeys[i]), node);
              }

              graph.matrix.set(
                graph.start.x +
                graph.start.y * graph.matrixScale +
                graph.start.z * graph.matrixScalePow,
                NodeTypes.START
              );
              graph.matrix.set(
                graph.goal.x +
                graph.goal.y * graph.matrixScale +
                graph.goal.z * graph.matrixScalePow,
                NodeTypes.GOAL
              );

              debouncedSearch(options, graph, instancedMesh, replayState);
            })
            .catch((err) => { console.error(err); });
        }}
      />
    </div>
  );
};

export default App;
