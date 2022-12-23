// TODO: Fix lint rules
/* eslint-disable max-len */
/* eslint-disable react/no-unknown-property */
import React from 'react';
import PropTypes from 'prop-types';

export default function Tile(props) {
  return (
    <mesh scale={1} position={props.position}>
      <boxGeometry args={[1.1, 1.1, 0]} attach='geometry' />
      <meshLambertMaterial attach='material' color={props.color} visible={props.visible} />
    </mesh>
  );
}

Tile.propTypes = {
  color: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};
