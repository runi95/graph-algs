export class NoValidPathError extends Error {
    public readonly visited: number[][]

    constructor(visited: number[][]) {
        super('No valid path to destination');
        this.name = 'DestinationError';
        this.visited = visited;
    }
}
