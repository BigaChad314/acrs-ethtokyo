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

  // 고정된 위치를 설정하기 위한 맵
  const positionMap: { [address: string]: { x: number; y: number } } = {
    "0x8300BF4586F9E05deb42764d244eD684887DB056": { x: 100, y: 200 }, // Cluster 1, moved farther from center
    "0x99Ce8af408f7615E262d7DEC7f5ba293a9F89ceb": { x: 200, y: 80 }, // Cluster 1, separated
    "0xdeeD60634422E3bfC4Ed6ee2B5FF634a159dc356": { x: 620, y: 60 }, // Cluster 2, separated
    "0x8331F89681A0395BD9293bb28E6a268a429925a7": { x: 380, y: 260 }, // Central, near node 4
    "0x73d2544Fe05064bA9A00d0F5a51c28F48f07AAdD": { x: 150, y: 100 }, // Cluster 1, separated
    "0xe74b3831e9a3f8CB70c6600c177cd021259e3843": { x: 260, y: 240 }, // Node 4 central position
    "0x311e10Ca7346938f50d7D41E7b4Ba19a8CFe51Fe": { x: 700, y: 200 }, // Cluster 2, moved farther from center
    "0x487C794d1f626BE38F47995feEC236aE733c34b5": { x: 100, y: 300 }, // Cluster 3, separated
    "0x29332b313F9CCF835Ea4390aE96D75B7261559C9": { x: 150, y: 350 }, // Cluster 3, separated
    "0xCd53f43Dfdfd939Ec6D6E03B95D29061aD2AfB4F": { x: 700, y: 400 }, // Cluster 2, separated
    "0x7e99F7e28726742573125466f40CE01651f4ab61": { x: 100, y: 450 }, // Cluster 3, separated
    "0xB53C1a186B6cA40cD6a54DAc026eE8Ddc5e50082": { x: 150, y: 450 }, // Cluster 3, separated
    "0xed12622CFB180a7C12210F90318435980926908A": { x: 750, y: 450 }, // Cluster 2, separated
    "0xE8940D1A21306fC1feF008e26407Fde3A55EB5d8": { x: 800, y: 280 }, // Cluster 2, moved farther from center
    "0x5501254cBa34828C7a7AE4D209997dA918a836fa": { x: 600, y: 450 },
  };

  // Prepare node data based on graphData.edges
  const nodes: Node[] = await Promise.all(
    nodeAddresses.map(async (address: string, index: number) => {
      const givenScores: Score[] = graphData.edges
        .filter((edge) => edge.from === address)
        .map((edge) => ({
          from: nodeAddresses.indexOf(edge.from) + 1,
          score: Number(edge.score),
        }));

      const position = positionMap[address] || {
        x: 25, // Default X coordinate if not found in positionMap
        y: 25, // Default Y coordinate if not found in positionMap
      };

      return {
        id: index + 1,
        address,
        reputation: 0, // Placeholder, will be updated after fetching from server
        importance: 0, // Placeholder, will be updated after fetching from server
        givenScores,
        x: position.x,
        y: position.y,
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
