import './StandardButton.css';

function StandardButton(props: {
  onClick: () => void;
  text: string;
}) {
  return (
    <button className='styled-button' onClick={() => { props.onClick(); }}>{props.text}</button>
  );
};

export default StandardButton;
