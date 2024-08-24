import axios from "axios";
import { Graph, Node, Edge, Score } from "../types/graph"; // Use the original types
import { fetchGraphData } from "./fetchGraphData"; // Import the function to fetch graph data

async function getSampleGraph(): Promise<Graph> {
  // Fetch graph data (edges) from the smart contract using the fetchGraphData function
  const graphData = await fetchGraphData();

  // Extract unique node addresses from graphData.edges
  const nodeAddresses: string[] = Array.from(
    new Set(graphData.edges.flatMap((edge) => [edge.from, edge.to]))
  );

  // Prepare node data based on graphData.edges
  const nodes: Node[] = await Promise.all(
    nodeAddresses.map(async (address: string, index: number) => {
      const givenScores: Score[] = graphData.edges
        .filter((edge) => edge.from === address)
        .map((edge) => ({
          from: nodeAddresses.indexOf(edge.from) + 1,
          score: Number(edge.score),
        }));

      return {
        id: index + 1,
        address,
        reputation: 0, // Placeholder, will be updated after fetching from server
        importance: 0, // Placeholder, will be updated after fetching from server
        givenScores,
        x: Math.random() * 750 + 25, // Random X coordinate for layout
        y: Math.random() * 550 + 25, // Random Y coordinate for layout
      };
    })
  );

  const safeGraphData = {
    ...graphData,
    edges: graphData.edges.map((edge) => ({
      ...edge,
      score: Number(edge.score), // Convert BigInt to Number
    })),
  };

  console.log(safeGraphData);

  // Send graph data to the server to get importance and reputation scores
  const response = await axios.post(
    "http://localhost:5001/calculate",
    safeGraphData
  );
  const { importance, reputation } = response.data;

  // Update nodes with importance and reputation from server
  nodes.forEach((node) => {
    const lowercasedAddress = node.address.toLowerCase();
    node.reputation = Number(reputation[lowercasedAddress]) * 30 + 1;
    node.importance = Number(importance[lowercasedAddress]) * 30 + 1;
  });

  // Format edges for the graph
  const formattedEdges: Edge[] = graphData.edges.map((edge) => ({
    from: nodeAddresses.indexOf(edge.from) + 1,
    to: nodeAddresses.indexOf(edge.to) + 1,
    score: edge.score,
  }));

  return { nodes, edges: formattedEdges };
}

export default getSampleGraph;
