# ACRS (Anti-Collusion Reputation System)
ACRS is a reputation logic that prevents collusion, enabling transparency and integrity of governance and incentivization. We use the [Girvan-Newman Algorithm](https://en.wikipedia.org/wiki/Girvan%E2%80%93Newman_algorithm) to compute shortest-path betweenness centrality for nodes, which in turn detects the collusion among the nodes.


## Main Track
#### Robust Democracy. <br/>
Identity is not a given in Web3 due to a decentralized nature of blockchain that preserves privacy and anonymity. Therefore, within the context of Web3, on-chain reputation acts as a mechanism to detect one’s credibility and accountability. For instance, on-chain reputation allows to check the legitimacy of a certain party, classify and incentivize contribution, foster governance and delegation, and prevent spam and sybil attacks.

The main problem we solve is collusion, which hinders the value of on-chain reputation. Collusion could create disproportionate and centralized influence that could incur undeserved authority, underserved provision of incentives, monopolization of public fund, and absence of censorship resistance.


# Sponsor Track

## Deploy on Scroll 
https://l1sload-blockscout.scroll.io/address/0xb8490f653dABC40DE7C0d7Dd57d2CD1511D89Bd0

## Best Build using L1SLOAD Precompile
We have tried verifying on Blockscout but failed


## NERO Prize
https://testnetscan.nerochain.io/address/0x41eaD2645E54fA9D3bF925AAbb60dD3DE7dE0653


## Metamask/Linea Prize
https://sepolia.lineascan.build/address/0x4a0129aa3b0b6372ca9cd99fddae8bf27dab5754#code

## ENS Prize
at branch frontwithENS

-------------


# How to set up the project

### Frontend
cd client/frontend/vite-project
npm i
npm run dev

### Backend
cd client/server
pip install
python3 server.py

### Deploy hardhat 
npx hardhat test --network <network>




