function PageDownButton(props: {isActive: boolean}) {
  return (
    <svg transform='rotate(270)' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width='100%' height='100%' viewBox='0 0 512 512' xmlSpace='preserve'>
    <g color={props.isActive ? '#48c' : '#555'}>
        <path stroke={props.isActive ? '#7bf' : '#888'} strokeWidth='24' fill='currentcolor' d='M70 70h10v380h-70v-380z'/>
        <path stroke={props.isActive ? '#7bf' : '#888'} strokeWidth='24' fill='currentcolor' d='M500,192v128H270v128L100,256L270,64v128H500z'/>
        {!props.isActive && <line stroke='#933' strokeWidth='24' x1='480' y1='56' x2='56' y2='512' />}
    </g>
    </svg>
  );
}

export default PageDownButton;
