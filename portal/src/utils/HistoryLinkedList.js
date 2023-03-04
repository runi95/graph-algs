class Node {
  item;
  next;
  prev;

  constructor(prev, element, next) {
    this.item = element;
    this.next = next;
    this.prev = prev;
  }
}

export class HistoryLinkedList {
  #first = null;
  #current = null;
  #size = 0;

  get size() {
    return this.#size;
  }

  getCurrent() {
    return this.#current.item;
  }

  undo() {
    const c = this.#current;
    if (c === null) {
      return null;
    }

    if (c.prev === null) {
      return null;
    }

    this.#current = this.#current.prev;

    return c.prev.item;
  }

  redo() {
    if (this.#current === null) {
      return null;
    }

    if (this.#current.next === null) {
      return null;
    }

    this.#current = this.#current.next;
    return this.#current.item;
  }

  removeFirst() {
    const f = this.#first;
    if (f === null) {
      throw new Error('No such element');
    }
    return this.#unlinkFirst(f);
  }

  add(e) {
    if (this.#size > 9) {
      this.removeFirst();
    }

    if (this.#current !== null) {
      for (let x = this.#current.next; x !== null; ) {
        this.#size--;
        const next = x.next;
        x.item = null;
        x.next = null;
        x.prev = null;
        x = next;
      }
    }

    const c = this.#current;
    const newNode = new Node(c, e, null);
    this.#current = newNode;
    if (c === null) {
      this.#first = newNode;
    } else {
      c.next = newNode;
    }
    this.#size++;
    return true;
  }

  #unlinkFirst(f) {
    const element = f.item;
    const next = f.next;
    f.item = null;
    f.next = null;
    this.#first = next;
    if (next === null) {
      this.#current = null;
    } else {
      next.prev = null;
    }
    this.#size--;
    return element;
  }
}
