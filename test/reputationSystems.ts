import { ethers } from "hardhat";
import { expect } from "chai";
import axios from "axios";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ReputationSystem } from "../typechain-types";
import { BigNumberish } from "ethers";

describe("ReputationSystem", function () {
  let reputationSystem: ReputationSystem;
  let owner: SignerWithAddress;
  let nodes: SignerWithAddress[];

  beforeEach(async function () {
    this.timeout(60000);
    const ReputationSystemFactory = await ethers.getContractFactory(
      "ReputationSystem"
    );
    [owner, ...nodes] = await ethers.getSigners();

    reputationSystem =
      (await ReputationSystemFactory.deploy()) as ReputationSystem;
    await reputationSystem.waitForDeployment();

    console.log("address: ", await reputationSystem.getAddress());

    // 노드 간의 점수 설정
    // 커뮤니티 1
    await reputationSystem.connect(nodes[0]).giveScore(nodes[1].address, 3);
    await reputationSystem.connect(nodes[1]).giveScore(nodes[2].address, 5);
    await reputationSystem.connect(nodes[2]).giveScore(nodes[3].address, 4);
    await reputationSystem.connect(nodes[3]).giveScore(nodes[0].address, 6);
    await reputationSystem.connect(nodes[0]).giveScore(nodes[4].address, 7);
    await reputationSystem.connect(nodes[4]).giveScore(nodes[2].address, 2);

    // 커뮤니티 2
    await reputationSystem.connect(nodes[5]).giveScore(nodes[6].address, 8);
    await reputationSystem.connect(nodes[6]).giveScore(nodes[7].address, 5);
    await reputationSystem.connect(nodes[7]).giveScore(nodes[8].address, 3);
    await reputationSystem.connect(nodes[8]).giveScore(nodes[5].address, 4);
    await reputationSystem.connect(nodes[6]).giveScore(nodes[9].address, 6);

    // 커뮤니티 3
    await reputationSystem.connect(nodes[10]).giveScore(nodes[11].address, 2);
    await reputationSystem.connect(nodes[11]).giveScore(nodes[12].address, 7);
    await reputationSystem.connect(nodes[12]).giveScore(nodes[13].address, 5);
    await reputationSystem.connect(nodes[13]).giveScore(nodes[14].address, 3);
    await reputationSystem.connect(nodes[14]).giveScore(nodes[10].address, 4);

    // 커뮤니티 간 연결
    await reputationSystem.connect(nodes[3]).giveScore(nodes[6].address, 5);
    await reputationSystem.connect(nodes[7]).giveScore(nodes[10].address, 6);
    await reputationSystem.connect(nodes[12]).giveScore(nodes[1].address, 3);
    await reputationSystem.connect(nodes[9]).giveScore(nodes[13].address, 4);

    // 기타 연결
    await reputationSystem.connect(nodes[4]).giveScore(nodes[9].address, 6);
    await reputationSystem.connect(nodes[8]).giveScore(nodes[0].address, 5);
  });

  // Helper function to fetch randomNodes from the contract after getRandomNodes has been called
  async function getRandomNodesFromContract(
    reputationSystem: ReputationSystem
  ) {
    const randomNodes = [];
    for (let i = 0; i < 3; i++) {
      const node = await reputationSystem.randomNodes(i);
      randomNodes.push(node);
    }
    return randomNodes;
  }

  it("Should receive funds, select random nodes, deposit, fetch importance, verify importance, and compare reputations", async function () {
    this.timeout(60000);
    // Step 1: Contract receives funds
    await owner.sendTransaction({
      to: reputationSystem.getAddress(),
      value: ethers.parseEther("0.005"),
    });
    const initialContractBalance = await ethers.provider.getBalance(
      reputationSystem.getAddress()
    );
    expect(initialContractBalance).to.equal(ethers.parseEther("0.005"));
    // Step 2: Select random nodes
    await reputationSystem.connect(owner).getRandomNodes();
    const randomNodes = await getRandomNodesFromContract(reputationSystem);
    expect(randomNodes.length).to.equal(3);
    // Step 3: Deposit by selected random nodes
    for (const node of randomNodes) {
      await reputationSystem
        .connect(nodes.find((n) => n.address === node)!)
        .deposit({ value: ethers.parseEther("0.0001") });
    }
    // Check that deposits were successful
    for (const node of randomNodes) {
      const bond = await reputationSystem.bonds(node);
      expect(bond).to.equal(ethers.parseEther("0.0001"));
    }
    // Step 4: Fetch importance and reputation from server
    const graphData = {
      edges: [
        // Community 1
        [nodes[0].address, nodes[1].address, 3],
        [nodes[1].address, nodes[2].address, 5],
        [nodes[2].address, nodes[3].address, 4],
        [nodes[3].address, nodes[0].address, 6],
        [nodes[0].address, nodes[4].address, 7],
        [nodes[4].address, nodes[2].address, 2],
        // Community 2
        [nodes[5].address, nodes[6].address, 8],
        [nodes[6].address, nodes[7].address, 5],
        [nodes[7].address, nodes[8].address, 3],
        [nodes[8].address, nodes[5].address, 4],
        [nodes[6].address, nodes[9].address, 6],
        // Community 3
        [nodes[10].address, nodes[11].address, 2],
        [nodes[11].address, nodes[12].address, 7],
        [nodes[12].address, nodes[13].address, 5],
        [nodes[13].address, nodes[14].address, 3],
        [nodes[14].address, nodes[10].address, 4],
        // Inter-community connections
        [nodes[3].address, nodes[6].address, 5],
        [nodes[7].address, nodes[10].address, 6],
        [nodes[12].address, nodes[1].address, 3],
        [nodes[9].address, nodes[13].address, 4],
        // Additional connections
        [nodes[4].address, nodes[9].address, 6],
        [nodes[8].address, nodes[0].address, 5],
      ],
    };
    const response = await axios.post(
      "http://localhost:5001/calculate",
      graphData
    );
    const { importance, reputation } = response.data;
    const [sortedNodeAddresses, sortedImportances] = Object.entries(
      importance
    ).reduce(
      ([addresses, importances], [address, importanceValue]) => {
        addresses.push(ethers.getAddress(address)); // Convert to checksum address
        importances.push(BigInt(Math.round(Number(importanceValue) * 1e18)));
        return [addresses, importances];
      },
      [[], []] as [string[], BigNumberish[]]
    );
    const importanceMatrix: BigNumberish[][] = randomNodes.map(
      () =>
        sortedNodeAddresses
          .map((nodeAddress) => {
            const nodeImportance = importance[nodeAddress.toLowerCase()];
            if (nodeImportance === undefined) {
              return null; // Undefined일 경우 null 반환
            }
            return BigInt(Math.round(Number(nodeImportance) * 1e18));
          })
          .filter((value) => value !== null) // Null 값을 필터링
    );
    // Step 5: Verify importance and update reputations
    // Check balances before verification
    const initialBalances = await Promise.all(
      randomNodes.map((node) => ethers.provider.getBalance(node))
    );
    const tx = await reputationSystem
      .connect(owner)
      .verifyImportance(sortedNodeAddresses, importanceMatrix);
    await expect(tx)
      .to.emit(reputationSystem, "ImportanceVerified")
      .withArgs(true);
    // Step 6: Check that each selected node received 1.5x bond amount
    for (let i = 0; i < randomNodes.length; i++) {
      const finalBalance = await ethers.provider.getBalance(randomNodes[i]);
      const expectedBalance = initialBalances[i] + ethers.parseEther("1.5");
      expect(finalBalance).to.be.closeTo(
        expectedBalance,
        ethers.parseEther("0.01")
      ); // 0.01 ETH 범위 내에서 확인
    }
    // Step 7: Compare smart contract reputation with server reputation
    for (const [nodeAddress, nodeReputation] of Object.entries(reputation)) {
      const nodeData = await reputationSystem.getNodeData(
        ethers.getAddress(nodeAddress)
      );
      expect(nodeData[0]).to.be.closeTo(
        BigInt(Math.round(Number(nodeReputation) * 1e18)),
        BigInt(1e10)
      );
    }
  });
  // it("Should not reward nodes if one importance set does not match", async function () {
  //   // Step 1: Contract receives funds
  //   await owner.sendTransaction({
  //     to: reputationSystem.getAddress(),
  //     value: ethers.parseEther("10"),
  //   });
  //   const initialContractBalance = await ethers.provider.getBalance(
  //     reputationSystem.getAddress()
  //   );
  //   expect(initialContractBalance).to.equal(ethers.parseEther("10"));
  //   // Step 2: Select random nodes
  //   await reputationSystem.connect(owner).getRandomNodes();
  //   const randomNodes = await getRandomNodesFromContract(reputationSystem);
  //   expect(randomNodes.length).to.equal(3);
  //   // Step 3: Deposit by selected random nodes
  //   for (const node of randomNodes) {
  //     await reputationSystem
  //       .connect(nodes.find((n) => n.address === node)!)
  //       .deposit({ value: ethers.parseEther("1") });
  //   }
  //   // Check that deposits were successful
  //   for (const node of randomNodes) {
  //     const bond = await reputationSystem.bonds(node);
  //     expect(bond).to.equal(ethers.parseEther("1"));
  //   }
  //   // Step 4: Fetch importance and reputation from server
  //   const graphData = {
  //     edges: [
  //       // Community 1
  //       [nodes[0].address, nodes[1].address, 3],
  //       [nodes[1].address, nodes[2].address, 5],
  //       [nodes[2].address, nodes[3].address, 4],
  //       [nodes[3].address, nodes[0].address, 6],
  //       [nodes[0].address, nodes[4].address, 7],
  //       [nodes[4].address, nodes[2].address, 2],
  //       // Community 2
  //       [nodes[5].address, nodes[6].address, 8],
  //       [nodes[6].address, nodes[7].address, 5],
  //       [nodes[7].address, nodes[8].address, 3],
  //       [nodes[8].address, nodes[5].address, 4],
  //       [nodes[6].address, nodes[9].address, 6],
  //       // Community 3
  //       [nodes[10].address, nodes[11].address, 2],
  //       [nodes[11].address, nodes[12].address, 7],
  //       [nodes[12].address, nodes[13].address, 5],
  //       [nodes[13].address, nodes[14].address, 3],
  //       [nodes[14].address, nodes[10].address, 4],
  //       // Inter-community connections
  //       [nodes[3].address, nodes[6].address, 5],
  //       [nodes[7].address, nodes[10].address, 6],
  //       [nodes[12].address, nodes[1].address, 3],
  //       [nodes[9].address, nodes[13].address, 4],
  //       // Additional connections
  //       [nodes[4].address, nodes[9].address, 6],
  //       [nodes[8].address, nodes[0].address, 5],
  //     ],
  //   };
  //   const response = await axios.post(
  //     "http://localhost:5001/calculate",
  //     graphData
  //   );
  //   const { importance } = response.data;
  //   const [sortedNodeAddresses, sortedImportances] = Object.entries(
  //     importance
  //   ).reduce(
  //     ([addresses, importances], [address, importanceValue]) => {
  //       addresses.push(ethers.getAddress(address)); // Convert to checksum address
  //       importances.push(BigInt(Math.round(Number(importanceValue) * 1e18)));
  //       return [addresses, importances];
  //     },
  //     [[], []] as [string[], BigNumberish[]]
  //   );
  //   // Step 5: Modify one importance value to simulate mismatch
  //   const importanceMatrix: BigNumberish[][] = randomNodes.map(() => [
  //     ...sortedImportances,
  //   ]);
  //   // Simulate a mismatch in the second node's importance array
  //   importanceMatrix[1][0] =
  //     ethers.toBigInt(importanceMatrix[1][0]) + 1n * 10n ** 18n; // Slightly modify the first importance value
  //   // Check balances before verification
  //   const initialBalances = await Promise.all(
  //     randomNodes.map((node) => ethers.provider.getBalance(node))
  //   );
  //   // Step 6: Verify importance and check that no rewards are given
  //   const tx = await reputationSystem
  //     .connect(owner)
  //     .verifyImportance(sortedNodeAddresses, importanceMatrix);
  //   await expect(tx)
  //     .to.emit(reputationSystem, "ImportanceVerified")
  //     .withArgs(false); // Expect the verification to fail
  //   // Step 7: Check that balances remain the same (no rewards given)
  //   for (let i = 0; i < randomNodes.length; i++) {
  //     const finalBalance = await ethers.provider.getBalance(randomNodes[i]);
  //     expect(finalBalance).to.be.closeTo(
  //       initialBalances[i],
  //       ethers.parseEther("0.01")
  //     ); // No reward should be added
  //   }
  // });
  // it("Should update reputation when a new connection is added", async function () {
  //   // Step 1: Add a new connection between nodes[0] and nodes[10]
  //   await reputationSystem.connect(nodes[0]).giveScore(nodes[10].address, 8);
  //   // Step 2: Manually calculate expected reputation for nodes[10]
  //   // Before the connection, nodes[10] should have its initial reputation.
  //   // After the connection, nodes[10]'s reputation should be influenced by nodes[0]'s importance and the score (8).
  //   // Fetch the current reputation of nodes[10] before update
  //   const { reputation: oldReputation } = await reputationSystem.getNodeData(
  //     nodes[10].address
  //   );
  //   // Step 3: Fetch importance and reputation from server to simulate the update
  //   const graphData = {
  //     edges: [
  //       // Community 1
  //       [nodes[0].address, nodes[1].address, 3],
  //       [nodes[1].address, nodes[2].address, 5],
  //       [nodes[2].address, nodes[3].address, 4],
  //       [nodes[3].address, nodes[0].address, 6],
  //       [nodes[0].address, nodes[4].address, 7],
  //       [nodes[4].address, nodes[2].address, 2],
  //       // Community 2
  //       [nodes[5].address, nodes[6].address, 8],
  //       [nodes[6].address, nodes[7].address, 5],
  //       [nodes[7].address, nodes[8].address, 3],
  //       [nodes[8].address, nodes[5].address, 4],
  //       [nodes[6].address, nodes[9].address, 6],
  //       // Community 3
  //       [nodes[10].address, nodes[11].address, 2],
  //       [nodes[11].address, nodes[12].address, 7],
  //       [nodes[12].address, nodes[13].address, 5],
  //       [nodes[13].address, nodes[14].address, 3],
  //       [nodes[14].address, nodes[10].address, 4],
  //       // Inter-community connections
  //       [nodes[3].address, nodes[6].address, 5],
  //       [nodes[7].address, nodes[10].address, 6],
  //       [nodes[12].address, nodes[1].address, 3],
  //       [nodes[9].address, nodes[13].address, 4],
  //       // Additional connections
  //       [nodes[4].address, nodes[9].address, 6],
  //       [nodes[8].address, nodes[0].address, 5],
  //       // New connection added
  //       [nodes[0].address, nodes[10].address, 8],
  //     ],
  //   };
  //   const response = await axios.post(
  //     "http://localhost:5001/calculate",
  //     graphData
  //   );
  //   const { importance, reputation } = response.data;
  //   const [sortedNodeAddresses, sortedImportances] = Object.entries(
  //     importance
  //   ).reduce(
  //     ([addresses, importances], [address, importanceValue]) => {
  //       addresses.push(ethers.getAddress(address)); // Convert to checksum address
  //       importances.push(BigInt(Math.round(Number(importanceValue) * 1e18)));
  //       return [addresses, importances];
  //     },
  //     [[], []] as [string[], BigNumberish[]]
  //   );
  //   await reputationSystem.connect(owner).getRandomNodes();
  //   const randomNodes = await getRandomNodesFromContract(reputationSystem);
  //   const importanceMatrix: BigNumberish[][] = randomNodes.map(() => [
  //     ...sortedImportances,
  //   ]);
  //   // Step 4: Verify importance and update reputations
  //   await reputationSystem
  //     .connect(owner)
  //     .verifyImportance(sortedNodeAddresses, importanceMatrix);
  //   // Fetch the new reputation of nodes[10] after update
  //   const { reputation: newReputationAfterUpdate } =
  //     await reputationSystem.getNodeData(nodes[10].address);
  //   // Step 5: Check that the reputation has been updated correctly
  //   expect(newReputationAfterUpdate).to.be.gt(oldReputation);
  // });
});
