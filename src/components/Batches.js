import Web3 from 'web3';
import React, { Component } from 'react';
import TokenFactory from '../abis/TokenFactory.json'
import USDTToken from '../abis/USDTToken.json'
import Batch from '../abis/Batch.json'
import IERC721 from '../abis/IERC721.json'

import './Batches.css';

class Liquidity extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tokenId1: null,
            tokenId2: null,
            name: null,
            size: null,
            acceptCollateral: null,
            collaborators: null,
            nftTokenAddress: null,
            nftTokenId: null,
            collectionId: null,
            price: null,
            nft: null
        }

        this.handleSubmit1 = this.handleSubmit1.bind(this);
        this.handleSubmit2 = this.handleSubmit2.bind(this);
        this.loadWeb3 = this.loadWeb3.bind(this)
        this.loadBlockchainData = this.loadBlockchainData.bind(this)
    }

    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) window.web3 = new Web3(window.web3.currentProvider)
        else window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }

    async loadBlockchainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })

        const networkId = await web3.eth.net.getId()
        const networkData = TokenFactory.networks[networkId]
        const BatchNetworkData = Batch.networks[networkId]
        const usdtData = USDTToken.networks[networkId]

        if (networkData) {
            const tokenFactory = new web3.eth.Contract(TokenFactory.abi, networkData.address)
            this.setState({ tokenFactory })

            const usdtToken = new web3.eth.Contract(USDTToken.abi, usdtData.address)
            this.setState({ usdtToken })
            this.setState({ loading: false })

            const batchContract = new web3.eth.Contract(Batch.abi, BatchNetworkData.address)
            this.setState({ batchContract })
            this.setState({ loading: false });
        } else {
            window.alert("TokenFactory contract is not deployed to detected network")
        }
    }

    async handleSubmit1(event) {
        event.preventDefault()

        console.log(this.state.batchContract);
        await this.state.batchContract.methods.createCollection(
            this.state.name,
            this.state.size,
            this.state.acceptCollateral,
            this.state.collaborators
        )
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
            })
    }

    async handleSubmit2(event) {
        event.preventDefault()

        const web3 = window.web3

        // const price = await this.state.tokenFactory.methods.nfts(this.state.tokenId2).call()
        // let amount = price.price.toString();
        // console.log('price', amount);
        
        await this.state.usdtToken.methods.approve(this.state.batchContract._address, this.state.price)
        .send({ from: this.state.account })
        .on('transactionHash', async (hash) => {
            const add = async () => {
                await this.state.batchContract.methods.addNFTToCollection(
                    this.state.nftTokenAddress,
                    this.state.nftTokenId,
                    this.state.collectionId,
                    this.state.price
                )
                    .send({ from: this.state.account })
                    .once('receipt', (receipt) => {
                        this.setState({ loading: false })
                    });
            }

            //await this.state.usdtToken.methods.approve(this.state.tokenFactory.address, amount)
            const nft = new web3.eth.Contract(IERC721.abi, this.state.nftTokenAddress);
            await nft.methods.approve(this.state.batchContract._address, this.state.nftTokenId)
                .send({ from: this.state.account })
                .once('receipt', (receipt) => {
                    console.log('Confirm', receipt);
                    add();
                })
        })
    }

    render() {
        return (
            <div className="main">
                <form className="form1" onSubmit={this.handleSubmit1}>
                    <div className="container1">
                        <div className="form-el">
                            <label className='text-header1-l'>Create Collection</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.name}
                                placeholder="Name"
                                onChange={event => this.setState({ name: event.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.size}
                                placeholder="Size"
                                onChange={event => this.setState({ size: event.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.acceptCollateral}
                                placeholder="Accept Collateral"
                                onChange={event => this.setState({ acceptCollateral: event.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.collaborators}
                                placeholder="collaborators (seperate address with comma)"
                                onChange={event => this.setState({ collaborators: [event.target.value] })}
                            />
                        </div>

                        <button type="submit" className="Button">Create</button>
                    </div>
                </form>

                <form className="form2" onSubmit={this.handleSubmit2}>
                    <div className="container2">
                        <div className="form-el">
                            <label className='text-header1-l'>Deposit NFT</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.nftTokenAddress}
                                placeholder="NFT Token Address"
                                onChange={event => this.setState({ nftTokenAddress: event.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.nftTokenId}
                                placeholder="NFT Token ID"
                                onChange={event => this.setState({ nftTokenId: event.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.collectionId}
                                placeholder="Collection ID"
                                onChange={event => this.setState({ collectionId: event.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.price}
                                placeholder="Price"
                                onChange={event => this.setState({ price: event.target.value })}
                            />
                        </div>

                        <button type="submit" className="Button">Create</button>
                    </div>
                </form>
            </div>
        );
    }
}


export default Liquidity;
