import React from 'react';
import PropTypes from 'prop-types';
import './ToggleButton.css';

function ToggleButton(props) {
  return (
    <label className='toggle-button-label'>
      <input className='toggle-button' type="checkbox" defaultChecked={props.defaultChecked} disabled={props.disabled} onChange={props.onChange} />
      <span className='toggle-button-span' />
    </label>
  );
};

ToggleButton.propTypes = {
  defaultChecked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

export default ToggleButton;
