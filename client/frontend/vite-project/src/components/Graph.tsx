import React, { useState, useEffect, useCallback } from "react";
import { Graph as GraphType, Node } from "../types/graph";
import { useGraph } from "../hooks/useGraph";
import NodeComponent from "./Node";
import EdgeComponent from "./Edge";
import styles from "../styles/Graph.module.css";
import ReputationPopup from "./ReputationPopup";
import ResultPopup from "./ResultPopup";

interface GraphProps {
  graph: GraphType;
}

const Graph: React.FC<GraphProps> = ({ graph }) => {
  const { selectedNode, selectNode, clearSelection, isNodeConnected } = useGraph(graph);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isReputationPopupOpen, setIsReputationPopupOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [isResultPopupOpen, setIsResultPopupOpen] = useState(false);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (
      (e.target as HTMLElement).closest(`.${styles.sidebar}`) === null &&
      (e.target as HTMLElement).closest("circle") === null
    ) {
      clearSelection();
      setShowSidebar(false);
    }
  };

  const handleNodeClick = (node: Node) => {
    selectNode(node);
    setShowSidebar(true);
  };

  const handleReputationSubmit = (reputation: number) => {
    console.log(`Reputation submitted: ${reputation}`);
    setResultMessage(`Reputation of ${reputation} submitted successfully!`);
    setIsReputationPopupOpen(false);
    setIsResultPopupOpen(true);
  };

  const showReputationPopup = () => {
    setIsReputationPopupOpen(true);
    console.log("Reputation popup opened", isReputationPopupOpen);
  };

  

  return (
    <div
      className={`${styles.graphWrapper} ${showSidebar ? styles.withSidebar : ""}`}
      onClick={handleClickOutside}
    >
      <svg className={styles.graphContainer} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        {/* Edge 렌더링 */}
        {graph.edges.map((edge) => {
          const fromNode = graph.nodes.find((n) => n.id === edge.from);
          const toNode = graph.nodes.find((n) => n.id === edge.to);

          if (!fromNode || !toNode) return null;

          const isDimmed = !!(selectedNode && (!isNodeConnected(fromNode) || !isNodeConnected(toNode)));

          return (
            <EdgeComponent
              key={`${edge.from}-${edge.to}`}
              edge={edge}
              fromNode={fromNode}
              toNode={toNode}
              isHighlighted={
                selectedNode
                  ? isNodeConnected(fromNode) || isNodeConnected(toNode)
                  : false
              }
              isDimmed={isDimmed}
            />
          );
        })}

        {/* Node 렌더링 */}
        {graph.nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode ? isNodeConnected(node) : false}
            isDimmed={!!(selectedNode && !isNodeConnected(node))}
            onClick={() => handleNodeClick(node)}
          />
        ))}
      </svg>
      {showSidebar && selectedNode && (
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Node Information</h2>
          <hr className={styles.divider} />
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Node ID:</div>
            <div className={styles.infoValue}>{selectedNode.id}</div>
          </div>
          <div className={styles.addressRow}>
            <div className={styles.infoLabel}>Address:</div>
            <div className={styles.infoValue}>
            {`${selectedNode.address.slice(0, 6)}...${selectedNode.address.slice(-3)}`}
            </div>
          </div>
          <hr className={styles.divider} />
          <div className={styles.statsContainer}>
            <div className={styles.statsLabels}>
              <div>Importance:</div>
              <div>Reputation:</div>
            </div>
            <div className={styles.statsValues}>
              <div>{Math.floor(selectedNode.importance)}</div> {/* 소수점 제거 */}
              <div>{Math.floor(selectedNode.reputation)}</div> {/* 소수점 제거 */}
            </div>
          </div>
          <hr className={styles.divider} />
          <h3 className={styles.reputationScore}>Given Scores</h3>
          {(() => {
      const scoreElements: JSX.Element[] = [];

      // graph.edges에서 각 edge의 score 값을 출력
      graph.edges.forEach((edge) => {
        
        if (edge.to === selectedNode.id) {
          scoreElements.push(
            <div className={styles.scoreRow} key={`${edge.from}-${edge.to}`}>
              <div className={styles.scoreLabels}>
                <div>From Node {edge.from}:</div> {/* From 노드 ID */}
              </div>
              <div className={styles.scoreValues}>
                <div>{edge.score}</div> {/* 해당 에지의 Score 값 */}
              </div>
            </div>
          );
        }
      });

      return scoreElements;
    })()}

          <button
            className={styles.scoreButton}
            onClick={(e) => {
              e.stopPropagation();
              showReputationPopup();
            }}
          >
            Give Score
          </button>
        </div>
      )}

      {isReputationPopupOpen && (
        <ReputationPopup
          nodeAddress={selectedNode?.address || "N/A"}
          onSubmit={handleReputationSubmit}
          onClose={() => setIsReputationPopupOpen(false)}
        />
      )}

      {isResultPopupOpen && (
        <ResultPopup
          message={resultMessage}
          onClose={() => setIsResultPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default Graph;
