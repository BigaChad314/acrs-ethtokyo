import React from "react";
import Graph from "../components/Graph";
import { Graph as GraphType } from "../types/graph";


interface GraphPageProps {
    graph: GraphType;
  }

const GraphPage: React.FC<GraphPageProps> = ({ graph }) => {
    return (
        <div>
        <Graph graph={graph} />
        </div>
    );
};

export default GraphPage;