function UndoButton(props: {isActive: boolean}) {
  return (
    <svg color='#555' transform='scale(1, -1)' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width='100%' height='100%' viewBox='0 0 512 512' xmlSpace='preserve'>
      <g color={props.isActive ? '#48c' : '#555'}>
        <path stroke={props.isActive ? '#7bf' : '#888'} strokeWidth='24' fill='currentcolor' d='M512,32c0,64-96,192-320,192V96L0,288l192,192V352C368.438,352,512,208.438,512,32z' />
      </g>
    </svg>
  );
}

export default UndoButton;
