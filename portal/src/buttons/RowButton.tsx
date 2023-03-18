function RowButton(props: {isActive: boolean}) {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 512 512" xmlSpace="preserve">
        <g color={props.isActive ? '#48c' : '#555'}>
            <rect stroke={props.isActive ? '#7bf' : '#888'} strokeWidth='24' fill="currentcolor" x="50" y="230" width="160" height="160" />
            <rect stroke={props.isActive ? '#7bf' : '#888'} strokeWidth='24' fill="currentcolor" x="302" y="230" width="160" height="160" />
            <rect stroke={props.isActive ? '#7bf' : '#888'} strokeWidth='24' fill="currentcolor" x="16" y="440" width="480" height="60" />
            {!props.isActive && <line stroke='#933' strokeWidth='24' x1='56' y1='56' x2='480' y2='480' />}
        </g>
    </svg>
  );
}

export default RowButton;
