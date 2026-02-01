export class LinkedList<T> implements Iterable<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private _size = 0;

  get size() {
    return this._size;
  }

  append(value: T): Node<T> {
    const node = new Node(value);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail!.next = node;
      this.tail = node;
    }

    this._size++;
    return node;
  }

  prepend(value: T): Node<T> {
    const node = new Node(value);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this._size++;
    return node;
  }

  remove(node: Node<T>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    // fully detach (important!)
    node.prev = null;
    node.next = null;

    this._size--;
  }

  pop(): T | null {
    if (!this.tail) return null;

    const value = this.tail.value;
    this.remove(this.tail);
    return value;
  }

  find(predicate: (value: T) => boolean): Node<T> | null {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) return current;
      current = current.next;
    }
    return null;
  }

  clear() {
    let current = this.head;
    while (current) {
      const next = current.next;
      current.prev = null;
      current.next = null;
      current = next;
    }
    this.head = this.tail = null;
    this._size = 0;
  }

  headValue(): T | null {
    return this.head ? this.head.value : null;
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

class Node<T> {
  constructor(
    public value: T,
    public next: Node<T> | null = null,
    public prev: Node<T> | null = null,
  ) {}
}
