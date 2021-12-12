import React from 'react';
import PropTypes from 'prop-types';
import './Tile.css';

function Tile(props) {
  return <td
    className={props.tileClass}
    draggable={false}
    data-x={props.x}
    data-y={props.y} >
    <div draggable={false} />
  </td>;
};

Tile.propTypes = {
  tileClass: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

export default Tile;
