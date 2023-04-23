const apiPrefix = window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : '/api';

export interface Algorithm {
  label: string;
  value: string;
  usesHeuristics: boolean;
};

export interface Heuristic {
  label: string;
  value: string;
};

export interface Options {
  algorithms: Algorithm[];
  algorithm: Algorithm;
  heuristics: Heuristic[];
  heuristic: Heuristic;
  templates: string[];
};

export interface Template {
  matrixScale: number;
  matrixScalePow: number;
  matrixSize: number;
  matrix: Record<string, number>;
  start: {
    x: number;
    y: number;
    z: number;
  };
  goal: {
    x: number;
    y: number;
    z: number;
  };
};

export interface RunResponse {
  solution: number[][];
  visited: number[][];
  executionTime: number;
};

export const getOptions = async(): Promise<Options> => {
  return await fetch(`${apiPrefix}/options`).then(async(response) => {
    if (!response.ok) throw new Error('Network response not OK');
    return await response.json();
  });
};

export const runPathfindingAlgorithm = async(
  body?: BodyInit | null
): Promise<RunResponse> => {
  return await fetch(`${apiPrefix}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
    .then(async(response) => {
      if (!response.ok) throw new Error('Network response not OK');
      return await response.json();
    });
};

export const getTemplate = async(template: string): Promise<Template> => {
  return await fetch(`${apiPrefix}/templates/${template}.json`, {
    method: 'GET'
  })
    .then(async(response) => {
      if (!response.ok) throw new Error('Network response not OK');
      return await response.json();
    });
};
