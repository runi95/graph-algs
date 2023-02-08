import React from 'react';
import RadioButton from './RadioButton';
import PropTypes from 'prop-types';
import './ControlPanel.css';
import Button from './Button';

function ControlPanel(props) {
  return (
    <div id='ControlPanel' hidden={props.isHidden}>
      <div className="bg"></div>
      <div id='PanelContainer' tabIndex={0}>
        <div style={{
          position: 'fixed',
          top: 15,
          right: 15,
        }}>
          <Button onClick={() => {
            props?.onPanelClose();
          }} text='Close' />
        </div>
        <div>
          <h1>Options</h1>
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
      </div>
    </div>
  );
};

ControlPanel.propTypes = {
  isHidden: PropTypes.bool.isRequired,
  onPanelClose: PropTypes.func,
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
