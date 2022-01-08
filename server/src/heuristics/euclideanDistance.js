module.exports = class EuclideanDistance {
  static label = 'Euclidean distance';

  /**
   * TODO: Write JSDoc
   *
   * @param {Number} nodeX
   * @param {Number} nodeY
   * @param {Number} destinationX
   * @param {Number} destinationY
   * @return {Number} The euclidean distance between node and destination
   */
  calculate(nodeX, nodeY, destinationX, destinationY) {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }
};

