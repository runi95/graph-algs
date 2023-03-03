import React from 'react';
import PropTypes from 'prop-types';

function Camera(props) {
  return (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 512 512" enableBackground="new 0 0 512 512" xmlSpace="preserve">
      <g color={props.isActive ? '#555' : '#48c'}>
        <circle fill="currentcolor" cx="255.811" cy="285.309" r="75.217"/>
        <path fill="currentcolor" d="M477,137H352.718L349,108c0-16.568-13.432-30-30-30H191c-16.568,0-30,13.432-30,30l-3.718,29H34   c-11.046,0-20,8.454-20,19.5v258c0,11.046,8.954,20.5,20,20.5h443c11.046,0,20-9.454,20-20.5v-258C497,145.454,488.046,137,477,137   z M255.595,408.562c-67.928,0-122.994-55.066-122.994-122.993c0-67.928,55.066-122.994,122.994-122.994   c67.928,0,122.994,55.066,122.994,122.994C378.589,353.495,323.523,408.562,255.595,408.562z M474,190H369v-31h105V190z"/>
        {props.isActive && <line stroke="#933" strokeWidth="24" x1="56" y1="56" x2="480" y2="480" />}
      </g>
    </svg>
  );
}

Camera.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default Camera;
