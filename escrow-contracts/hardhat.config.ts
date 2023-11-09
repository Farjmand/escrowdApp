import { HardhatUserConfig} from "hardhat/config"
import * as dotenv from 'dotenv'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
dotenv.config()
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  networks: {
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_URL || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_URL || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_KEY || ''
    }
  }
  
};

export default config;
