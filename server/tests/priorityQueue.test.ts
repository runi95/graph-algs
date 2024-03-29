import test from 'ava';
import {PriorityQueue} from '../src/algorithms/priorityQueue';

const N = 10;
const shuffle = <T>(array: T[]) => {
    let currentIndex = array.length; let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] =
            [array[randomIndex], array[currentIndex]];
    }

    return array;
};

test('should output a given sequence of numbers in descending order', t => {
    // [1 ... 15]
    const expected = [...Array(15)].map((_, i) => i + 1).reverse();

    for (let i = 0; i < N; i++) {
        const shuffled = shuffle([...expected]);

        const pq = new PriorityQueue<number>();
        for (const i in shuffled) {
            pq.add(shuffled[i]);
        }

        let next;
        while ((next = pq.poll()) !== null) {
            const pop = expected.pop();
            t.true(pop === next, `expected ${pop} to be equal ${next}`);
        }
    }
});

test('should output the randomly generated numbers in descending order', t => {
    for (let i = 0; i < N; i++) {
        const pq = new PriorityQueue<number>();
        for (let j = 0; j < 100; j++) {
            pq.add(Math.random());
        }

        const previous = Number.MAX_VALUE;
        let next = null;
        while ((next = pq.poll()) !== null) {
            t.true(
                next <= previous,
                `expected ${next} to be less than or equal ${previous}`
            );
        }
    }
});

test('should output the objects in descending order based on valueOf', t => {
    class MyCustomObject {
        public readonly a: number;
        public readonly myValue: number;
        public readonly b: number;

        constructor(a: number, b: number, myValue: number) {
            this.a = a;
            this.b = b;
            this.myValue = myValue;
        }

        public valueOf(): number {
            return this.myValue;
        }
    }

    // [1 ... 15]
    const expected: MyCustomObject[] = [...Array(15)]
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
            t.true(pop === next, `expected ${pop} to be equal ${next}`);
        }
    }
});

test('should output the objects in descending order based on custom comparator', t => {
    const comparator = (a: [number, number], b: [number, number]) => {
        if (a[0] > b[0]) {
            return 1;
        }
    
        if (a[0] < b[0]) {
            return -1;
        }
    
        if (a[1] > b[1]) {
            return 1;
        }
    
        if (a[1] < b[1]) {
            return -1;
        }
    
        return 0;
    };

    const expected: [number, number][] = [
        [10.16227766016838, 7],
        [10.055385138137417, 1],
        [9.3166247903554, 6],
        [9, 4],
        [9, 3],
        [9, 2],
        [9, 1],
    ];

    for (let i = 0; i < N; i++) {
        const shuffled = shuffle([...expected]);

        const pq = new PriorityQueue(comparator);
        for (const i in shuffled) {
            pq.add(shuffled[i]);
        }

        let next;
        while ((next = pq.poll()) !== null) {
            const pop = expected.pop();
            t.true(pop === next, `expected ${pop} to be equal ${next}`);
        }
    }
});
