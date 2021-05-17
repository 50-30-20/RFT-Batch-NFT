// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {SafeMath} from "./utils/SafeMath.sol";

contract TokenFactory is  ERC721URIStorage, IERC721Receiver, AccessControl {
    using SafeMath for uint256;

    uint256 public tokenCounter;
    IERC20 public collateralToken;
    IERC20 public rftToken;

    address public Validator;

    struct Diamond {
        uint256 id;
        string name;
        string ipfsHash;
        address owner;
        uint256 price;
        bool authenticate;
        bool collateralLocked;
        bool liquidityRemoved;
        bool reedemDiamond;
        bool nftLocked;
    }

    mapping(uint256 => Diamond) public nfts;
    mapping(address => uint256) public deposit;

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            'ArthPool: You are not the admin'
        );
        _;
    }

    constructor(IERC20 _tokenAddress, IERC20 _usdt)  ERC721("Diamond", "DMG") {
        tokenCounter = 0;
        rftToken = _tokenAddress;
        collateralToken = _usdt;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        Validator = msg.sender;
    }

    function createCollectible(
        string memory _name,
        uint256 _diamondPrice,
        string memory tokenURI
    ) public returns (uint256) {
        tokenCounter = tokenCounter + 1;
        uint256 newItemId = tokenCounter;

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        nfts[newItemId] = Diamond(
            newItemId,
            _name,
            tokenURI,
            msg.sender,
            _diamondPrice,
            false,
            false,
            false,
            false,
            false
        );

        return newItemId;
    }

    function requestDiamondLiquidity(uint256 _diamondId)
        public
    {   
        Diamond memory _diamond = nfts[_diamondId];
        _diamond.nftLocked = true;
        nfts[_diamondId] = _diamond;

        safeTransferFrom(msg.sender, address(Validator), _diamondId);
    }

    function approveDiamondAuthencity(uint256 _diamondId, bool _authencity) 
        public
        onlyAdmin
    {
        Diamond memory _diamond = nfts[_diamondId];
        _diamond.authenticate = _authencity;
        
        if (_authencity) {
            _diamond.nftLocked = true;
            rftToken.approve(_diamond.owner, _diamond.price);
        } else {
            _diamond.nftLocked = false;
            safeTransferFrom(address(Validator), _diamond.owner, _diamondId);
        }

        nfts[_diamondId] = _diamond;
    }

    function addDiamondLiquidity(uint256 _diamondId) 
        public 
    {   
        Diamond memory _diamond = nfts[_diamondId];
        
        require(collateralToken.balanceOf(msg.sender) > _diamond.price, 'Token Factory 82: Insufficent Collateral Amount');
        require(_diamond.authenticate, 'Token Factory 83: Not An Authentic Diamond Representation');
        require(!_diamond.collateralLocked, 'Token Factory 84: Already Added Liquidation');

        _diamond.collateralLocked = true;
        nfts[_diamondId] = _diamond;

        collateralToken.transferFrom(msg.sender, address(this), _diamond.price);
        rftToken.transfer(msg.sender, _diamond.price);
    }

    // return collateral
    function reedemDiamond(uint256 _diamondId, uint256 _amount) public {
        Diamond memory _diamond = nfts[_diamondId];
        require(_diamond.price >= _amount, 'Token Factory 112: Not Enough Reedemable Collateral');
        require(!_diamond.reedemDiamond, 'Token Factory 113: Already Diamond Reedemed');
        
        _diamond.reedemDiamond = true;
        _diamond.liquidityRemoved = true;
        nfts[_diamondId] = _diamond;

        rftToken.transferFrom(msg.sender, address(this), _diamond.price);
    }

    // return NFT
    function repayDiamond(uint256 _diamondId) 
        public 
        onlyAdmin
    {   
        Diamond memory _diamond = nfts[_diamondId];
        _diamond.nftLocked = false;
        nfts[_diamondId] = _diamond;

        safeTransferFrom(address(Validator), _diamond.owner, _diamondId);
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
