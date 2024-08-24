import React, { useState } from "react";
import Popup from "./Popup";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig";

interface ReputationPopupProps {
  nodeAddress: string;
  onSubmit: (reputation: number) => void;
  onClose: () => void;
}

const ReputationPopup: React.FC<ReputationPopupProps> = ({ nodeAddress, onSubmit, onClose }) => {
  const [reputation, setReputation] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (reputation <= 0 || reputation > 100) return;

    setIsSubmitting(true);
    try {
      // 이더리움 지갑 연결
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // 스마트 컨트랙트 인스턴스 생성      
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // giveScore 함수 호출
      const tx = await contract.giveScore(nodeAddress, reputation);
      await tx.wait(); // 트랜잭션이 블록에 포함될 때까지 대기

      // 성공적으로 처리된 후
      onSubmit(reputation);
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Popup title="Assign Reputation" onClose={onClose}>
      <div>
        <p>Assign reputation score to node: {nodeAddress}</p>
        <input
          type="number"
          placeholder="Enter reputation score"
          value={reputation}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 100) {
              setReputation(value);
            }
          }}
          min={0}
          max={100}
        />
        <input type="text" placeholder="Node address" value={nodeAddress} readOnly />
      </div>
      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </Popup>
  );
};

export default ReputationPopup;