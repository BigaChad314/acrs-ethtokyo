import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { l1sloadABI } from "../contractConfig"; // l1sloadABI는 해당 스마트 계약의 ABI로 가정

interface L2Props {
  nodeAddrsses: string[];
}

const L2: React.FC<L2Props> = ({ nodeAddrsses }) => {
  const [reputations, setReputations] = useState<{ [address: string]: number }>(
    {}
  );

  // 하드코딩된 RPC URL을 사용하여 provider 생성
  const provider = new ethers.JsonRpcProvider("https://l1sload-rpc.scroll.io");

  async function fetchReputation(contractAddress: string, account: string) {
    const contract = new ethers.Contract(contractAddress, l1sloadABI, provider);
    try {
      const reputation = await contract.retrieveL1Balance(account);
      return Number(reputation); // Assuming reputation is returned as a BigNumber
    } catch (error) {
      console.error(`Failed to fetch reputation for ${account}:`, error);
      return 0; // Return 0 or some default value if fetching fails
    }
  }

  useEffect(() => {
    async function fetchAllReputations() {
      const contractAddress = "0xb8490f653dABC40DE7C0d7Dd57d2CD1511D89Bd0"; // Replace with your contract's address

      const reputationsMap: { [address: string]: number } = {};
      for (const address of nodeAddrsses) {
        const reputation = await fetchReputation(contractAddress, address);
        reputationsMap[address] = Math.floor(reputation / 10 ** 16);
      }
      setReputations(reputationsMap);
    }

    fetchAllReputations();
  }, [nodeAddrsses]);

  const containerStyle = {
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle = {
    textAlign: "center" as const,
    fontSize: "24px",
    color: "#333",
    marginBottom: "20px",
  };

  const welcomeStyle = {
    textAlign: "center" as const,
    fontSize: "32px",
    fontWeight: "bold" as const,
    color: "#4CAF50",
    marginBottom: "30px",
  };

  const listStyle = {
    listStyleType: "none" as const,
    padding: 0,
  };

  const listItemStyle = {
    backgroundColor: "#fff",
    margin: "10px 0",
    padding: "10px 15px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const addressStyle = {
    fontSize: "14px",
    color: "#666",
    wordBreak: "break-all" as const,
    flex: 1,
    marginRight: "10px",
  };

  const reputationStyle = {
    fontSize: "16px",
    fontWeight: "bold" as const,
    color: "#333",
  };

  return (
    <div style={containerStyle}>
      <h1 style={welcomeStyle}>Welcome to SCROLL L2: Using L1sload</h1>
      <h1 style={headerStyle}>Node Reputations</h1>
      <ul style={listStyle}>
        {nodeAddrsses.map((address, index) => (
          <li key={index} style={listItemStyle}>
            <span style={addressStyle}>{address}</span>
            <span style={reputationStyle}>
              {reputations[address] ?? "Loading..."}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default L2;
