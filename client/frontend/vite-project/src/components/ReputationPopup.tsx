import React, { useState, useEffect } from "react";
import Popup from "./Popup";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig";
import styles from "../styles/Popup.module.css";


interface ReputationPopupProps {
  nodeAddress: string;
  onSubmit: (reputation: number) => void;
  onClose: () => void;
}

const ReputationPopup: React.FC<ReputationPopupProps> = ({ nodeAddress, onSubmit, onClose }) => {
  const [reputation, setReputation] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (nodeAddress) {
      const fetchName = async () => {
        const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/MbW4GMB1NzOld7nmj9uFA3TrcYGvIhm3");
        const fetchedName = await provider.lookupAddress(nodeAddress);
        setName(fetchedName || "");
      };

      fetchName();
    }
  }, [nodeAddress]);


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
    <Popup title="" onClose={onClose}>
      <button className={styles.popupClose} onClick={onClose}>X</button> {/* Close 버튼을 "X"로 대체 */}
      <div className={styles.headerRow}>
      <div className={styles.recipientLabel}>Give Score To:</div>
      <div className={styles.recipientName}>{name}</div>
      </div>
      <hr className={styles.divider} />
      <div className={styles.nodeInfo}>
        <div className={styles.nodeLabel}>Address:</div>
        <div className={styles.nodeValue}>{`${nodeAddress.slice(0, 6)}...${nodeAddress.slice(-3)}`}</div>
      </div>
      <input
        type="number"
        placeholder="Enter reputation score"
        className={styles.scoreInputField}
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
      <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </Popup>
  );
};

export default ReputationPopup;