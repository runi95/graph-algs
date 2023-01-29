import React from 'react';
import PropTypes from 'prop-types';
import {DoubleSide} from 'three';

const typeToColor = (type) => {
  switch (type) {
    case 'Start':
      return '#afa';
    case 'Goal':
      return '#aaf';
    case 'Solution':
      return '#49f';
    case 'Visited':
      return '#324c75';
    case 'Wall':
    case '':
    default:
      return '#aaa';
  }
};

export default function Tile(props) {
  return (
    <mesh position={props.position}>
      <boxGeometry args={[0.8, 0.8, 0.5]} />
      <meshBasicMaterial
        color={typeToColor(props.type)}
        side={DoubleSide}
        visible={props.type !== ''}
      />
    </mesh>
  );
}

Tile.propTypes = {
  type: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    z: PropTypes.number.isRequired,
  }).isRequired,
};
