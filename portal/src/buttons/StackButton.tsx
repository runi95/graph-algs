import FullSquareStackButton from './FullSquareStackButton';
import HorizontalStackButton from './HorizontalStackButton';
import SingleStackButton from './SingleStackButton';
import VerticalStackButton from './VerticalStackButton';

export enum StackButtonState {
  SINGLE,
  VERTICAL,
  HORIZONTAL,
  FULL_SQUARE,
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
    case StackButtonState.FULL_SQUARE:
      return <FullSquareStackButton />;
    case StackButtonState.SINGLE:
    default:
      return <SingleStackButton />;
  }
}

export default StackButton;
