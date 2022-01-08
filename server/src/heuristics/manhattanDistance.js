module.exports = class ManhattanDistance {
  static label = 'Manhattan distance';

  /**
   * TODO: Write JSDoc
   *
   * @param {Number} nodeX
   * @param {Number} nodeY
   * @param {Number} destinationX
   * @param {Number} destinationY
   * @return {Number} The manhattan distance between node and destination
   */
  calculate(nodeX, nodeY, destinationX, destinationY) {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);
    return (dx + dy);
  }
};
