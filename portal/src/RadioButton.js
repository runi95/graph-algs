import React from 'react';
import PropTypes from 'prop-types';
import './RadioButton.css';

function RadioButton(props) {
  return (
    <div>
      <input id={props.label} className='radio-button-input' type="radio" checked={props.checked} disabled={props.disabled} onChange={props.onChange} />
      <label className='radio-button-label' htmlFor={props.label}>{props.label}</label>
    </div>
  );
};

RadioButton.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default RadioButton;
