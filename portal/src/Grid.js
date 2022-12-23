// TODO: Fix lint rules
/* eslint-disable max-len */
/* eslint-disable react/no-unknown-property */
import React from 'react';
import PropTypes from 'prop-types';
import Line from './Line';
import Tile from './Tile';

export default function Grid(props) {
  const height = props.height;
  const width = props.width;

  const halfHeight = height * 0.5;
  const halfWidth = width * 0.5;

  const meshes = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const state = props.matrix[i][height - j - 1];

      const position = [i * 1.2 - halfWidth - 2.5, j * 1.2 - halfHeight - 1.4, 0];

      let visible = null;
      let color = null;
      switch (state) {
        case 'Start':
          color = '#afa';
          visible = true;
          break;
        case 'Goal':
          color = '#aaf';
          visible = true;
          break;
        case 'Wall':
          color = '#aaa';
          visible = true;
          break;
        case 'Solution':
          color = '#49f';
          visible = true;
          break;
        case 'Visited':
          color = '#324c75';
          visible = true;
          break;
        default:
          visible = false;
      }

      meshes.push(<Tile key={`mesh-${i}-${j}`} position={position} color={color} visible={visible} />);
    }
  }

  const lines = [];
  for (let i = 0; i < height - 1; i++) {
    lines.push(<Line key={`hline-${i}`} start={[-width, i * 1.2 - halfHeight - 0.8, 0]} end={[width, i * 1.2 - halfHeight - 0.8, 0]} />);
  }

  for (let i = 0; i < width - 1; i++) {
    lines.push(<Line key={`vline-${i}`} start={[i * 1.2 - halfWidth - 1.9, -height, 0]} end={[i * 1.2 - halfWidth - 1.9, height, 0]} />);
  }

  return (
    <group>
      {lines}
      {meshes}
    </group>
  );
}

Grid.propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};
