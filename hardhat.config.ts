import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // XUL Chain Mainnet
    "xul-mainnet": {
      url: process.env.XUL_RPC_URL || "https://pro.rswl.ai",
      chainId: parseInt(process.env.XUL_CHAIN_ID || "12309"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    // XUL Chain Testnet (if available)
    "xul-testnet": {
      url: process.env.XUL_TESTNET_RPC_URL || "https://testnet.pro.rswl.ai",
      chainId: parseInt(process.env.XUL_TESTNET_CHAIN_ID || "12310"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      // Custom network for XUL Chain
      customChain: {
        network: "xul-mainnet",
        chainId: parseInt(process.env.XUL_CHAIN_ID || "12309"),
        urls: {
          apiURL: "https://scan.rswl.ai/api",
          browserURL: "https://scan.rswl.ai"
        }
      }
    },
    customChains: [
      {
        network: "xul-mainnet",
        chainId: parseInt(process.env.XUL_CHAIN_ID || "12309"),
        urls: {
          apiURL: "https://scan.rswl.ai/api",
          browserURL: "https://scan.rswl.ai"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;
