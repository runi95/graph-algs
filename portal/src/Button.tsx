import React from 'react';
import './Button.css';

function Button(props: {
    onClick: () => void;
    text: string;
}) {
  return (
    <button className='styled-button' onClick={() => props.onClick()}>{props.text}</button>
  );
};

export default Button;
