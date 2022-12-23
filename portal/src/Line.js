// TODO: Fix lint rules
/* eslint-disable react/no-unknown-property */
/* eslint-disable max-len */
import React, {useLayoutEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

export default function Line({start, end}) {
  const ref = useRef();
  useLayoutEffect(() => {
    ref.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)));
  }, [start, end]);
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color='#aaa' />
    </line>
  );
}

Line.propTypes = {
  start: PropTypes.any,
  end: PropTypes.any,
};

