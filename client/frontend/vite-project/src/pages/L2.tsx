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
        reputationsMap[address] = reputation;
      }
      setReputations(reputationsMap);
    }

    fetchAllReputations();
  }, [nodeAddrsses]);

  return (
    <div>
      <h1>Node Reputations</h1>
      <ul>
        {nodeAddrsses.map((address, index) => (
          <li key={index}>
            {address}: {reputations[address] ?? "Loading..."}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default L2;
