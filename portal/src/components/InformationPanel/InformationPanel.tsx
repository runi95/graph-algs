import {type Vector3, type BufferGeometry, type InstancedMesh, type Material} from 'three';
import StackButton, {StackButtonState} from '../../buttons/StackButton';
import CameraButton from '../../buttons/CameraButton';
import DownButton from '../../buttons/DownButton';
import GearButton from '../../buttons/GearButton';
import RedoButton from '../../buttons/RedoButton';
import StopwatchButton from '../../buttons/StopwatchButton';
import UndoButton from '../../buttons/UndoButton';
import UpButton from '../../buttons/UpButton';
import {NodeTypes} from '../../utils/NodeTypes';
import {type Graph} from '../../utils/Graph';
import {type HistoryLinkedList} from '../../utils/HistoryLinkedList';
import './InformationPanel.css';

interface InformationPanelProps {
  initialTransparency: number;
  undoAndRedoState: {
    isUndoActive: boolean;
    isRedoActive: boolean;
  };
  editState: boolean;
  setEditState: (editState: boolean) => void;
  instancedMesh: InstancedMesh<BufferGeometry, Material | Material[]>;
  currentFloorLevel: number;
  floors: number;
  selection: {
    transparency: number;
    wallColor: string;
    positions: Map<number, Vector3>;
  };
  updateGraph: (
    instancedMesh: InstancedMesh<BufferGeometry, Material | Material[]>
  ) => void;
  setCurrentFloorLevel: (currentFloorLevel: number) => void;
  setControlPanelVisibilityState: (
    controlPanelVisibilityState: boolean
  ) => void;
  updateNode: (key: number, newNodeState: NodeTypes) => void;
  setStackState: (stackState: StackButtonState) => void;
  stackState: StackButtonState;
  graph: Graph;
  replayState: boolean;
  setReplayState: (replayState: boolean) => void;
  replay: {
    solution: number[][];
    solutionIndex: number;
    visited: number[][];
    visitedIndex: number;
    interval: NodeJS.Timer;
    isActive: boolean;
  };
  replayGraph: (instancedMesh: InstancedMesh) => void;
  graphHistoryLinkedList: HistoryLinkedList<Array<[number, NodeTypes]>>;
  setUndoAndRedoState: (undoAndRedoState: {
    isUndoActive: boolean;
    isRedoActive: boolean;
  }) => void;
}

function InformationPanel(props: InformationPanelProps) {
  const undo = () => {
    const prev = props.graphHistoryLinkedList.undo();
    props.setUndoAndRedoState({
      isUndoActive: props.graphHistoryLinkedList.canUndo(),
      isRedoActive: props.graphHistoryLinkedList.canRedo()
    });
    if (prev !== null) {
      clearInterval(props.replay.interval);
      props.replay.solutionIndex = 0;
      props.replay.visitedIndex = 0;
      props.graph.matrix.clear();
      for (const entry of prev) {
        props.graph.matrix.set(entry[0], entry[1]);
      }
      if (props.replayState) {
        props.replayGraph(props.instancedMesh);
      } else {
        props.updateGraph(props.instancedMesh);
      }
    }
  };

  const redo = () => {
    const next = props.graphHistoryLinkedList.redo();
    props.setUndoAndRedoState({
      isUndoActive: props.graphHistoryLinkedList.canUndo(),
      isRedoActive: props.graphHistoryLinkedList.canRedo()
    });
    if (next !== null) {
      clearInterval(props.replay.interval);
      props.replay.solutionIndex = 0;
      props.replay.visitedIndex = 0;
      props.graph.matrix.clear();
      for (const entry of next) {
        props.graph.matrix.set(entry[0], entry[1]);
      }
      if (props.replayState) {
        props.replayGraph(props.instancedMesh);
      } else {
        props.updateGraph(props.instancedMesh);
      }
    }
  };

  return (<div className='information-panel'>
    <div>
      <input type="range" min="11" max="100" defaultValue={100 * props.initialTransparency} onChange={(e) => {
        props.selection.transparency = Number(e.target.value) / 100;
        props.selection.wallColor = `#${(
          Math.round(Math.sqrt(Math.pow(170, 2) * props.selection.transparency))
        ).toString(16).repeat(3)}`;
        props.updateGraph(props.instancedMesh);
      }} />
    </div>
    <div style={{height: 24, width: 24, cursor: props.undoAndRedoState.isUndoActive ? 'pointer' : 'default'}} onClick={() => {
      undo();
    }}>
      <UndoButton isActive={props.undoAndRedoState.isUndoActive} />
    </div>
    <div style={{height: 24, width: 24, cursor: props.undoAndRedoState.isRedoActive ? 'pointer' : 'default'}} onClick={() => {
      redo();
    }}>
      <RedoButton isActive={props.undoAndRedoState.isRedoActive} />
    </div>
    <div>
      <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
        if (props.editState) {
          props.selection.positions.forEach((_, i) => {
            props.updateNode(i, props.graph.matrix.get(i) ?? NodeTypes.EMPTY);
          });
          props.selection.positions.clear();
          props.instancedMesh.geometry.attributes.color.needsUpdate = true;
        }

        props.setEditState(!props.editState);
      }}>
        <CameraButton isActive={!props.editState} />
      </div>
      <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
        props.setStackState(
          (props.stackState + 1) % (Object.keys(StackButtonState).length / 2)
        );
      }}>
        <StackButton stackState={props.stackState} />
      </div>
      <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
        if (props.replayState) {
          clearInterval(props.replay.interval);
          props.replay.solutionIndex = 0;
          props.replay.visitedIndex = 0;

          // Reset visited and solution states
          props.graph.matrix.forEach((node: NodeTypes, key: number) => {
            if (node === NodeTypes.VISITED || node === NodeTypes.SOLUTION) {
              props.graph.matrix.delete(key);
            }
          });

          for (const v of props.replay.visited) {
            const graphIndex = v[0] +
            props.graph.matrixScale * v[1] +
            props.graph.matrixScalePow * v[2];
            props.graph.matrix.set(graphIndex, NodeTypes.VISITED);
          }

          for (const s of props.replay.solution) {
            const graphIndex = s[0] +
            props.graph.matrixScale * s[1] +
            props.graph.matrixScalePow * s[2];
            props.graph.matrix.set(graphIndex, NodeTypes.SOLUTION);
          }

          props.updateGraph(props.instancedMesh);
        } else {
          props.replayGraph(props.instancedMesh);
        }

        props.setReplayState(!props.replayState);
      }}>
        <StopwatchButton isActive={props.replayState} />
      </div>
    </div>
    <div>
      <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
        props.setControlPanelVisibilityState(true);
      }}>
        <GearButton />
      </div>
      <div>
        <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
          props.setCurrentFloorLevel(
            Math.min(props.currentFloorLevel + 1, props.floors));
        }}>
          <UpButton />
        </div>
        <div style={{height: 24, width: 24, textAlign: 'center'}}>
          {props.currentFloorLevel}
        </div>
        <div style={{height: 24, width: 24, cursor: 'pointer'}} onClick={() => {
          props.setCurrentFloorLevel(Math.max(props.currentFloorLevel - 1, 1));
        }}>
          <DownButton />
        </div>
      </div>
    </div>
  </div>);
}

export default InformationPanel;
