/* eslint-disable require-jsdoc */
/* eslint-disable guard-for-in */
const {assert, should} = require('chai');
const PriorityQueue = require('../src/algorithms/AStar/priorityQueue');

const N = 10;
should();

const shuffle = (array) => {
  let currentIndex = array.length; let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] =
      [array[randomIndex], array[currentIndex]];
  }

  return array;
};

describe('PriorityQueue', () => {
  describe('when populated with regular numbers', () => {
    it('should output a given sequence of numbers in descending order', () => {
      // [1 ... 15]
      const expected = [...Array(15)].map((_, i) => i + 1).reverse();

      for (let i = 0; i < N; i++) {
        const shuffled = shuffle([...expected]);

        const pq = new PriorityQueue();
        for (const i in shuffled) {
          pq.add(shuffled[i]);
        }

        let next;
        while ((next = pq.poll()) !== null) {
          const pop = expected.pop();
          assert(pop === next, `expected ${pop} to be equal ${next}`);
        }
      }
    });

    it('should output the randomly generated numbers in descending order', () => {
      for (let i = 0; i < N; i++) {
        const pq = new PriorityQueue();
        for (let j = 0; j < 100; j++) {
          pq.add(Math.random());
        }

        const previous = Number.MAX_VALUE;
        let next;
        while ((next = pq.poll()) !== null) {
          assert(
              next <= previous,
              `expected ${next} to be less than or equal ${previous}`,
          );
        }
      }
    });
  });

  describe('when populated with a custom class', () => {
    it('should output the objects in descending order based on valueOf', () => {
      class MyCustomObject {
        #a;
        #myValue;
        constructor(a, b, myValue) {
          this.#a = a;
          this.b = b;
          this.#myValue = myValue;
        }

        valueOf() {
          return this.#myValue;
        }

        get a() {
          return this.#a;
        }

        get myValue() {
          return this.#myValue;
        }
      }

      // [1 ... 15]
      const expected = [...Array(15)]
          .map((_, i) => i + 1)
          .reverse()
          .map((i) => new MyCustomObject(Math.random(), Math.random(), i));

      for (let i = 0; i < N; i++) {
        const shuffled = shuffle([...expected]);

        const pq = new PriorityQueue();
        for (const i in shuffled) {
          pq.add(shuffled[i]);
        }

        let next;
        while ((next = pq.poll()) !== null) {
          const pop = expected.pop();
          assert(pop === next, `expected ${pop} to be equal ${next}`);
        }
      }
    });
  });
});
