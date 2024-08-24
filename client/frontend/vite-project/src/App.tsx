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
import "./App.css";


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
<div
        className="header"
        style={{
          backgroundColor: "rgba(45, 45, 45, 1)",
          display: "flex",
          width: "100%",
          gap: "10px",
          fontWeight: 700,
          fontSize: "18px",
          fontFamily: "Pretendard, sans-serif",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: "0px 20px", // Reduced padding to half
        }}
      >      <div className="title" style={{ margin: "15px",
        color: "white",
      }}>
        Anti Collusion Reputation System
      </div>
      <ConnectButton
        client={client}
        wallets={wallets}
        theme={"dark"}
        connectModal={{ size: "wide" }}
      />
      </div>

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
        left: "110%",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        whiteSpace: "nowrap",
        zIndex: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center", // Ensures nodes are aligned in the middle
        gap: "10px", // Adds space between each node
      }}
        >

        <div></div>
        {selectedNodes.map((node, index) => (
          <div key={index} style={{ marginTop: "5px" }}>
            {node}
          </div>
        ))}
      </div>
    )}
    </div>

      <Router>
        <div>
          <Routes>
            <Route path="/list" element={<GraphList graph={sampleGraph} />} />
            <Route path="/" element={<GraphPage graph={sampleGraph} />} />
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