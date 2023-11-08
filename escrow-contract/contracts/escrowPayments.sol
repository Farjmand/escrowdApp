// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
    address agent;
    address public arbiter;
    address public beneficiary;
    address public depositor;

    bool public isApproved;

    constructor() public {
       agent = msg.sender;
    }

    event Approved(uint);

    uint public approveCount = 0;

    function approve() external {
        require(msg.sender == arbiter1 || msg.sender == arbiter2);
        if (approveCount <= 1) {
            approveCount++;
        }
        if (approveCount == 2) {
            uint balance = address(this).balance;
            (bool sent, ) = payable(beneficiary).call{value: balance}("");
            require(sent, "Failed to send Ether");
            emit Approved(balance);
        }
    }
}
