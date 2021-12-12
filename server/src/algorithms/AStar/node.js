module.exports = class Node {
  #x;
  #y;
  #isWall;
  /**
   * TODO: Write JSDoc
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Boolean} isWall
   */
  constructor(x, y, isWall) {
    this.#x = x;
    this.#y = y;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.#isWall = isWall;
    this.visited = false;
    this.closed = false;
    this.parent = null;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {Number}
   */
  valueOf() {
    return this.f;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {Number}
   */
  get x() {
    return this.#x;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {Number}
   */
  get y() {
    return this.#y;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {Boolean}
   */
  get isWall() {
    return this.#isWall;
  }
};
