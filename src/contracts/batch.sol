// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {SafeMath} from "./utils/SafeMath.sol";

contract Batch is IERC721Receiver, AccessControl {
    using SafeMath for uint256;

    uint256 public tokenCounter;
    uint256 public collectionCounter;
    uint256 public nextNftID;
    IERC20 public collateralToken;
    
    uint256 constant FEE_BASE = 10000;
    uint256 public feeRate = 500;
    address public feeTo;
    uint256 public creatingFee = 0;

    struct Collection {
        address owner;
        string name;
        uint256 size;
        uint256 commissionRate;  // for curator (owner)
        bool willAcceptBLES;

        // The following are runtime variables before publish
        uint256 totalPrice;
        uint256 fee;
        uint256 commission;

        // The following are runtime variables after publish
        uint256 publishedAt;  // time that published.
        // uint256 timesToCall;
        uint256 soldCount;
        uint256 nftsCount;
    }

    struct NFT {
        address tokenAddress;
        uint256 tokenId;
        address owner;
        uint256 price;
        uint256 paid;
        uint256 collectionId;
        uint256 indexInCollection;
    }

    // This keeps record of all the NFT
    mapping(uint256 => NFT) public allNFTs;
    // This keeps record of a address(user) nftID
    mapping(address => uint256[]) public nftsByOwner;
    // users address to tokenID to nftID (map users address to tokenID and NFT struct)
    mapping(address => mapping(uint256 => uint256)) public nftIdMap;
    // all collection
    mapping(uint256 => Collection) public allCollections;
    // collections collaborator
    mapping(uint256 => mapping(address => bool)) public isCollaborator; 
     // collectionId => collaborators
    mapping(uint256 => address[]) public collaborators;
    // collectionId => nftId[]
    mapping(uint256 => uint256) public collectionsNftCount;
    mapping(uint256 => uint256[]) public nftsByCollectionId;
    mapping(address => uint256[]) public collectionsByOwner; // users collection

    uint256 public nftPriceFloor = 1e18;  // 1 USDC
    uint256 public nftPriceCeil = 1e24;  // 1M USDC
    uint256 public minimumCollectionSize = 3;  // 3 blind boxes
    uint256 public maximumDuration = 14 days; // Refund if not sold out in 14 days.

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            'ArthPool: You are not the admin'
        );
        _;
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        nextNftID = 0;
        collectionCounter = 0;
    }

    // setter to set baseToken
    function setBaseToken(IERC20 baseToken_) public onlyAdmin {
        collateralToken = baseToken_;
    }

    function setFeeTo(address payable _feeAddress) public onlyAdmin {
        feeTo = _feeAddress;
    }

    function setCreatingFee(uint256 _amount) public onlyAdmin {
        creatingFee = _amount;
    }

    // deposit NFT
    function _depositNFT(address tokenAddress_, uint256 tokenId_, uint256 collectionId_, uint256 nftIndex_) private returns(uint256) {
        IERC721(tokenAddress_).safeTransferFrom(_msgSender(), address(this), tokenId_);

        NFT memory nft;
        nft.tokenAddress = tokenAddress_;
        nft.tokenId = tokenId_;
        nft.owner = _msgSender();
        nft.collectionId = collectionId_;
        nft.indexInCollection = nftIndex_;

        uint256 nftId;

        if (nftIdMap[tokenAddress_][tokenId_] > 0) {
            nftId = nftIdMap[tokenAddress_][tokenId_];
        } else {
            nftId = nextNftID.add(1);
            nftIdMap[tokenAddress_][tokenId_] = nftId;
        }

        allNFTs[nftId] = nft;
        nftsByOwner[_msgSender()].push(nftId);

        return nftId;
    }

    function createCollection(
        string memory name_,
        uint256 size_,
        uint256 commissionRate_,
        bool willAcceptBLES_,
        address[] calldata collaborators_
    ) external {
        require(size_ >= minimumCollectionSize, "Size too small");
        require(commissionRate_.add(feeRate) < FEE_BASE, "Too much commission");

        if (creatingFee > 0) {
            // Charges BLES for creating the collection.
            IERC20(collateralToken).transferFrom(msg.sender, feeTo, creatingFee);
        }

        Collection memory collection;
        collection.owner = msg.sender;
        collection.name = name_;
        collection.size = size_;
        collection.commissionRate = commissionRate_;
        collection.totalPrice = 0;
        //collection.averagePrice = 0;
        collection.willAcceptBLES = willAcceptBLES_;
        collection.publishedAt = 0;
        collection.nftsCount = 0;

        uint256 collectionId = collectionCounter.add(1);
        collectionCounter = collectionCounter.add(1);

        allCollections[collectionId] = collection;
        collectionsByOwner[msg.sender].push(collectionId);
        collaborators[collectionId] = collaborators_;

        for (uint256 i = 0; i < collaborators_.length; ++i) {
            isCollaborator[collectionId][collaborators_[i]] = true;
        }
    }

    function addNFTToCollection(address tokenAddress_, uint256 tokenId_, uint256 collectionId_, uint256 price_) external {
        Collection storage collection = allCollections[collectionId_];
        collectionsNftCount[collectionId_] = collectionsNftCount[collectionId_].add(1);
        uint256 nftId_ = _depositNFT(tokenAddress_, tokenId_, collectionId_, collectionsNftCount[collectionId_]);
        
        require(allNFTs[nftId_].owner == _msgSender(), "Only NFT owner can add");
        require(collection.owner == _msgSender() ||
                isCollaborator[collectionId_][_msgSender()], "Needs collection owner or collaborator");

        require(price_ >= nftPriceFloor && price_ <= nftPriceCeil, "Price not in range");

        require(!isPublished(collectionId_), "Collection already published");
        require(collectionsNftCount[collectionId_] < collection.size,
                "collection full");

        allNFTs[nftId_].price = price_;
        allNFTs[nftId_].indexInCollection = nftsByCollectionId[collectionId_].length;

        // Push to nftsByCollectionId.
        nftsByCollectionId[collectionId_].push(nftId_);

        collection.totalPrice = collection.totalPrice.add(price_);

        if (!collection.willAcceptBLES) {
            collection.fee = collection.fee.add(price_.mul(feeRate).div(FEE_BASE));
        }

        collection.commission = collection.commission.add(price_.mul(collection.commissionRate).div(FEE_BASE));
    }

    function isPublished(uint256 collectionId_) public view returns(bool) {
        return allCollections[collectionId_].publishedAt > 0;
    }

    function editNFTInCollection(uint256 nftId_, uint256 collectionId_, uint256 price_) external {
        Collection storage collection = allCollections[collectionId_];

        require(collection.owner == _msgSender() ||
                allNFTs[nftId_].owner == _msgSender(), "Needs collection owner or NFT owner");

        require(price_ >= nftPriceFloor && price_ <= nftPriceCeil, "Price not in range");

        require(allNFTs[nftId_].collectionId == collectionId_, "NFT not in collection");
        require(!isPublished(collectionId_), "Collection already published");

        collection.totalPrice = collection.totalPrice.add(price_).sub(allNFTs[nftId_].price);

        if (!collection.willAcceptBLES) {
            collection.fee = collection.fee.add(
                price_.mul(feeRate).div(FEE_BASE)).sub(
                    allNFTs[nftId_].price.mul(feeRate).div(FEE_BASE));
        }

        collection.commission = collection.commission.add(
            price_.mul(collection.commissionRate).div(FEE_BASE)).sub(
                allNFTs[nftId_].price.mul(collection.commissionRate).div(FEE_BASE));

        allNFTs[nftId_].price = price_;  // Change price.
    }

    // yet to test
    function _withdrawNFT(address who_, uint256 nftId_, bool isClaim_) private {
        allNFTs[nftId_].owner = address(0);
        allNFTs[nftId_].collectionId = 0;

        address tokenAddress = allNFTs[nftId_].tokenAddress;
        uint256 tokenId = allNFTs[nftId_].tokenId;

        IERC721(tokenAddress).safeTransferFrom(address(this), who_, tokenId);
    }

    function _removeNFTFromCollection(uint256 nftId_, uint256 collectionId_) private {
        Collection storage collection = allCollections[collectionId_];

        require(allNFTs[nftId_].owner == _msgSender() ||
                collection.owner == _msgSender(),
                "Only NFT owner or collection owner can remove");
        require(allNFTs[nftId_].collectionId == collectionId_, "NFT not in collection");
        require(!isPublished(collectionId_), "Collection already published");

        collection.totalPrice = collection.totalPrice.sub(allNFTs[nftId_].price);

        if (!collection.willAcceptBLES) {
            collection.fee = collection.fee.sub(
                allNFTs[nftId_].price.mul(feeRate).div(FEE_BASE));
        }

        collection.commission = collection.commission.sub(
            allNFTs[nftId_].price.mul(collection.commissionRate).div(FEE_BASE));


        allNFTs[nftId_].collectionId = 0;

        // Removes from nftsByCollectionId
        uint256 index = allNFTs[nftId_].indexInCollection;
        uint256 lastNFTId = nftsByCollectionId[collectionId_][nftsByCollectionId[collectionId_].length - 1];

        nftsByCollectionId[collectionId_][index] = lastNFTId;
        allNFTs[lastNFTId].indexInCollection = index;
        nftsByCollectionId[collectionId_].pop();
    }

    function removeNFTFromCollection(uint256 nftId_, uint256 collectionId_) external {
        address nftOwner = allNFTs[nftId_].owner;
        _removeNFTFromCollection(nftId_, collectionId_);
        _withdrawNFT(nftOwner, nftId_, false);
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}