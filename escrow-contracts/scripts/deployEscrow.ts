// npx hardhat run --network sepolia scripts/deployEscrow.ts
import { ethers } from "hardhat";

async function main() {

  const openGsnForwarderAddress = process.env.TRUSTED_FORWARDER || ''
  const USDC_Address = process.env.USDC_ADDRESS || ''
  const NFT_Address = process.env.ERC721_TOKEN || ''
  const amount = ethers.BigNumber.from(1)
  const escrowFactory = await ethers.getContractFactory('Escrow');
  const escrow = await escrowFactory.deploy(
    NFT_Address,
    USDC_Address,
    amount,
    openGsnForwarderAddress
  )
  await escrow.deployed();
  console.log(`Contract deployed to ${escrow.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
