import React, { useState, useEffect } from "react";
import Popup from "./Popup";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig";
import axios from "axios";
import { fetchGraphData } from "../hooks/fetchGraphData";

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
    [key: string]: number;
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
        // 트랜잭션 ID가 일치하는지 확인
        if (success) {
          setRewardPopup("Success! You received a 1.5x reward.");
        } else {
          setRewardPopup("Failed! Your bond was forfeited.");
        }
      });
    };

    listenForImportanceVerified();

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      contract.off("ImportanceVerified", () => {});
    };
  }, []);

  const getImportance = async () => {
    try {
      const graphData = await fetchGraphData();
      const safeGraphData = {
        ...graphData,
        edges: graphData.edges.map((edge) => ({
          ...edge,
          score: Number(edge.score), // Convert BigInt to Number
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

      // 스테이킹 트랜잭션 발생

      const tx = await contract.deposit({
        value: ethers.parseEther(String(amount)),
      });
      await tx.wait(); // 트랜잭션이 블록에 포함될 때까지 대기

      // await contract.verfiyImportance([signer.address, signer.address, signer.address], importance);

      onStake(amount, merkleRoot);
    } catch (error) {
      console.error("Error staking tokens:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  async function getRandomNodesFromContract(reputationSystem: ethers.Contract) {
    const randomNodes = [];
    for (let i = 0; i < 3; i++) {
      const node = await reputationSystem.randomNodes(i);
      randomNodes.push(node);
    }
    return randomNodes;
  }

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

      // Format the importance data into the required array of arrays for importances
      // const parsedImportance = JSON.parse(merkleRoot);
      const parsedImportance = await getImportance();
      console.log(parsedImportance);
      // const importances = [
      //   Object.values(parsedImportance),
      //   Object.values(parsedImportance),
      //   Object.values(parsedImportance),
      // ];
      const [sortedNodeAddresses, sortedImportances] = Object.entries(
        parsedImportance.importance
      ).reduce(
        ([addresses, importances], [address, importanceValue]) => {
          addresses.push(ethers.getAddress(address)); // Convert to checksum address
          importances.push(BigInt(Math.round(Number(importanceValue) * 1e18)));
          return [addresses, importances];
        },
        [[], []] as [string[], ethers.BigNumberish[]]
      );

      const randomNodes = await getRandomNodesFromContract(contract);

      const importanceMatrix: ethers.BigNumberish[][] = randomNodes.map(() => [
        ...sortedImportances,
      ]);

      // Call the verifyImportance function on the contract
      const tx = await contract.verifyImportance(
        sortedNodeAddresses,
        importanceMatrix
      );
      await tx.wait();

      console.log("Importance verified successfully.");
    } catch (error) {
      console.error("Error verifying importance:", error);
    }
  };

  const handleMalicious = async () => {};

  return (
    <div>
      <Popup title="Stake Your Tokens" onClose={onClose}>
        <div>
          <p>Enter the amount to stake:</p>
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
            <h4>Importance Data:</h4>
            <pre>{JSON.stringify(importanceData, null, 2)}</pre>
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

        <button onClick={handleMalicious}>submit malicious</button>
      </Popup>

      {/* 보상 결과 팝업 */}
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
