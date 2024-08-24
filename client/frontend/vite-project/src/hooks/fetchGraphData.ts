import { ethers } from "ethers";
import { GraphData, Edge } from "../types/edge"; // Import your types
import { contractAddress, contractABI } from "../contractConfig";

const CONTRACT_ADDRESS = contractAddress; // Replace with your contract address
const RPC_URL =
  "https://eth-sepolia.g.alchemy.com/v2/MbW4GMB1NzOld7nmj9uFA3TrcYGvIhm3"; // Replace with your RPC URL

export async function fetchGraphData(): Promise<GraphData> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  // Get all node addresses
  const nodeAddresses = await contract.getNodeAddresses();

  const edges: Edge[] = [];

  for (let i = 0; i < nodeAddresses.length; i++) {
    const nodeAddress = nodeAddresses[i];
    const givenScores = await contract.getGivenScores(nodeAddress);
  
    for (let j = 0; j < givenScores.length; j++) {
      const score = givenScores[j];
      console.log("checking score", score);
  
      // Extract the address and score from the returned object
      const from = score[0]; // Extract address (score[0])
      const scoreValue = score[1]; // Extract score (score[1])
  
      edges.push({
        from: from,
        to: nodeAddress,
        score: Number(scoreValue), // Convert BigInt to number if needed
      });
    }
  }

  return { edges };
}
