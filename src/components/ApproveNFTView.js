import Web3 from 'web3';
import React, { Component } from 'react';
import './Collectable.css';
import TokenFactory from '../abis/TokenFactory.json'

class ApproveNFTView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tokenId: null,
            authenticate: null
        }

        this.handleSubmit = this.handleSubmit.bind(this);
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

        if (networkData) {
            const tokenFactory = new web3.eth.Contract(TokenFactory.abi, networkData.address)
            this.setState({ tokenFactory })
            this.setState({ loading: false })

        } else {
            window.alert("TokenFactory contract is not deployed to detected network")
        }
    }

    async handleSubmit(event) {
        event.preventDefault()   
        await this.state.tokenFactory.methods.approveDiamondAuthencity(
            this.state.tokenId,
            this.state.authenticate
        )
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
            })    
    }

    async handleFileInput(e) {
        this.setState({ loading: true })
    }

    render() {
        return (
            <div className="main">
                <form onSubmit={this.handleSubmit}>
                    <div className="container">

                        <div className="form-el">
                            <label className='text-header1'>NFT ID</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.tokenId}
                                onChange={event => this.setState({ tokenId: event.target.value })}
                            />
                        </div>

                        <div className="form-el">
                            <label className='text-header1'>Legit</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="send authencity boolean"
                                value={this.state.authenticate}
                                onChange={event => this.setState({ authenticate: event.target.value })}
                            />
                        </div>

                        <button type="submit" className="Button">Create</button>
                    </div>
                </form>
            </div>
        );
    }
}


export default ApproveNFTView;
