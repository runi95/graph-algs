module.exports = class PriorityQueue {
  #size;
  #queue;
  /**
   * TODO: Write JSDoc
   */
  constructor() {
    this.#size = 0;
    this.#queue = [];
  }

  /**
   * TODO: Write JSDoc
   * @param {*} e
   * @return {*}
   */
  add(e) {
    return this.offer(e);
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} e
   * @return {*}
   */
  offer(e) {
    const i = this.#size;
    this.#size++;
    if (i === 0) {
      this.#queue[0] = e;
    } else {
      this.#siftUp(i, e);
    }

    return true;
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} k
   * @param {*} key
   */
  #siftUp(k, key) {
    while (k > 0) {
      const parent = (k - 1) >>> 1;
      const e = this.#queue[parent];
      if (key >= e) break;

      this.#queue[k] = e;
      k = parent;
    }
    this.#queue[k] = key;
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} k
   * @param {*} key
   */
  #siftDown(k, key) {
    const half = this.#size >>> 1;
    while (k < half) {
      let child = (k << 1) + 1;
      let c = this.#queue[child];
      const right = child + 1;
      if (right < this.#size && c > this.#queue[right]) {
        c = this.#queue[child = right];
      }
      if (key <= c) break;

      this.#queue[k] = c;
      k = child;
    }

    this.#queue[k] = key;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {*}
   */
  poll() {
    if (this.#size === 0) return null;

    const s = --this.#size;
    const result = this.#queue[0];
    const x = this.#queue[s];
    this.#queue.pop();
    if (s !== 0) {
      this.#siftDown(0, x);
    }

    return result;
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} o
   * @return {Boolean}
   */
  remove(o) {
    const i = this.#queue.indexOf(o);
    if (i !== -1) {
      return false;
    } else {
      this.#removeAt(i);
      return true;
    }
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} i
   * @return {*}
   */
  #removeAt(i) {
    const s = --this.#size;
    this.#queue.pop();
    if (s !== i) {
      const moved = this.#queue[s];
      this.#siftDown(i, moved);
      if (this.#queue[i] === moved) {
        this.#siftUp(i, moved);
        if (this.#queue[i] !== moved) {
          return moved;
        }
      }
    }

    return null;
  }

  // eslint-disable-next-line require-jsdoc
  get size() {
    return this.#size;
  }
};
