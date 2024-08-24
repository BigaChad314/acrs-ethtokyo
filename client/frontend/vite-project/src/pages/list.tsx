import React from "react";
import { Graph as GraphType, Node } from "../types/graph";
import styles from "../styles/GraphList.module.css";

interface GraphListProps {
  graph: GraphType;
}

const GraphList: React.FC<GraphListProps> = ({ graph }) => {
  return (
    <div className={styles.graphListContainer}>
      {graph.nodes.map((node) => (
        <div key={node.id} className={styles.graphListItem}>
          {/* 노드의 사진 */}
          <img
            src={`/images/nodes/${node.id}.jpg`}
            alt={node.address}
            className={styles.nodeImage}
          />
          {/* 노드 이름 및 중요도 & 평판 */}
          <div className={styles.nodeInfo}>
            <h4>{node.address}</h4>
            <div className={styles.nodeStats}>
              <span className={styles.importance}>
                Importance: {node.importance}
              </span>
              <div className={styles.reputationBar}>
                <div
                  className={styles.reputationFill}
                  style={{ width: `${node.reputation}%` }}
                ></div>
              </div>
              <span className={styles.reputationText}>
                Reputation: {node.reputation}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GraphList;