//npx hardhat run --network sepolia scripts/addItems.ts 
import {ethers} from 'hardhat'

async function currentTimestamp(): Promise<number> {
  const bn = await ethers.provider.getBlockNumber()
  const b = await ethers.provider.getBlock(bn)
  return b.timestamp
}
async function main() {

  const amount = '1'
  const nftIdTobeListed = 1
  const currentTs = await currentTimestamp();
  const nftOwnerAddress = process.env.NFT_OWNER || ''
  let duration = 1 
  const escrowContractAddress = process.env.ESCROW_CONTRACT || ''
  const nftTokenAddress = process.env.ERC721_TOKEN || ''
  const nftFactory = await ethers.getContractFactory('TestToken')
  const nft = nftFactory.attach(nftTokenAddress)
  const escrowFactory = await ethers.getContractFactory('Escrow')
  const Escrow = escrowFactory.attach(escrowContractAddress)

  //Approving tokens before depositing
  console.log(`Apprpoving`)
  const isApproved = await nft.setApprovalForAll(escrowContractAddress,true )
  await isApproved.wait()
  if(isApproved){
    console.log('Is approved. Depositing ...')
   const tx = await Escrow.deposit(nftOwnerAddress, nftIdTobeListed, 1 )
   await tx.wait()

  }
 
}
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })