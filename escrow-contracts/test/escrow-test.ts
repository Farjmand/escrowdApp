import {expect} from 'chai'
import {ethers, network} from 'hardhat'
import {BigNumber, ContractTransaction} from 'ethers'
import {Escrow, TestToken, ERC20TestToken__factory ,TestToken__factory, Escrow__factory, ERC20TestToken} from '../typechain'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'

describe("Escrow", function () {
    let Escrow: Escrow;
    let escrow__fact:Escrow__factory ;
    let nft__Fact: TestToken__factory;
    let ERC721Token: TestToken;
    let erc20__Fact: ERC20TestToken__factory;
    let ERC20Token: ERC20TestToken;
    let owner:SignerWithAddress;
    let addr1:SignerWithAddress;
    let addr2:SignerWithAddress;
    let addr3:SignerWithAddress;
    let addrs;
    const fee = 1;
    const tokenSupply = 10000000000000;
    const trustedForwarder = '0x0000000000000000000000000000000000000001'

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
      [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        escrow__fact = await ethers.getContractFactory("Escrow");
    
        //Deploying fake USDC 
        erc20__Fact = await ethers.getContractFactory("ERC20TestToken");
        ERC20Token = await erc20__Fact.deploy();
       //Deploying NFT contract
        nft__Fact =  await ethers.getContractFactory('TestToken');
        ERC721Token = await nft__Fact.deploy(owner.address);
        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.
        
       
        Escrow = await escrow__fact.deploy(ERC721Token.address, ERC20Token.address, fee, trustedForwarder);
    
        const approveTx = await ERC20Token.connect(owner).approve(owner.address, tokenSupply);
        // wait until the transaction is mined
        await approveTx.wait();
      });

      describe("Deployment", function () {
        it("Should set the right owner", async function () {
          expect(await Escrow.owner()).to.equal(owner.address);
        });
    
        it("Should set the right fee to 1", async function () {
            expect(await Escrow.fee()).to.equal(fee);
          });
      });

      describe("Fee collection", function () {
        it("Should allow only owner to collect fees", async function () {
            let addr1Balance = 5;
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply);
            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(0);

            const approveFeeTokenTx = await ERC20Token.connect(owner).approve(addr1.address, addr1Balance);
            await approveFeeTokenTx.wait();

            const transferFeeTokenTx = await ERC20Token.transferFrom(owner.address, addr1.address, addr1Balance);
            await transferFeeTokenTx.wait();

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply - addr1Balance);
            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance);
            
            const approveTx = await ERC20Token.connect(addr1).approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(addr1.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(addr1.address);

            const approveERC721TokenTx = await ERC721Token.connect(addr1).approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(addr1).deposit(addr2.address, item, expiration);
            await depositTx.wait();

            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance-fee);

            const transferFeeTx = await Escrow.connect(owner).transferFee();
            await transferFeeTx.wait();

            expect((await ERC20Token.balanceOf(Escrow.address)).toNumber()).to.equal(itemId);
            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance-fee);
            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply - addr1Balance + fee);
        });

        it("Should not allow any address to collect fees", async function () {
            let addr1Balance = 5;
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply);
            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(0);

            const approveFeeTokenTx = await ERC20Token.connect(owner).approve(addr1.address, addr1Balance);
            await approveFeeTokenTx.wait();

            const transferFeeTokenTx = await ERC20Token.transferFrom(owner.address, addr1.address, addr1Balance);
            await transferFeeTokenTx.wait();

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply - addr1Balance);
            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance);
            
            const approveTx = await ERC20Token.connect(addr1).approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(addr1.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(addr1.address);

            const approveERC721TokenTx = await ERC721Token.connect(addr1).approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(addr1).deposit(addr2.address, item, expiration);
            await depositTx.wait();

            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance-fee);

            expect(Escrow.connect(addr1).transferFee()).to.be.revertedWith("Must be an owner.");

            expect((await ERC20Token.balanceOf(Escrow.address)).toNumber()).to.equal(fee);
            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance-fee);
            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply - addr1Balance);
        });
      });  

      describe("Deposit", function () {
        it("Should allow to deposit ERC721 compatible token", async function () {
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply);
            
            const approveTx = await ERC20Token.approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(owner.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(owner.address);

            const approveERC721TokenTx = await ERC721Token.approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(owner).deposit(addr1.address, item, expiration);
            await depositTx.wait();

            await expect(depositTx).to.emit(Escrow, 'Deposited').withArgs(itemId, addr1.address, ERC721Token.address, item);

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply-fee);
          });

        it("Should allow to deposit ERC721 compatible token from not a contract owner address", async function () {
            let addr1Balance = 5;
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            const approveFeeTokenTx = await ERC20Token.connect(owner).approve(addr1.address, addr1Balance);
            await approveFeeTokenTx.wait();

            const transferFeeTokenTx = await ERC20Token.transferFrom(owner.address, addr1.address, addr1Balance);
            await transferFeeTokenTx.wait();

            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance);
            
            const approveTx = await ERC20Token.connect(addr1).approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(addr1.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(addr1.address);

            const approveERC721TokenTx = await ERC721Token.connect(addr1).approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(addr1).deposit(addr2.address, item, expiration);
            await depositTx.wait();

            await expect(depositTx).to.emit(Escrow, 'Deposited').withArgs(itemId, addr2.address, ERC721Token.address, item);

            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(addr1Balance-fee);

            let latestBlock = await network.provider.send("eth_getBlockByNumber", ["latest", false]);
            const expectedBlock = parseInt(latestBlock.timestamp, 16) + expiration;

           const escrowItem = await Escrow.escrowItems(itemId);
            expect(escrowItem.seller).to.equal(addr2.address);
            expect(escrowItem.buyer).to.equal(addr1.address);
            expect(escrowItem.item).to.equal(item);
            expect(escrowItem.expiration).to.equal(expectedBlock);
          });
      
        it("Should allow to see deposited item of an account", async function () {
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply);
            
            const approveTx = await ERC20Token.approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(owner.address, fee);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(owner.address);

            const approveERC721TokenTx = await ERC721Token.approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(owner).deposit(addr1.address, item, expiration);
            await depositTx.wait();

            await expect(depositTx).to.emit(Escrow, 'Deposited').withArgs(0, addr1.address, ERC721Token.address, item);

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply-fee);

            let latestBlock = await network.provider.send("eth_getBlockByNumber", ["latest", false]);
            const expectedBlock = parseInt(latestBlock.timestamp, 16) + expiration;

            const escrowItem = await Escrow.escrowItems(itemId);
            expect(escrowItem.seller).to.equal(addr1.address);
            expect(escrowItem.buyer).to.equal(owner.address);
            expect(escrowItem.item).to.equal(item);
            expect(escrowItem.expiration).to.equal(expectedBlock);
        });
    
        it("Should not allow to deposit if account has inssuficient balance", async function () { 
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(addr1.address)).toNumber()).to.equal(0);

            const mintTx = await ERC721Token.safeMint(addr1.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(addr1.address);

            const approveERC721TokenTx = await ERC721Token.connect(addr1).approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            expect(Escrow.connect(addr1).deposit(addr2.address, item, expiration)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
      });

      describe("Withdraw", function () {
        it("Should allow to withdraw a token after the expiration time", async function () {
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply);
            
            const approveTx = await ERC20Token.approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(owner.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(owner.address);

            const approveERC721TokenTx = await ERC721Token.approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(owner).deposit(addr1.address, item, expiration);
            await depositTx.wait();

            let latestBlock = await network.provider.send("eth_getBlockByNumber", ["latest", false]);
            const expectedBlock = parseInt(latestBlock.timestamp, 16) + expiration;

            let escrowItem = await Escrow.escrowItems(itemId);
            expect(escrowItem.expiration).to.equal(expectedBlock);

            await network.provider.send("evm_setNextBlockTimestamp", [expectedBlock])
            await network.provider.send("evm_mine");

            let futureLatestBlock = await network.provider.send("eth_getBlockByNumber", ["latest", false]);
            expect(escrowItem.expiration).to.equal(parseInt(futureLatestBlock.timestamp, 16));

            const withdrawTx = await Escrow.withdraw(itemId);
            await withdrawTx.wait();

            await expect(withdrawTx).to.emit(Escrow, 'Withdrawn').withArgs(0, addr1.address, ERC721Token.address, item);
            
            expect(await ERC721Token.ownerOf(item)).to.equal(addr1.address);
            
            escrowItem = await Escrow.escrowItems(itemId);
            expect(escrowItem.seller).to.equal(ethers.constants.AddressZero);
            expect(escrowItem.buyer).to.equal(ethers.constants.AddressZero);
            expect(escrowItem.item).to.equal(0);
            expect(escrowItem.expiration).to.equal(0);
        });

        it("Should not allow to withdraw a token before the expiration time", async function () {
            let itemId = 0;
            let item = 1;
            let expiration = 1;

            expect((await ERC20Token.balanceOf(owner.address)).toNumber()).to.equal(tokenSupply);
            
            const approveTx = await ERC20Token.approve(Escrow.address, fee);
            await approveTx.wait();

            const mintTx = await ERC721Token.safeMint(owner.address, item);
            await mintTx.wait();

            expect(await ERC721Token.ownerOf(item)).to.equal(owner.address);

            const approveERC721TokenTx = await ERC721Token.approve(Escrow.address, item);
            await approveERC721TokenTx.wait();

            const depositTx = await Escrow.connect(owner).deposit(addr1.address, item, expiration);
            await depositTx.wait();

            let latestBlock = await network.provider.send("eth_getBlockByNumber", ["latest", false]);
            const expectedBlock = parseInt(latestBlock.timestamp, 16) + expiration;

            let escrowItem = await Escrow.escrowItems(itemId);
            expect(escrowItem.expiration).to.equal(expectedBlock);

            expect(Escrow.withdraw(0)).to.be.revertedWith("The item is still in escrow.");

            expect(await ERC721Token.ownerOf(item)).to.equal(Escrow.address);

            escrowItem = await Escrow.escrowItems(itemId);
            expect(escrowItem.seller).to.equal(addr1.address);
            expect(escrowItem.buyer).to.equal(owner.address);
            expect(escrowItem.item).to.equal(item);
            expect(escrowItem.expiration).to.equal(expectedBlock);
        });
      });  
});