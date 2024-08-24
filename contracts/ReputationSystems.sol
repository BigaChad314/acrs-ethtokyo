// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ReputationSystem {
    struct Score {
        address from;
        uint score;
    }

    struct Node {
        address id;
        uint reputation;
        uint importance;
        Score[] givenScores;
    }

    struct Edge {
        address node1;
        address node2;
    }

    mapping(address => uint) public reputationScore;
    mapping(address => Node) public nodes;
    mapping(address => uint256) public bonds;
    address[] public nodeAddresses;
    address[3] public randomNodes;
    Edge[] public edges;

    event ScoreGiven(address indexed from, address indexed to, uint score);
    event ReputationUpdated(address indexed nodeAddress, uint reputation);
    event ImportanceUpdated(address indexed nodeAddress, uint importance);
    event EdgeAdded(address indexed node1, address indexed node2);
    event BondDeposited(address indexed depositor, uint256 amount);
    event ImportanceVerified(bool success);

    receive() external payable {
        // 입금된 ETH는 특별한 동작 없이 계약에 보관됨
    }

    function giveScore(address to, uint score) public {
        require(score > 0, "Score must be positive");

        nodes[to].givenScores.push(Score(msg.sender, score));

        if (nodes[to].id == address(0)) {
            nodes[to].id = to;

            bool exists = false;
            for (uint i = 0; i < nodeAddresses.length; i++) {
                if (nodeAddresses[i] == to) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                nodeAddresses.push(to);
            }
        }

        addEdge(msg.sender, to);

        emit ScoreGiven(msg.sender, to, score);
    }

    function addEdge(address node1, address node2) internal {
        edges.push(Edge(node1, node2));
        emit EdgeAdded(node1, node2);
    }

    function updateImportanceForAll(address[] memory sortedNodeAddresses, uint[] memory importances) internal {
        require(sortedNodeAddresses.length == importances.length, "Node addresses and importances array lengths must match.");
        
        for (uint i = 0; i < sortedNodeAddresses.length; i++) {
            nodes[sortedNodeAddresses[i]].importance = importances[i];
            emit ImportanceUpdated(sortedNodeAddresses[i], importances[i]);
        }
    }

    function updateReputation(address nodeAddress) internal {
        Node storage node = nodes[nodeAddress];
        uint totalReputation = 0;
        uint count = node.givenScores.length;

        for (uint i = 0; i < count; i++) {
            Score memory score = node.givenScores[i];
            Node storage fromNode = nodes[score.from];
            totalReputation += fromNode.importance * score.score;
        }

        if (count > 0) {
            node.reputation = totalReputation / count;
            reputationScore[nodeAddress] = totalReputation / count;
        }

        emit ReputationUpdated(nodeAddress, node.reputation);
    }

    function updateReputationForAll(address[] memory sortedNodeAddresses) internal {
        for (uint i = 0; i < sortedNodeAddresses.length; i++) {
            updateReputation(sortedNodeAddresses[i]);
        }
    }

    function getEdges() public view returns (Edge[] memory) {
        return edges;
    }

    function getNodeData(address nodeAddress) public view returns (uint reputation, uint totalGivenScores) {
        Node storage node = nodes[nodeAddress];
        return (node.reputation, node.givenScores.length);
    }

    function getGivenScores(address nodeAddress) public view returns (Score[] memory) {
        return nodes[nodeAddress].givenScores;
    }

    function getNodeAddressesLength() public view returns (uint) {
        return nodeAddresses.length;
    }

    function getNodeAddresses() public view returns (address[] memory) {
        return nodeAddresses;
    }

    function getRandomNodes() public returns (address[3] memory) {
        require(nodeAddresses.length >= 3, "Not enough nodes to select 3 random nodes");

        address[] memory availableNodes = new address[](nodeAddresses.length);
        for (uint i = 0; i < nodeAddresses.length; i++) {
            availableNodes[i] = nodeAddresses[i];
        }

        for (uint i = 0; i < 3; i++) {
            uint randomIndex = uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, i, msg.sender))) % availableNodes.length;
            randomNodes[i] = availableNodes[randomIndex];

            availableNodes[randomIndex] = availableNodes[availableNodes.length - 1]; // 랜덤 인덱스를 맨 마지막 원소로 덮어 씌움
            assembly {
                mstore(availableNodes, sub(mload(availableNodes), 1)) // 마지막 원소 제거
            }
        }

    return randomNodes;
}

    function deposit() public payable {
        require(isRandomNode(msg.sender), "Only selected random nodes can deposit.");
        bonds[msg.sender] += msg.value;
        emit BondDeposited(msg.sender, msg.value);
    }

    function isRandomNode(address user) internal view returns (bool) {
        for (uint i = 0; i < randomNodes.length; i++) {
            if (randomNodes[i] == user) {
                return true;
            }
        }
        return false;
    }

    function verifyImportance(address[] memory sortedNodeAddresses, uint[][] memory importances) public {
        require(importances.length == 3, "Must provide exactly 3 sets of importance values.");
        require(importances[0].length == sortedNodeAddresses.length, "Each set of importances must match the number of nodes.");
        
        // Merkle Root 해시 계산
        bytes32[3] memory merkleRoots;
        for (uint i = 0; i < 3; i++) {
            merkleRoots[i] = calculateMerkleRoot(importances[i]);
        }

        // 모든 Merkle Root가 동일한지 확인
        if (merkleRoots[0] == merkleRoots[1] && merkleRoots[1] == merkleRoots[2]) {
            updateImportanceForAll(sortedNodeAddresses, importances[0]);
            updateReputationForAll(sortedNodeAddresses);
            
            // 1.5배 보상 지급
            for (uint i = 0; i < randomNodes.length; i++) {
                uint reward = bonds[randomNodes[i]] * 3 / 2;
                payable(randomNodes[i]).transfer(reward);
                bonds[randomNodes[i]] = 0; // 초기화
            }
            emit ImportanceVerified(true);
        } else {
            // 보상 몰수
            for (uint i = 0; i < randomNodes.length; i++) {
                bonds[randomNodes[i]] = 0; // bond 초기화
            }
            emit ImportanceVerified(false);
        }
    }

    function calculateMerkleRoot(uint[] memory importances) internal pure returns (bytes32) {
        require(importances.length > 0, "Importance array cannot be empty.");

        // 간단한 Merkle Tree 구현을 위해 짝수 개수를 맞춤
        if (importances.length % 2 != 0) {
            importances[importances.length - 1] = importances[importances.length - 2];
        }

        // Merkle Tree 해시 계산
        bytes32[] memory hashes = new bytes32[](importances.length);
        for (uint i = 0; i < importances.length; i++) {
            hashes[i] = keccak256(abi.encodePacked(importances[i]));
        }

        while (hashes.length > 1) {
            uint newLength = (hashes.length + 1) / 2;
            bytes32[] memory newHashes = new bytes32[](newLength);

            for (uint i = 0; i < newLength; i++) {
                if (i * 2 + 1 < hashes.length) {
                    newHashes[i] = keccak256(abi.encodePacked(hashes[i * 2], hashes[i * 2 + 1]));
                } else {
                    newHashes[i] = hashes[i * 2];
                }
            }

            hashes = newHashes;
        }

        return hashes[0]; // Merkle Root 반환
    }
}
