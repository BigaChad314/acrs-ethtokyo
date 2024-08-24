import React, { useEffect } from "react";
import Graph from "../components/Graph";
import { Graph as GraphType } from "../types/graph";
import { ethers } from "ethers";

interface GraphPageProps {
  graph: GraphType;
}

const GraphPage: React.FC<GraphPageProps> = ({ graph }) => {
  useEffect(() => {
    const switchToSepolia = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const sepoliaChainId = BigInt("0xaa36a7"); // Sepolia network chain ID in bigint

      try {
        // Check if the user is already connected to Sepolia
        const { chainId } = await provider.getNetwork();
        if (chainId !== sepoliaChainId) {
          // If not, switch to Sepolia
          await provider.send("wallet_switchEthereumChain", [
            { chainId: "0xaa36a7" },
          ]);
        }
      } catch (error: any) {
        // If the network hasn't been added to MetaMask, add it
        if (error.code === 4902) {
          try {
            await provider.send("wallet_addEthereumChain", [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                rpcUrls: [
                  "https://eth-sepolia.g.alchemy.com/v2/MbW4GMB1NzOld7nmj9uFA3TrcYGvIhm3",
                ], // Replace with your Infura project ID
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ]);
          } catch (addError) {
            console.error("Failed to add the Sepolia network:", addError);
          }
        } else {
          console.error("Failed to switch network:", error);
        }
      }
    };

    switchToSepolia();
  }, []);

  return (
    <div>
      <Graph graph={graph} />
    </div>
  );
};

export default GraphPage;
