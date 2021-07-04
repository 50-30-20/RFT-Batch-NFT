import Web3 from 'web3';
import React, { Component } from 'react';
import TokenFactory from '../abis/TokenFactory.json'
import RFTToken from '../abis/RFTToken.json'
import Batch from '../abis/Batch.json'

import './WithdrawNFT.css';

class Withdraw extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tokenId: null,
            tokenAddress: null,
            collectionID: null
        }

        this.handleSubmit1 = this.handleSubmit1.bind(this);
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
        const rftData = RFTToken.networks[networkId]

        if (networkData) {
            const tokenFactory = new web3.eth.Contract(TokenFactory.abi, networkData.address)
            this.setState({ tokenFactory })

            const batchContract = new web3.eth.Contract(Batch.abi, Batch.networks[networkId].address)
            this.setState({ batchContract })
            this.setState({ loading: false })

            const rftToken = new web3.eth.Contract(RFTToken.abi, rftData.address)
            this.setState({ rftToken })
            this.setState({ loading: false })

        } else {
            window.alert("TokenFactory contract is not deployed to detected network")
        }
    }

    async handleSubmit1(event) {
        event.preventDefault()

    
        await this.state.rftToken.methods.approve(this.state.batchContract._address, 10 )
            .send({ from: this.state.account })
            .on('transactionHash', async (hash) => {
                await this.state.batchContract.methods.removeNFTFromCollection(
                    this.state.tokenAddress,
                    this.state.tokenId,
                    this.state.collectionID
                )
                    .send({ from: this.state.account })
                    .once('receipt', (receipt) => {
                        this.setState({ loading: false })
                    })
            })
    }

    render() {
        return (
            <div className="main">
                <form className="form11" onSubmit={this.handleSubmit1}>
                    <div className="container1">

                        <div className="form-el">
                            <label className='text-header1-l'>Withdraw Diamond</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.tokenAddress}
                                placeholder="Token Address"
                                onChange={event => this.setState({ tokenAddress: event.target.value })}
                            />

                            <input
                                type="text"
                                className="form-control"
                                value={this.state.tokenId}
                                placeholder="Token ID"
                                onChange={event => this.setState({ tokenId: event.target.value })}
                            />

                            <input
                                type="text"
                                className="form-control"
                                value={this.state.collectionID}
                                placeholder="Collection ID"
                                onChange={event => this.setState({ collectionID: event.target.value })}
                            />
                        </div>

                        <button type="submit" className="Button">Withdraw Diamond</button>
                    </div>
                </form>
            </div>
        );
    }
}


export default Withdraw;
