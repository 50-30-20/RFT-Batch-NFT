// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {SafeMath} from "./utils/SafeMath.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IDiamondToken.sol";

contract Batch is IERC721Receiver, AccessControl {
    using SafeMath for uint256;

    // declaring variables
    uint256 public nftCounter;
    uint256 public collectionCounter;
    uint256 public minimumCollectionSize;
    uint256 public diamondTokenPrice;
    uint256 public collateralTokenPrice;
    uint256 public pricePrecesion;

    IERC20 public collateralToken;
    IDiamondToken public diamondERC20token;
    
    // declaring struct
    struct Collection {
        address owner;
        string name;
        uint256 size;
        uint256 totalPrice;
        uint256 publishedAt;  // time that published.
        uint256 collateralAmount;
        bool acceptCollateral;
        uint256 soldCount;
        uint256 nftsCount;
    }

    struct NFT {
        address tokenAddress;
        uint256 tokenId;
        address owner;
        uint256 price;
        uint256 collectionId;
        uint256 diamondTokenAmount;
        bool collateralLocked;
        bool collateralReturned;
        uint256 collectionIndex;
    }

    // This keeps record of all the NFT
    NFT[] public allNFTs; 
    //mapping(uint256 => NFT) public allNFTs;
    // This keeps record of a address(users nft) nft
    mapping(address => uint256[]) public usersNFT;
    // users address to tokenID to nftID (map users address to tokenID and NFT struct)
    mapping(address => mapping(uint256 => uint256)) public nftTokenIndex;
    //mapping(uint256 => mapping(uint256 => uint256)) public nftTokenIndex;
    // all collection
    mapping(uint256 => Collection) public allCollections; 
    // collectionId => collaborators ( All collaborators of a collection )
    mapping(uint256 => address[]) public collaborators;
    // collections collaborators 
    mapping(uint256 => mapping(address => bool)) public isCollaborator;
    // Number of NFTs count in an collection
    mapping(uint256 => uint256) public collectionsNftCount;
    //  Nfts in an collection (collectionid to nfts)
    mapping(uint256 => NFT[]) public nftsByCollectionId;
    // users collection
    mapping(address => uint256[]) public usersCollection;
    //mapping(address )

    
    /* This is an moifier that makes sure only deployer of these contract can trigger
    important functions */
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            'ArthPool: You are not the admin'
        );
        _;
    }

    /*
        In Constructor we are setting the admin, default values
    */
    constructor(
        address _tokenAddress, 
        address _usdt
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        nftCounter = 0;
        collectionCounter = 0;
        minimumCollectionSize = 5;
        diamondTokenPrice = 10000000;
        collateralTokenPrice = 1000000;
        pricePrecesion = 1e6;

        diamondERC20token = IDiamondToken(_tokenAddress);
        collateralToken = IERC20(_usdt);
    }

    // setter to set the collateral token address ( By default its Mock USDT)
    function setCollateralToken(IERC20 _token) public onlyAdmin {
        collateralToken = _token;
    }

    // setter to set the native erc20 token address ( By default its Mock USDT)
    function setNativeToken(IDiamondToken _token) public onlyAdmin {
        diamondERC20token = _token;
    }

    // setter for minimum size of the collection
    function setCollectionSize(uint256 _size) public onlyAdmin {
        minimumCollectionSize = _size;
    }

    /*
        here we are making the boxes which will hold nfts. 
        params :-
            name - Name of the collection
            size - Size of the collection
            acceptCollatearal - Boolean field declared if the collection
               requires collateral token in order to mint global Diamond erc20 Token
            collaborators - array of all the collaborators of the collection
    */
    function createCollection(
        string memory name_,
        uint256 size_,
        bool acceptCollateral_,
        address[] calldata collaborators_
    ) public {
        require(size_ >= minimumCollectionSize, "Size too small");
        
        // Setting up the struct Collection values 
        Collection memory collection;
        collection.owner = msg.sender;
        collection.name = name_;
        collection.size = size_;
        collection.totalPrice = 0;
        collection.publishedAt = 0;
        collection.nftsCount = 0;
        collection.acceptCollateral = acceptCollateral_;

        // Incrementing the collection counter id
        collectionCounter = collectionCounter.add(1);
        uint256 collectionId = collectionCounter;
        
        // Storing the collection in a mapping with refernce to collection id
        allCollections[collectionId] = collection;
        // saving all the collections of a user with respect to his address
        usersCollection[msg.sender].push(collectionId);
        // saving all the collaborators
        collaborators[collectionId] = collaborators_;

        // looping through all the collaborators and setting there boolean feild
        for (uint256 i = 0; i < collaborators_.length; i++) {
            isCollaborator[collectionId][collaborators_[i]] = true;
        }
    }

    function setDiamondTokenPrice(uint256 _price) public {
        diamondTokenPrice = _price;
    }

    function getDiamondTokenPrice() public view returns(uint256){
       return diamondTokenPrice;
    }

    function setCollateralTokenPrice(uint256 _price) public {
        collateralTokenPrice = _price;
    }

    function getCollateralTokenPrice() public view returns(uint256){
        return collateralTokenPrice;
    }

    function amountDmgTokenOut(uint256 _amount) public view returns(uint256){
        uint256 _diamondTokenPrice = getDiamondTokenPrice().div(pricePrecesion);
        uint256 diamondTokenOut = _amount.div(_diamondTokenPrice);
        return diamondTokenOut;
    }

    /* 
        depositing NFT into an collection ( This is an private function which 
        will be called by an public function)
    */
    function _depositNFT(
        address tokenAddress_,
        uint256 tokenId_,
        uint256 collectionId_, 
        uint256 price_,
        uint256 nftsIndex_,
        uint256 collectionIndex_
    ) private {
        IERC721(tokenAddress_).safeTransferFrom(msg.sender, address(this), tokenId_);

        // saving the batches sturct data
        NFT memory nft;
        nft.tokenAddress = tokenAddress_;
        nft.tokenId = tokenId_;
        nft.owner = msg.sender;
        nft.collectionId = collectionId_;
        nft.price = price_;
        nft.collectionIndex = collectionIndex_;
        
        // transfering Diamond Token
        uint256 _diamondTokenPrice = getDiamondTokenPrice().div(pricePrecesion);
        uint256 diamondTokenOut = price_.div(_diamondTokenPrice);
        diamondERC20token.mint(msg.sender, diamondTokenOut);

        // Stroing the number of diamond token a person should return while reedeming NFT
        nft.diamondTokenAmount = diamondTokenOut;

        // Push to nftsByCollectionId.
        allNFTs.push(nft);
        nftsByCollectionId[collectionId_].push(nft);
        usersNFT[msg.sender].push(nftsIndex_);

        nftTokenIndex[tokenAddress_][tokenId_] = nftsIndex_;
    }

    function addNFTToCollection(
        address tokenAddress_, 
        uint256 tokenId_, 
        uint256 collectionId_, 
        uint256 price_
    ) public {
        Collection storage collection = allCollections[collectionId_];
        // number of nfts in a collection
        collectionsNftCount[collectionId_] = collectionsNftCount[collectionId_].add(1);    
        
        // basic auths
        require(IERC721(tokenAddress_).ownerOf(tokenId_) == _msgSender(), "Only NFT owner can add");
        require(collection.owner == _msgSender() ||
                isCollaborator[collectionId_][_msgSender()], "Needs collection owner or collaborator");
        require(collectionsNftCount[collectionId_] < collection.size,
                "collection full");
        
        // transferring collatearals, so calculating the amount of collateral to transfer
        uint256 _collateralTokenPrice = getCollateralTokenPrice().div(pricePrecesion);
        uint256 collateralAmount = price_.div(_collateralTokenPrice);
        require(collateralToken.balanceOf(msg.sender) >= collateralAmount, "Not enough of collateral balance");

        // updating collection
        collection.totalPrice = collection.totalPrice.add(price_);
        uint256 _collectionIndex = collection.nftsCount;
        collection.nftsCount = collection.nftsCount.add(1);
        uint256 _nftsIndex = nftCounter;
        allCollections[collectionId_] = collection;

        // transfering the collateral token
        collateralToken.transferFrom(msg.sender, address(this), collateralAmount);

        // depositing the nft into the collection
        nftCounter = nftCounter.add(1);
        _depositNFT(
            tokenAddress_, 
            tokenId_, 
            collectionId_, 
            price_,
            _nftsIndex,
            _collectionIndex
        );
    }

    // Unused Function only for reference
    function _withdrawNFT(
        address who_, 
        uint256 nftId_
    ) private {
        allNFTs[nftId_].owner = address(0);
        allNFTs[nftId_].collectionId = 0;

        address tokenAddress = allNFTs[nftId_].tokenAddress;
        uint256 tokenId = allNFTs[nftId_].tokenId;

        IERC721(tokenAddress).safeTransferFrom(address(this), who_, tokenId);
    }

    // Private function to remove the nft from the collection
    function _removeNFTFromCollection(
        address tokenAddress_,
        uint256 nftId_, 
        uint256 collectionId_
    ) private {
        Collection storage collection = allCollections[collectionId_];
        uint256 _nftsIndex = nftTokenIndex[tokenAddress_][nftId_];
        NFT storage nft = allNFTs[_nftsIndex];

        require(allNFTs[_nftsIndex].owner == _msgSender() ||
                collection.owner == _msgSender(),
                "Only NFT owner or collection owner can remove");
        require(allNFTs[_nftsIndex].collectionId == collectionId_, "NFT not in collection");

        // updating the collection values as one nft is removed from the batch
        collection.totalPrice = collection.totalPrice.sub(allNFTs[_nftsIndex].price);
        collection.nftsCount = collection.nftsCount.sub(1);
        allCollections[collectionId_] = collection;
        //nftCounter = nftCounter.sub(1);
        allNFTs[_nftsIndex].collectionId = 0;

        // Returning the erc721 token back
        IERC721(tokenAddress_).safeTransferFrom(address(this), nft.owner, nftId_);

        // deleting from the nft array
        delete allNFTs[_nftsIndex];
        delete nftsByCollectionId[collectionId_][nft.collectionIndex];
    }

    function removeNFTFromCollection(address tokenAddress_, uint256 nftId_, uint256 collectionId_) public {
        uint256 _nftsIndex = nftTokenIndex[tokenAddress_][nftId_];
        NFT storage nft = allNFTs[_nftsIndex];
        
        // Person has to return the amount of diamond token back
        IERC20(diamondERC20token).transferFrom(msg.sender, address(this), nft.diamondTokenAmount);

        _removeNFTFromCollection(tokenAddress_, nftId_, collectionId_);
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}