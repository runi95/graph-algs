/**
 * TODO: Write JSDoc
 *
 * @param {Number} nodeX
 * @param {Number} nodeY
 * @param {Number} destinationX
 * @param {Number} destinationY
 * @return {Number} The manhattan distance between node and destination
 */
function manhattanDistance(nodeX, nodeY, destinationX, destinationY) {
  const dx = Math.abs(nodeX - destinationX);
  const dy = Math.abs(nodeY - destinationY);
  return (dx + dy);
}

/**
 * TODO: Write JSDoc
 *
 * @param {Number} nodeX
 * @param {Number} nodeY
 * @param {Number} destinationX
 * @param {Number} destinationY
 * @return {Number} The octile distance between node and destination
 */
function octileDistance(nodeX, nodeY, destinationX, destinationY) {
  const dx = Math.abs(nodeX - destinationX);
  const dy = Math.abs(nodeY - destinationY);
  const f = Math.SQRT2 - 1;

  return (dx < dy) ? f * dx + dy : f * dy + dx;
}

/**
 * TODO: Write JSDoc
 *
 * @param {Number} nodeX
 * @param {Number} nodeY
 * @param {Number} destinationX
 * @param {Number} destinationY
 * @return {Number} The euclidean distance between node and destination
 */
function euclideanDistance(nodeX, nodeY, destinationX, destinationY) {
  const dx = Math.abs(nodeX - destinationX);
  const dy = Math.abs(nodeY - destinationY);

  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

module.exports = {manhattanDistance, euclideanDistance, octileDistance};
