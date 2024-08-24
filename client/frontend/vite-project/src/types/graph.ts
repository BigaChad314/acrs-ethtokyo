export type Node = {
  id: number;
  address: string;
  reputation: number;
  importance: number;
  givenScores: Score[];
  x: number;
  y: number;
};

export type Score = {
  from: number;
  score: number;
};

// export interface Edge extends Score {
//   to: number;
// }

export interface SelectedNodes extends Node {
  selected: boolean;
}

export interface Edge {
  from: number;
  to: number;
  score: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}
