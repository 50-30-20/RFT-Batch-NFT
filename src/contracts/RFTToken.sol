// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./token/TokenERC20.sol";
import {SafeMath} from "./utils/SafeMath.sol";
import '@openzeppelin/contracts/access/AccessControl.sol';

contract RFTToken is Token {
    
    address[] public owners;
    mapping(address => bool) public ownerByAddress;
    
    modifier onlyOwner() {
        require(ownerByAddress[msg.sender] == true);
        _;
    }

    constructor() Token(msg.sender, 1000e18, "DMD", 18) {
        ownerByAddress[msg.sender] = true;
    }

    function setOwner( address _owner ) public onlyOwner {
        ownerByAddress[_owner] = true;
    }

    function mint(address _toAddress, uint256 _amount) public onlyOwner {
        _mint(_toAddress, _amount);
    }
}
