const express = require('express');
const Web3 = require('web3');
const app = express();
const { RelayProvider } = require('@openzeppelin/gsn-helpers');



const web3 = new Web3(gsnProvider);
const privateKey = process.env.PRIVATE_KEY || ''
const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
const owner = process.env.NFT_OWNER || ''
const contractAddress = process.env.ESCROW_CONTRACT || '';
const contractAbi = require('./abi/escrow_abi.json');


const contract = new web3.eth.Contract(contractAbi, contractAddress);

app.use(express.json());

const gsnProvider = new RelayProvider(provider, {
  forwarderAddress: process.env.FORWARDER_ADDRESS || '' , // Address of the GSN Forwarder contract
  paymasterAddress: process.env.PAYMASTER_ADDRESS || '', // Address of GSN Paymaster contract
});
// Define routes for listing and purchasing tokens
    app.post('/list-token', async (req, res) => {
        const tokenId = req.body.tokenId;
        const price = req.body.price; // in Wei
      
        const data = contract.methods.deposit(owner, tokenId, price).encodeABI();
      
        const nonce = await web3.eth.getTransactionCount(wallet.address, 'pending');
        const gasPrice = await web3.eth.getGasPrice();
      
        const rawTransaction = {
          nonce,
          from: wallet.address,
          to: contractAddress,
          gasPrice,
          data,
        };
      
        const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, wallet.privateKey);
        const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
        res.json({ txHash });
      });

app.post('/purchase-token', async (req, res) => {
  const tokenId = req.body.tokenId;
  const sellerAddress = req.body.sellerAddress;
  const buyerAddress = wallet.address;
  const tx = await contract.populateTransaction.transferFrom(sellerAddress, buyerAddress, tokenId);
  const { messageHash } = await web3.eth.sendTransaction(tx);

  res.json({ messageHash });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
