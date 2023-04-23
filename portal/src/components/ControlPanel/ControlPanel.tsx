import RadioButton from '../../buttons/RadioButton/RadioButton';
import './ControlPanel.css';
import StandardButton from '../../buttons/StandardButton/StandardButton';

interface ControlPanelProps {
  isHidden: boolean;
  onPanelClose: () => void;
  algorithmOptions?: any[];
  setAlgorithm: (algorithm: any) => void;
  algorithm: any;
  heuristicOptions?: any[];
  setHeuristic: (heuristic: any) => void;
  heuristic: any;
  templates?: any[];
  setTemplate: (template: any) => void;
  clearVisitedNodes: () => void;
}

function ControlPanel(props: ControlPanelProps) {
  return (
    <div id='ControlPanel' hidden={props.isHidden}>
      <div className="bg"></div>
      <div id='PanelContainer' tabIndex={0}>
        <div style={{
          position: 'fixed',
          top: 15,
          right: 15
        }}>
          <StandardButton onClick={() => {
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
              onChange={() => { props.setAlgorithm(algorithm); }}
            />)}
          <RadioButton
              key='none'
              label='None'
              checked={props?.algorithm?.value === 'none'}
              onChange={() => {
                props.setAlgorithm({
                  label: 'None',
                  usesHeuristics: false,
                  value: 'none'
                });
                props.clearVisitedNodes();
              }}
            />
          <p>Heuristic:</p>
          {props?.heuristicOptions?.map((heuristic) =>
            <RadioButton
              key={heuristic.value}
              disabled={props?.algorithm?.usesHeuristics !== true}
              label={heuristic.label}
              checked={heuristic.value === props.heuristic.value}
              onChange={() => { props.setHeuristic(heuristic); }}
            />)}
          <p>Templates:</p>
          {props?.templates?.map((template) =>
            <RadioButton
              key={template}
              label={template}
              checked={false}
              onChange={() => { props.setTemplate(template); }}
            />)}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
