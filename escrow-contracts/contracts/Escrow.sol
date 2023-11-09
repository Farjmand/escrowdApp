// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Escrow is ERC2771Context {
    
    address payable public owner;
    uint public fee;
    uint counter;
    uint collectedFee;
    IERC20 feeToken;
    IERC721 token;
    struct EscrowItem {
        address seller;
        address buyer;
        uint256 item;
        uint256 expiration;
    }
    mapping(uint256 => EscrowItem) public escrowItems;

    event Deposited(
        uint256 id,
        address indexed payee,
        address tokenAddress,
        uint256 item
    );
    event Withdrawn(
        uint256 id,
        address indexed payee,
        address tokenAddress,
        uint256 item
    );

    constructor(
        IERC721 _token,
        IERC20 _feeToken,
        uint _fee,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) {
        owner = payable(msg.sender);
        token = _token;
        feeToken = _feeToken;
        fee = _fee;
        counter = 0;
    }

     function _msgSender() internal view override(ERC2771Context )
      returns (address sender) {
      sender = ERC2771Context._msgSender();
  }

  function _msgData() internal view override( ERC2771Context )
      returns (bytes calldata) {
      return ERC2771Context._msgData();
  }

  modifier requiresFee() {
      require(msg.value < fee);
        _;
    }

  modifier onlyOwner() {
      require(msg.sender == owner, "Must be an owner.");
        _;
  }

  function transferFee() public onlyOwner {
      feeToken.approve(owner, collectedFee);
      feeToken.transfer(owner, collectedFee);
      collectedFee = 0;
  }

  function deposit(address _payee, uint256 _item, uint256 _expiration) public requiresFee payable {
      require(msg.sender == token.ownerOf(_item), "Sender is not a token owner.") ;
      token.transferFrom(msg.sender, address(this), _item);
      feeToken.transferFrom(msg.sender, address(this), fee);
      uint256 id = counter;
      escrowItems[id] = EscrowItem({
        seller: _payee,
        buyer: msg.sender,
        item: _item,
        expiration: block.timestamp + _expiration
      });
      counter += 1;
      collectedFee += fee;
      emit Deposited(id, _payee, address(token), _item);
  }
  function withdraw(uint256 _id) public {
      require(block.timestamp > escrowItems[_id].expiration, "The item is still in escrow.");
      address seller = escrowItems[_id].seller;
      uint256 item = escrowItems[_id].item;
      delete(escrowItems[_id]);
      IERC721(address(token)).transferFrom(address(this), seller, item);
      emit Withdrawn(_id, seller, address(token), item);
  }

}
