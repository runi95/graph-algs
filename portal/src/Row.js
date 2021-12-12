import React from 'react';
import PropTypes from 'prop-types';
import Tile from './Tile';

function Row(props) {
  return <tr draggable={false}>
    {[...Array(props.gridWidth)]
        .map((_, x) =>
          <Tile
            key={`tile-${x}-${props.y}`}
            tileClass={props.matrix[x][props.y]}
            x={x}
            y={props.y} />,
        )}
  </tr>;
};

Row.propTypes = {
  gridWidth: PropTypes.number.isRequired,
  matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  y: PropTypes.number.isRequired,
};

export default Row;
