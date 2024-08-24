// types/Edge.ts
export interface Edge {
  from: string;
  to: string;
  score: number;
}

export interface GraphData {
  edges: Edge[];
}
