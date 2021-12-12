const {expect} = require('chai');
const chai = require('chai');
const AStar = require('../src/algorithms/AStar');

chai.should();

describe('AStar', () => {
  describe('when given an adjacency matrix with no walls', () => {
    it('should find a path from source node to destination node', () => {
      const size = 15;
      const adjMatrix = [...Array(size)].map(() => [...Array(size)].map(() => ''));

      const aStar = new AStar(adjMatrix);
      const result = aStar.search(0, 0, 13, 13);
      expect(result).to.have.own.property('solution');
      expect(result).to.have.own.property('visited');
      expect(result.solution).to.be.an.instanceof(Array);
      expect(result.visited).to.be.an.instanceof(Array);
    });
  });
});
