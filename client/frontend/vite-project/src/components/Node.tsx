import React, { useState } from "react";
import { Node } from "../types/graph";
import styles from "../styles/Graph.module.css";

interface NodeProps {
  node: Node;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

const NodeComponent: React.FC<NodeProps> = ({
  node,
  isSelected,
  isDimmed,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const radius = node.importance * 3; // importance에 비례해 크기를 조절

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`${styles.node} ${isSelected ? styles.selectedNode : ""} ${
        isDimmed ? styles.dimmedNode : ""
      }`}
      transform={`translate(${node.x}, ${node.y})`}
    >
      <circle
        r={radius}
        fill={isSelected ? "orange" : "lightblue"}
        stroke="black"
        strokeWidth="2"
      />
      {/* 원 안에 ID 표시 */}
      <text
        x="0"
        y="5" // y 좌표를 살짝 내려서 텍스트가 원의 중앙에 오도록 조정
        textAnchor="middle"
        fontSize="12px"
        fill="black"
      >
        {node.id}
      </text>
      {showTooltip && (
        <foreignObject x={radius + 5} y={-radius - 10} width={100} height={60}>
          <div className={styles.tooltip}>
            <p>
              <strong>{node.address}</strong>
            </p>
            <p>Reputation: {node.reputation}</p>
            <p>Importance: {node.importance}</p>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default NodeComponent;
