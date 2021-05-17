import Web3 from 'web3';
import React, { Component } from 'react';
import './FaucetView.css';
import TokenFactory from '../abis/TokenFactory.json'
import USDTToken from '../abis/USDTToken.json'
import image from '../images/tether.png'

class FaucetView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            account: ''
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
        const usdtData = USDTToken.networks[networkId]

        if (networkData) {
            const tokenFactory = new web3.eth.Contract(TokenFactory.abi, networkData.address)
            this.setState({ tokenFactory })

            const usdtToken = new web3.eth.Contract(USDTToken.abi, usdtData.address)
            this.setState({ usdtToken })
            this.setState({ loading: false })

        } else {
            window.alert("TokenFactory contract is not deployed to detected network")
        }
    }

    async handleSubmit(event) {
        event.preventDefault()

        await this.state.usdtToken.methods.faucet()
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
            })
    }

    render() {
        return (
            <div className="main">
                <form onSubmit={this.handleSubmit}>
                    <div className="container">

                        <div className="form-el">
                            <img className="logo" src={image}></img> 
                        </div>

                        <button type="submit" className="Button">Faucet</button>
                    </div>
                </form>
            </div>
        );
    }
}


export default FaucetView;
