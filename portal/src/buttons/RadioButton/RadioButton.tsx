import './RadioButton.css';

interface RadioButtonProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange?: () => void;
}

function RadioButton(props: RadioButtonProps) {
  return (
    <div>
      <input id={props.label} className='radio-button-input' type="radio" checked={props.checked} disabled={props.disabled} onChange={props.onChange} />
      <label className='radio-button-label' htmlFor={props.label}>{props.label}</label>
    </div>
  );
};

export default RadioButton;
