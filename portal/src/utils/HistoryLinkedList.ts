class Node<T> {
  public item: T | null;
  next: Node<T> | null;
  prev: Node<T> | null;

  constructor(prev: Node<T> | null, element: T, next: Node<T> | null) {
    this.item = element;
    this.next = next;
    this.prev = prev;
  }
}

export class HistoryLinkedList<T> {
  private first: Node<T> | null = null;
  private current: Node<T> | null = null;
  private _size = 0;

  get size() {
    return this._size;
  }

  getCurrent(): T | null {
    return this.current?.item ?? null;
  }

  canUndo(): boolean {
    const c = this.current;
    if (c === null) return false;
    if (c.prev === null) return false;
    return c.prev.item !== null;
  }

  undo() {
    const c = this.current;
    if (c === null) {
      return null;
    }

    if (c.prev === null) {
      return null;
    }

    this.current = this.current?.prev ?? null;

    return c.prev.item;
  }

  canRedo(): boolean {
    const c = this.current;
    if (c === null) return false;
    if (c.next === null) return false;
    return c.next.item !== null;
  }

  redo() {
    if (this.current === null) {
      return null;
    }

    if (this.current.next === null) {
      return null;
    }

    this.current = this.current.next;
    return this.current.item;
  }

  removeFirst() {
    const f = this.first;
    if (f === null) {
      throw new Error('No such element');
    }
    return this.unlinkFirst(f);
  }

  add(e: T) {
    if (this._size > 9) {
      this.removeFirst();
    }

    if (this.current !== null) {
      for (let x = this.current.next; x !== null;) {
        this._size--;
        const next = x.next;
        x.item = null;
        x.next = null;
        x.prev = null;
        x = next;
      }
    }

    const c = this.current;
    const newNode = new Node(c, e, null);
    this.current = newNode;
    if (c === null) {
      this.first = newNode;
    } else {
      c.next = newNode;
    }
    this._size++;
    return true;
  }

  private unlinkFirst(f: Node<T>) {
    const element = f.item;
    const next = f.next;
    f.item = null;
    f.next = null;
    this.first = next;
    if (next === null) {
      this.current = null;
    } else {
      next.prev = null;
    }
    this._size--;
    return element;
  }
}
