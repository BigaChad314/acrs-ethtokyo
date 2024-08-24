import React, { useState, useEffect } from "react";
import Popup from "./Popup";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig";
import axios from "axios";
import { fetchGraphData } from "../hooks/fetchGraphData";
import styles from "../styles/Popup.module.css";

interface StakingPopupProps {
  onStake: (amount: number, merkleRoot: string) => void;
  onClose: () => void;
}

const StakingPopup: React.FC<StakingPopupProps> = ({ onStake, onClose }) => {
  const [amount, setAmount] = useState<number>(0);
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rewardPopup, setRewardPopup] = useState<string | null>(null);
  const [importanceData, setImportanceData] = useState<{
    importance: { [key: string]: number };
    reputation: { [key: string]: number };
  }>({ importance: {}, reputation: {} });
  const [ensMappedData, setEnsMappedData] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const listenForImportanceVerified = async () => {
      contract.on("ImportanceVerified", async (success: boolean, event) => {
        if (success) {
          setRewardPopup("Success! You received a 1.5x reward.");
        } else {
          setRewardPopup("Failed! Your bond was forfeited.");
        }
      });
    };

    listenForImportanceVerified();

    return () => {
      contract.off("ImportanceVerified", () => {});
    };
  }, []);

  // Fetch importance data and map to ENS names
  useEffect(() => {
    const fetchAndMapEnsNames = async () => {
      const provider = new ethers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/MbW4GMB1NzOld7nmj9uFA3TrcYGvIhm3"
      );

      const mappedData: { [key: string]: string } = {};

      for (const address of Object.keys(importanceData.importance)) {
        if (ethers.isAddress(address)) {
          const ensName = await provider.lookupAddress(address);
          mappedData[address] = ensName || address;
        } else {
          mappedData[address] = address;
        }
      }

      setEnsMappedData(mappedData);
    };

    if (Object.keys(importanceData.importance).length > 0) {
      fetchAndMapEnsNames();
    }
  }, [importanceData]);

  const getImportance = async () => {
    try {
      const graphData = await fetchGraphData();
      const safeGraphData = {
        ...graphData,
        edges: graphData.edges.map((edge) => ({
          ...edge,
          score: Number(edge.score),
        })),
      };
      const response = await axios.post(
        "http://localhost:5001/calculate",
        safeGraphData
      );
      const importance = response.data;
      setImportanceData(importance);
      return importance;
    } catch (error) {
      console.error("Error fetching importance data:", error);
    }
  };

  const handleStake = async () => {
    setIsSubmitting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.deposit({
        value: ethers.parseEther(String(amount)),
      });
      await tx.wait();

      onStake(amount, merkleRoot);
    } catch (error) {
      console.error("Error staking tokens:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleVerifyImportance = async () => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const parsedImportance = await getImportance();

      const [sortedNodeAddresses, sortedImportances] = Object.entries(
        parsedImportance.importance
      ).reduce(
        ([addresses, importances], [address, importanceValue]) => {
          addresses.push(ethers.getAddress(address));
          importances.push(BigInt(Math.round(Number(importanceValue) * 1e18)));
          return [addresses, importances];
        },
        [[], []] as [string[], ethers.BigNumberish[]]
      );

     const importanceMatrix: ethers.BigNumberish[][] = [
        [...sortedImportances],
        [...sortedImportances],
        [...sortedImportances]
      ];

      const tx = await contract.verifyImportance(
        sortedNodeAddresses,
        importanceMatrix
      );
      console.log("sortedNodeAddresses", sortedNodeAddresses);
      console.log("importanceMatrix", importanceMatrix);
      await tx.wait();

      console.log("Importance verified successfully.");
    } catch (error) {
      console.error("Error verifying importance:", error);
    }
  };

  return (
    <div>
      <Popup title="" onClose={onClose}>
        <button className={styles.popupClose} onClick={onClose}>
          X
        </button>
        <div>
          <p>amount:</p>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button onClick={handleStake} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Stake"}
          </button>
          <p>Get Importance</p>
          <button onClick={getImportance}>Get Importance</button>
          <div>
            <h4>Importance and Reputation Data:</h4>
            <pre>
              {Object.entries(importanceData.importance).map(
                ([address, importance]) => {
                  const ensName = ensMappedData[address] || address;
                  const reputation = importanceData.reputation[address];
                  return `${ensName} - Importance: ${importance}, Reputation: ${reputation}\n`;
                }
              )}
            </pre>
          </div>
          <p>Importance:</p>
          <input
            type="text"
            placeholder="importance"
            value={merkleRoot}
            onChange={(e) => setMerkleRoot(e.target.value)}
          />
          <button onClick={handleVerifyImportance}>Verify Importance</button>
        </div>

        <button onClick={() => {}}>submit malicious</button>
      </Popup>

      {rewardPopup && (
        <Popup title="Staking Result" onClose={() => setRewardPopup(null)}>
          <p>{rewardPopup}</p>
          <button onClick={() => setRewardPopup(null)}>Close</button>
        </Popup>
      )}
    </div>
  );
};

export default StakingPopup;
