export enum NodeTypes {
  EMPTY = 0,
  WALL = 1,
  VISITED = 2,
  SOLUTION = 3,
  START = 4,
  GOAL = 5
}

export const nodeTypeToColor = (nodeType: NodeTypes, wallColor: string) => {
  switch (nodeType) {
    case NodeTypes.START:
      return '#afa';
    case NodeTypes.GOAL:
      return '#aaf';
    case NodeTypes.SOLUTION:
      return '#49f';
    case NodeTypes.VISITED:
      return '#324c75';
    case NodeTypes.WALL:
    case NodeTypes.EMPTY:
    default:
      return wallColor;
  }
};

export const nodeTypeToAlpha = (
  nodeState: NodeTypes,
  transparency: number
) => {
  switch (nodeState) {
    case NodeTypes.EMPTY:
      return 0;
    case NodeTypes.VISITED:
    case NodeTypes.WALL:
      return transparency;
    default:
      return 1;
  }
};
