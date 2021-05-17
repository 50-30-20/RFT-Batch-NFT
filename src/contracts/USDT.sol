// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./token/TokenERC20.sol";
import {SafeMath} from "./utils/SafeMath.sol";

contract USDTToken is Token {
    constructor() Token(msg.sender, 1000000, "USDT", 18) {}

    function mintToUser() public {
        faucet();
    }
}
