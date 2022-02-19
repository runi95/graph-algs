import React from 'react';
import RadioButton from './RadioButton';
import PropTypes from 'prop-types';
import './ControlPanel.css';

function ControlPanel(props) {
  return (
    <div className='ControlPanel'>
      <h1>Information</h1>
      <p>Path Length: {props.pathLength}</p>
      <p>Visited nodes: {props.visitedNodes}</p>
      <h1>Options</h1>
      {
        <div>
          <p>Algorithm:</p>
          {props?.algorithmOptions?.map((algorithm) =>
            <RadioButton
              key={algorithm.value}
              label={algorithm.label}
              checked={algorithm.value === props.algorithm.value}
              onChange={() => props.setAlgorithm(algorithm)}
            />)}
          <p>Heuristic:</p>
          {props?.heuristicOptions?.map((heuristic) =>
            <RadioButton
              key={heuristic.value}
              disabled={props?.algorithm?.usesHeuristics !== true}
              label={heuristic.label}
              checked={heuristic.value === props.heuristic.value}
              onChange={() => props.setHeuristic(heuristic)}
            />)}
          <p>Templates:</p>
          {props?.templates?.map((template) =>
            <RadioButton
              key={template}
              label={template}
              checked={false}
              onChange={() => props.setTemplate(template)}
            />)}
        </div>
      }
    </div>
  );
};

ControlPanel.propTypes = {
  pathLength: PropTypes.string,
  visitedNodes: PropTypes.string,
  algorithmOptions: PropTypes.array,
  setAlgorithm: PropTypes.func.isRequired,
  algorithm: PropTypes.object,
  heuristicOptions: PropTypes.array,
  setHeuristic: PropTypes.func.isRequired,
  heuristic: PropTypes.object,
  templates: PropTypes.array,
  setTemplate: PropTypes.func.isRequired,
};

export default ControlPanel;
