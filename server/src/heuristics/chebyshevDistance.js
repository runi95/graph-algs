module.exports = class ChebyshevDistance {
  static label = 'Chebyshev distance';

  /**
   * TODO: Write JSDoc
   *
   * @param {Number} nodeX
   * @param {Number} nodeY
   * @param {Number} destinationX
   * @param {Number} destinationY
   * @return {Number} The chebyshev distance between node and destination
   */
  calculate(nodeX, nodeY, destinationX, destinationY) {
    const dx = Math.abs(nodeX - destinationX) /
                  (Math.abs(nodeX) + Math.abs(destinationX));
    const dy = Math.abs(nodeY - destinationY) /
                  (Math.abs(nodeY) + Math.abs(destinationY));
    return Math.max(dx, dy);
  }
};


