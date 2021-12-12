import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import Row from './Row';
import './Grid.css';

const gridHeight = 20;
const gridWidth = 32;

function Grid(props) {
  const gridDomElement = useRef();
  const [previousElement, setPreviousElement] = useState();
  const [activeState, setActiveState] = useState(false);

  const onMouseDown = (mouseEvent) => {
    if (mouseEvent.buttons !== 1) return;

    const {x, y} = mouseEvent.target.dataset;
    const currentNodeState = props.matrix[x][y];
    if (currentNodeState === 'Wall') {
      setActiveState(false);
    } else {
      setActiveState(true);
    }

    if (currentNodeState === 'Start' || currentNodeState === 'Goal') return;

    if (currentNodeState === 'Wall') {
      props.updateGraph(x, y, '');
    } else {
      props.updateGraph(x, y, 'Wall');
    }
  };

  const onMouseMove = (mouseEvent) => {
    if (mouseEvent.target === previousElement) return;
    if (mouseEvent.buttons !== 1) return;

    setPreviousElement(mouseEvent.target);

    const {x, y} = mouseEvent.target.dataset;
    const currentNodeState = props.matrix[x][y];
    if (!activeState && currentNodeState !== 'Wall') return;
    if (currentNodeState === 'Start' || currentNodeState === 'Goal') return;

    props.updateGraph(x, y, activeState ? 'Wall' : '');
  };

  return props.matrix.length > 0 ? <table id="grid" draggable={false} ref={gridDomElement} onMouseMoveCapture={onMouseMove} onMouseDownCapture={onMouseDown}>
    <tbody>
      {[...Array(gridHeight)]
          .map((_, y) =>
            <Row
              key={`row-${y}`}
              gridWidth={gridWidth}
              matrix={props.matrix}
              y={y}
            />,
          )}
    </tbody>
  </table> : <div />;
};

Grid.propTypes = {
  updateGraph: PropTypes.func.isRequired,
  matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default Grid;
