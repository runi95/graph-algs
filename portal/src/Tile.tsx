import {type Vector3} from '@react-three/fiber';
import {DoubleSide} from 'three';

const typeToColor = (type: string) => {
  switch (type) {
    case 'Start':
      return '#afa';
    case 'Goal':
      return '#aaf';
    case 'Solution':
      return '#49f';
    case 'Visited':
      return '#324c75';
    case 'Wall':
    case '':
    default:
      return '#aaa';
  }
};

interface TileProps {
  type: string;
  position: Vector3;
}

export default function Tile(props: TileProps) {
  return (
    <mesh position={props.position}>
      <boxGeometry args={[0.8, 0.8, 0.5]} />
      <meshBasicMaterial
        color={typeToColor(props.type)}
        side={DoubleSide}
        visible={props.type !== ''}
      />
    </mesh>
  );
}
