// npx hardhat run --network sepolia scripts/deployERC721.ts 
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log('Deployer: ', deployer.address)
const erc721Factory = await ethers.getContractFactory('TestToken');
const deployNFT = await erc721Factory.deploy(
    deployer.address
);
await deployNFT.deployed();

console.log(`Contract deployed to ${ deployNFT.address}`);

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });