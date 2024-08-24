import { useState } from "react";
import { Graph, Node, Edge } from "../types/graph";

export const useGraph = (initialGraph: Graph) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const selectNode = (node: Node) => {
    setSelectedNode(node);
  };

  const clearSelection = () => {
    setSelectedNode(null);
  };

  const isNodeConnected = (node: Node) => {
    if (!selectedNode) return false;
    return (
      selectedNode.givenScores.some((score) => score.from === node.id) ||
      initialGraph.edges.some(
        (edge) => edge.to === node.id && edge.from === selectedNode.id
      )
    );
  };

  return {
    selectedNode,
    selectNode,
    clearSelection,
    isNodeConnected,
  };
};