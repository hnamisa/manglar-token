require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const LACNET_RPC_URL = process.env.LACNET_RPC_URL || "http://35.193.217.67";
const LACNET_CHAIN_ID = Number(process.env.LACNET_CHAIN_ID || 648529);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    lacnet: {
      url: LACNET_RPC_URL,
      chainId: LACNET_CHAIN_ID,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: 0
    }
  }
};
