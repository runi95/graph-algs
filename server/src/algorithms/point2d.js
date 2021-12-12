module.exports = class Point2D {
  /**
   * TODO: Write JSDoc
   *
   * @param {*} x
   * @param {*} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {String}
   */
  toString() {
    return `(${this.x}, ${this.y})`;
  }
};
