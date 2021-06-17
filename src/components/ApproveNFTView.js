import Web3 from 'web3';
import React, { Component } from 'react';
import './Collectable.css';
import TokenFactory from '../abis/TokenFactory.json'
import Batch from '../abis/Batch.json'
import { Table } from 'react-bootstrap';

class ApproveNFTView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tokenId: null,
            authenticate: null,
            batchContract: null,
            allCollections: []
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
            const batchContract = new web3.eth.Contract(Batch.abi, Batch.networks[networkId].address)
            this.setState({ batchContract})
            this.setState({ loading: false })

            const collectionCounter = await this.state.batchContract.methods.collectionCounter().call();
            const arr = []
            if (collectionCounter)
                for (let i = 1; i <= collectionCounter; i++) {
                    arr.push(await this.state.batchContract.methods.allCollections(i).call());
                }
            
            this.setState({ allCollections: arr});
            console.log(this.state.allCollections[0]);
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
                <div className="container">
                    {
                        !this.state.allCollections.length
                            ? <p> No collections </p>
                            : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Size</th>
                                            <th>Total prize</th>
                                            <th>NFT count</th>
                                            <th>Sold count</th>
                                            <th>Collateral amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.allCollections.map((item, key) => {
                                                return (
                                                    <tr key={key + 1}>
                                                        <td>{key + 1}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.size}</td>
                                                        <td>{item.nftsCount}</td>
                                                        <td>{item.totalPrize}</td>
                                                        <td>{item.soldCount}</td>
                                                        <td>{item.acceptCollateral ? item.collateralAmount : 0}</td>
                                                        <td>View nfts</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            )
                    }
                </div>
            </div>
        );
    }
}


export default ApproveNFTView;
