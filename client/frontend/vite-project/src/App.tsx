import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GraphList from "./pages/list";
import GraphPage from "./pages/graphPage";
import getSampleGraph from "./hooks/getSampleGraph";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { createWallet, walletConnect, inAppWallet } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./contractConfig";
import StakingPopup from "./components/StakingPopup";
import L2 from "./pages/L2";

const client = createThirdwebClient({
  clientId: "df016d8e33fef698ceca1452ed85d476",
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook", "phone"],
    },
  }),
];

const sampleGraph = await getSampleGraph();

const App: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isStakingPopupOpen, setIsStakingPopupOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [isResultPopupOpen, setIsResultPopupOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [addressList, setAddressList] = useState<string[]>([]);

  const handleStake = (amount: number, merkleRoot: string) => {
    console.log(`Staked amount: ${amount} with Merkle Root: ${merkleRoot}`);
    setResultMessage(`Staked ${amount} tokens successfully!`);
    setIsStakingPopupOpen(false);
    setIsResultPopupOpen(true);
  };

  const getSelectedNodes = async () => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // getRandomNodes 함수 호출
      await contract.getRandomNodes();

      const randomNodes = [];
      for (let i = 0; i < 3; i++) {
        const node = await contract.randomNodes(i);
        randomNodes.push(node);
      }

      const nodes = randomNodes;

      setSelectedNodes(nodes);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    }
  };

  useEffect(() => {
    const checkUserAddress = async () => {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        // 현재 지갑 주소 가져오기
        const userAddress = await signer.getAddress();

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const nodeAddresses = await contract.getNodeAddresses();

        setAddressList(nodeAddresses);

        const randomNodes = [];
        for (let i = 0; i < 3; i++) {
          const node = await contract.randomNodes(i);
          randomNodes.push(node);
        }

        const nodes = randomNodes;

        setSelectedNodes(nodes);

        // 노드 배열 중 하나라도 현재 지갑 주소와 일치하면 팝업 표시
        if (nodes.includes(userAddress)) {
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error checking user address:", error);
      }
    };

    checkUserAddress();
  }, []); // Adding selectedNodes as a dependency to re-run when it changes

  return (
    <ThirdwebProvider>
      <ConnectButton
        client={client}
        wallets={wallets}
        theme={"dark"}
        connectModal={{ size: "wide" }}
      />

      <div
        style={{
          position: "relative",
          display: "inline-block",
          margin: "20px",
        }}
      >
        <button onClick={getSelectedNodes}>Selected Nodes</button>
        {/* 버튼 아래에 선택된 노드를 툴팁처럼 표시 */}
        {selectedNodes.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "0",
              backgroundColor: "#333",
              color: "#fff",
              padding: "5px",
              borderRadius: "5px",
              whiteSpace: "nowrap",
              zIndex: 100,
            }}
          >
            Selected Nodes: {selectedNodes.join(", ")}
          </div>
        )}
      </div>

      <Router>
        <div>
          <Routes>
            <Route path="/list" element={<GraphList graph={sampleGraph} />} />
            <Route path="/" element={<GraphPage graph={sampleGraph} />} />
            <Route path="/scroll" element={<L2 nodeAddrsses={addressList} />} />
          </Routes>
        </div>
      </Router>

      {showPopup && (
        <StakingPopup
          onStake={handleStake}
          onClose={() => setIsStakingPopupOpen(false)}
        />
      )}
    </ThirdwebProvider>
  );
};

export default App;
