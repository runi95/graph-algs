import React from 'react';

function UndoButton(_props) {
  return (
    <svg color="#555" transform="scale(1, -1)" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 512 512" xmlSpace="preserve">
      <path fill="currentcolor" d="M0,32c0,64,96,192,320,192V96l192,192L320,480V352C143.563,352,0,208.437,0,32z"/>
    </svg>
  );
}

export default UndoButton;
