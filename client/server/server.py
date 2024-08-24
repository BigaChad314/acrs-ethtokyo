from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# 기본 로깅 설정 (터미널에 출력)
logging.basicConfig(level=logging.DEBUG)

@app.route('/calculate', methods=['POST'])
def calculate():
    graph_data = request.json
    G = nx.DiGraph()  # Use a directed graph

    try:
        app.logger.debug("Received graph data: %s", graph_data)

        for edge in graph_data["edges"]:
            node1 = edge["from"]
            node2 = edge["to"]
            weight = edge["score"]
            app.logger.debug(f"Adding directed edge: {node1} -> {node2} with weight {weight}")
            G.add_edge(node1.lower(), node2.lower(), weight=float(weight))  # Adds a directed edge with a float weight
        
        app.logger.debug("Graph edges added successfully.")
    except Exception as e:
        app.logger.error("Error adding edges: %s", str(e))
        return jsonify({"error": f"Error adding edges: {str(e)}"}), 500

    try:
        edge_betweenness = nx.edge_betweenness_centrality(G)
        app.logger.debug("Edge betweenness calculated: %s", edge_betweenness)
    except Exception as e:
        app.logger.error("Error calculating edge betweenness: %s", str(e))
        return jsonify({"error": f"Error calculating edge betweenness: {str(e)}"}), 500

    node_importance = {}
    try:
        for node in G.nodes():
            connected_edges = G.edges(node)
            importance_sum = 0
            for edge in connected_edges:
                if edge in edge_betweenness:
                    importance_sum += edge_betweenness[edge]
                else:
                    app.logger.error(f"Edge not found in edge_betweenness: {edge}")
            
            node_importance[node] = importance_sum / len(list(connected_edges)) if len(list(connected_edges)) > 0 else 0
            app.logger.debug(f"Calculated importance for node {node}: {node_importance[node]}")
    except Exception as e:
        app.logger.error("Error calculating node importance: %s", str(e))
        return jsonify({"error": f"Error calculating node importance: {str(e)}"}), 500

    node_reputation = {}
    try:
        for node in G.nodes():
            connected_nodes = list(G.predecessors(node))  # Use predecessors for directed graph
            reputation_sum = 0
            for neighbor in connected_nodes:
                weight = G[neighbor][node].get('weight', 1)
                reputation_sum += node_importance[neighbor] * float(weight)
                app.logger.debug(f"Node {node}: Added {node_importance[neighbor]} * {weight} for neighbor {neighbor}")

            node_reputation[node] = reputation_sum / len(connected_nodes) if len(connected_nodes) > 0 else 0
            app.logger.debug(f"Calculated reputation for node {node}: {node_reputation[node]}")
    except Exception as e:
        app.logger.error("Error calculating node reputation: %s", str(e))
        return jsonify({"error": f"Error calculating node reputation: {str(e)}"}), 500

    result = {
        "importance": node_importance,
        "reputation": node_reputation
    }

    app.logger.debug("Final result: %s", result)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
