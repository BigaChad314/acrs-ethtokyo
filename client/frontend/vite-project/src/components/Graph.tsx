import React, { useState, useEffect, useCallback } from "react";
import { Graph as GraphType, Node } from "../types/graph";
import { useGraph } from "../hooks/useGraph";
import NodeComponent from "./Node";
import EdgeComponent from "./Edge";
import styles from "../styles/Graph.module.css";
import ReputationPopup from "./ReputationPopup";
import Popup from "./Popup";
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

  const showReputationPopup =() => {
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
          <h3>Node Information</h3>
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Address:</strong> {selectedNode.address}</p>
          <p><strong>Reputation:</strong> {selectedNode.reputation}</p>
          <p><strong>Importance:</strong> {selectedNode.importance}</p>
          <h4>Given Scores:</h4>
          <ul>
            {selectedNode.givenScores.map((score, index) => (
              <li key={index}>
                To Node {score.from}: {score.score}
              </li>
            ))}
          </ul>
          <button onClick={(e) => {
            e.stopPropagation();
            showReputationPopup();
          }}>
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