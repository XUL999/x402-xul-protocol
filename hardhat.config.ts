import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

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
      url: process.env.XUL_RPC_URL || "https://rpc.xul.chain",
      chainId: parseInt(process.env.XUL_CHAIN_ID || "1"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    // XUL Chain Testnet (if available)
    "xul-testnet": {
      url: process.env.XUL_TESTNET_RPC_URL || "https://testnet-rpc.xul.chain",
      chainId: parseInt(process.env.XUL_TESTNET_CHAIN_ID || "2"),
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
        chainId: parseInt(process.env.XUL_CHAIN_ID || "1"),
        urls: {
          apiURL: "https://scan.rswl.ai/api",
          browserURL: "https://scan.rswl.ai"
        }
      }
    },
    customChains: [
      {
        network: "xul-mainnet",
        chainId: parseInt(process.env.XUL_CHAIN_ID || "1"),
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
