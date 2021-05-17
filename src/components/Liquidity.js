import Web3 from 'web3';
import React, { Component } from 'react';
import './Liquidity.css';
import TokenFactory from '../abis/TokenFactory.json'
import USDTToken from '../abis/USDTToken.json'

class Liquidity extends Component {
    constructor(props) {
        super(props)

        this.state = {
           tokenId1: null,
           tokenId2: null
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

    async handleSubmit1(event) {
        event.preventDefault()

        console.log();
        await this.state.tokenFactory.methods.requestDiamondLiquidity(
            this.state.tokenId1
        )
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
            })

    }

    async handleSubmit2(event) {
        event.preventDefault()

        const price = await this.state.tokenFactory.methods.nfts(this.state.tokenId2).call()
        let amount = price.price.toString();
        console.log('price', amount);

        await this.state.usdtToken.methods.approve(this.state.tokenFactory.address, amount)
        .send({ from: this.state.account })
        .on('transactionHash', async (hash) => {
            await this.state.tokenFactory.methods.addDiamondLiquidity(
                this.state.tokenId2
            )
                .send({ from: this.state.account })
                .once('receipt', (receipt) => {
                    this.setState({ loading: false })
                })
        })

        // console.log();
    }
    
    render() {
        return (
            <div className="main">
                <form className="form1" onSubmit={this.handleSubmit1}>
                    <div className="container1">

                        <div className="form-el">
                            <label className='text-header1-l'>Request Liquidity</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.tokenId1}
                                placeholder="Token Id"
                                onChange={event => this.setState({ tokenId1: event.target.value })}
                            />
                        </div>

                        <button type="submit" className="Button">Create</button>
                    </div>
                </form>

                <form className="form2" onSubmit={this.handleSubmit2}>
                    <div className="container2">

                        <div className="form-el">
                            <label className='text-header1-l'>Add Liquidity</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.tokenId2}
                                placeholder="Token Id"
                                onChange={event => this.setState({ tokenId2: event.target.value })}
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
