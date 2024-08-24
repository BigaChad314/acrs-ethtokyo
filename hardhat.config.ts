import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
        process.env.PRIVATE_KEY_4!,
        process.env.PRIVATE_KEY_5!,
        process.env.PRIVATE_KEY_6!,
        process.env.PRIVATE_KEY_7!,
        process.env.PRIVATE_KEY_8!,
        process.env.PRIVATE_KEY_9!,
        process.env.PRIVATE_KEY_10!,
        process.env.PRIVATE_KEY_11!,
        process.env.PRIVATE_KEY_12!,
        process.env.PRIVATE_KEY_13!,
        process.env.PRIVATE_KEY_14!,
        process.env.PRIVATE_KEY_15!,
      ],
    },
    linea: {
      chainId: 59141,
      url: process.env.LINEA_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
        process.env.PRIVATE_KEY_4!,
        process.env.PRIVATE_KEY_5!,
        process.env.PRIVATE_KEY_6!,
        process.env.PRIVATE_KEY_7!,
        process.env.PRIVATE_KEY_8!,
        process.env.PRIVATE_KEY_9!,
        process.env.PRIVATE_KEY_10!,
        process.env.PRIVATE_KEY_11!,
        process.env.PRIVATE_KEY_12!,
        process.env.PRIVATE_KEY_13!,
        process.env.PRIVATE_KEY_14!,
        process.env.PRIVATE_KEY_15!,
      ],
    },
    nero: {
      chainId: 6660001,
      url: process.env.NERO_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
        process.env.PRIVATE_KEY_4!,
        process.env.PRIVATE_KEY_5!,
        process.env.PRIVATE_KEY_6!,
        process.env.PRIVATE_KEY_7!,
        process.env.PRIVATE_KEY_8!,
        process.env.PRIVATE_KEY_9!,
        process.env.PRIVATE_KEY_10!,
        process.env.PRIVATE_KEY_11!,
        process.env.PRIVATE_KEY_12!,
        process.env.PRIVATE_KEY_13!,
        process.env.PRIVATE_KEY_14!,
        process.env.PRIVATE_KEY_15!,
      ],
    },
  },
};

export default config;
