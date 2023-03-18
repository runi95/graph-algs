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
    case StackButtonState.SINGLE:
      return <SingleStackButton />;
    case StackButtonState.VERTICAL:
      return <VerticalStackButton />;
    case StackButtonState.HORIZONTAL:
      return <HorizontalStackButton />;
  }
}

export default StackButton;
