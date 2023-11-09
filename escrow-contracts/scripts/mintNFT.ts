// npx hardhat run --network sepolia scripts/mintNFT.ts
import {ethers} from 'hardhat'

async function main() {

const nftTokenAddress = process.env.ERC721_TOKEN || ''
const nftOwnerAddress = process.env.NFT_OWNER || ''
const factory = await ethers.getContractFactory('TestToken')
const nftContract = factory.attach(nftTokenAddress)
   nftContract.safeMint(nftOwnerAddress, 1);
}
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })