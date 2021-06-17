import Web3 from 'web3';
import React, { Component } from 'react';
import './Collectable.css';
import TokenFactory from '../abis/TokenFactory.json'
import Batch from '../abis/Batch.json'
import { Table } from 'react-bootstrap';

class ViewNFT extends Component {
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
            this.setState({ batchContract })
            this.setState({ loading: false })

            const collectionCounter = this.props.location.state.key
                ? await this.state.batchContract.methods.collectionsNftCount(this.props.location.state.key).call()
                : await this.state.batchContract.methods.nftCounter().call();

            const arr = []
            if (this.props.location.state.key) {
                for (let i = 0; i < collectionCounter; i++) {
                    arr.push(await this.state.batchContract.methods.nftsByCollectionId(this.props.location.state.key, i).call());
                }
            } else {
                for (let i = 0; i < collectionCounter; i++) {
                    arr.push(await this.state.batchContract.methods.allNFTs(i).call());
                }
            }

            console.log(arr);
            this.setState({ allCollections: arr });
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
        console.log(this.props.location.state.key);
        return (
            <div className="container">
                <center style={{ marginTop: '15vh' }}>
                    {
                        !this.state.allCollections.length
                            ? <p> No NFTS </p>
                            : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Collection ID</th>
                                            <th>Prize</th>
                                            <th>Token Addr</th>
                                            <th>Token Id</th>
                                            <th>Collateral Locked</th>
                                            <th>Collateral Returned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.allCollections.map((item, key) => {
                                                return (
                                                    <tr key={key + 1}>
                                                        <td>{key + 1}</td>
                                                        <td>{item.collectionId}</td>
                                                        <td>{item.price}</td>
                                                        <td>{item.tokenAddress}</td>
                                                        <td>{item.tokenId}</td>
                                                        <td>{item.collateralLocked ? 'Yes' : 'No'}</td>
                                                        <td>{item.collateralReturned ? 'Yes' : 'No'}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            )
                    }
                </center>
            </div>
        );
    }
}


export default ViewNFT;
