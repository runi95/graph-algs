import HorizontalStackButton from './buttons/HorizontalStackButton';
import SingleStackButton from './buttons/SingleStackButton';
import VerticalStackButton from './buttons/VerticalStackButton';

export enum StackButtonState {
  SINGLE,
  VERTICAL,
  HORIZONTAL,
}

interface StackButtonProps {
  stackState: StackButtonState;
}

function StackButton(props: StackButtonProps) {
  switch (props.stackState) {
    case StackButtonState.VERTICAL:
      return <VerticalStackButton />;
    case StackButtonState.HORIZONTAL:
      return <HorizontalStackButton />;
    case StackButtonState.SINGLE:
    default:
      return <SingleStackButton />;
  }
}

export default StackButton;
