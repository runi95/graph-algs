const defaultComparator = (a, b) => {
  if (a > b) {
    return 1;
  }

  if (a < b) {
    return -1;
  }

  return 0;
};

module.exports = class PriorityQueue {
  #size;
  #queue;
  #comparator;
  /**
   * TODO: Write JSDoc
   *
   * @param {*} comparator
   *
   */
  constructor(comparator = defaultComparator) {
    this.#comparator = comparator;
    this.#size = 0;
    this.#queue = [];
  }

  /**
   * TODO: Write JSDoc
   * @param {Node} e
   * @return {boolean}
   */
  add(e) {
    return this.offer(e);
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {Node} e
   * @return {boolean}
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
   * @param {number} k
   * @param {Node} key
   */
  #siftUp(k, key) {
    while (k > 0) {
      const parent = (k - 1) >>> 1;
      const e = this.#queue[parent];
      if (this.#comparator(key, e) >= 0) break;

      this.#queue[k] = e;
      k = parent;
    }
    this.#queue[k] = key;
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {number} k
   * @param {Node} key
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
      if (this.#comparator(key, c) <= 0) break;

      this.#queue[k] = c;
      k = child;
    }

    this.#queue[k] = key;
  }

  /**
   * TODO: Write JSDoc
   *
   * @return {Node}
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
   * @param {Node} o
   * @return {Boolean}
   */
  remove(o) {
    const i = this.#queue.indexOf(o);
    if (i === -1) {
      return false;
    } else {
      this.#removeAt(i);
      return true;
    }
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {number} i
   * @return {Node}
   */
  #removeAt(i) {
    const s = --this.#size;
    const moved = this.#queue.pop();
    if (s !== i) {
      this.#siftDown(i, moved);
      if (this.#comparator(this.#queue[i], moved) === 0) {
        this.#siftUp(i, moved);
        if (this.#comparator(this.#queue[i], moved) !== 0) {
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
