import React from "react";
import { Edge, Node } from "../types/graph";
import styles from "../styles/Graph.module.css";

interface EdgeProps {
  edge: Edge;
  fromNode: Node;
  toNode: Node;
  isDimmed: boolean;
  isHighlighted: boolean;
}

const EdgeComponent: React.FC<EdgeProps> = ({
  edge,
  fromNode,
  toNode,
  isDimmed,
  isHighlighted,
}) => {
  return (
    <line
      x1={fromNode.x}
      y1={fromNode.y}
      x2={toNode.x}
      y2={toNode.y}
      className={`${styles.edge} ${isDimmed ? styles.dimmedEdge : ""} ${
        isHighlighted ? styles.highlightedEdge : ""
      }`}
      stroke="gray"
      strokeWidth={isHighlighted ? "3" : "2"} // 강조된 간선은 더 두껍게 설정
    />
  );
};

export default EdgeComponent;