import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

function Button(props) {
  return (
    <button className='styled-button' onClick={() => props.onClick()}>{props.text}</button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default Button;
