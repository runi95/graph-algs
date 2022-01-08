module.exports = class OctileDistance {
  static label = 'Octile distance';

  /**
   * TODO: Write JSDoc
   *
   * @param {Number} nodeX
   * @param {Number} nodeY
   * @param {Number} destinationX
   * @param {Number} destinationY
   * @return {Number} The octile distance between node and destination
   */
  calculate(nodeX, nodeY, destinationX, destinationY) {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);
    const f = Math.SQRT2 - 1;

    return (dx < dy) ? f * dx + dy : f * dy + dx;
  }
};

