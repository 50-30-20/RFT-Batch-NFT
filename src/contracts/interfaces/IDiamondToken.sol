// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {IERC20} from './IERC20.sol';
/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see {ERC20Detailed}.
 */
interface IDiamondToken is IERC20 {
    function setOwner( address _owner ) external;

    function mint(address _to, uint256 _amount) external;
}
