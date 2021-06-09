
<h1 align="center">Refungible Diamonds</h1>

This project demonstrates the use of NFT as liquidity provider to physical assets and create a global market on blockchain. The project aims to provide and generate 
global market for diamonds.

<h3>Challenge Statement</h3>

```

Here is a sample of a sample technical description in summary. Note that the NFT-ERC20 solution has applications beyond art and the user story below actually references diamonds.

The solution consists of two smart contracts: a token contract and a batching contract. They are spawned at the same time by an Ethereum factory and can be created by anyone. Upon creation, a Uniswap market is also created. Each token contract has an owner/creator. Anyone can send NFTs to the batching contract and request the token contract owner to mint corresponding ERC-20 tokens.

User story using diamonds!

Alice is a central figure in the diamond industry. She calculates that the average $/carat value of most diamonds in the market is around $7000. Using our solution she creates the 7000$/Carat ERC-20 diamond token with the aim of making it the standard for diamond fungibility. Increasingly, Alice’s trusted friends are joining Icecap Diamonds creating NFTs for GIA certified diamonds. One of her close business contacts, Bob, sends 30 diamond NFTs to the batching contract that have an average $/Carat value close to $7000. Bobs calls the requestmint function and the batching contract automatically requests a USDC deposit that makes the total average value exactly 7000$/carat. Bob deposits this balance when signing the transaction. Alice approves Bob’s mint request because she knows its authenticity. The NFTs and deposit are now locked on the batching contract. Bob cannot take them back without returning the ERC-20 tokens. The market trusts Alice and considers her ERC-20 tokens representative of the underlying NFT’s value and, of course, fungible. Part of Bob’s diamond inventory is now liquid and being traded on decentralized exchanges. Bob has a buyer for one of the batched diamonds. He sends the required ERC-20’s to the batching contract, they are burned and his NFT returned to him allowing him to transfer it to its new owner. Quickly, a global market of illiquid physical products (diamonds) becomes liquid with all of the transformative effects that liquidity brings.

```
<h3> Explainatory and Demo Video <h3>
  
  ```
  https://www.youtube.com/watch?v=bDYiXMOeasY&ab_channel=SagarBehara
  ```
  
<h3> Instructions To Run </h3>

```
. git clone https://github.com/50-30-20/RFT-Batch-NFT.git
. yarn / npm i
. yarn start / npm start
. Connect with metamask

```

<h3> Flow </h3>

```
1. Refungible Diamonds provide liquidity and create global market to diamonds.
2. Lapidarist comes to platform and submits valid proofs and details of his precious stones which is then minted as NFT.
3. The Validator that is Refungible Diamonds approves or disapproves the authencity if that diamond.
4. If approved the diamond the lapidarist( nft creator ) is asked to lock some collateral into the contracts. This collaterals are used to back the NFT and the 
   native token thats DMG is minted.
5. DMG is universally approved and people knows its authencity as it only mints if there are collateral backing it.
6. This creates an global market for the diamond.
7. Whenver the lapidarist has to sell his diamond as per terms and aggreement he has to repay the DMG token to withdraw his/her NFT.
8. Lapidarist repays the DMG token this triggers the repay function on the contract. 
9. Once DMG tokens are repaided the Validator safetransfers the NFT back.
```
