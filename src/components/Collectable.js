import Web3 from 'web3';
import React, { Component } from 'react';
import './Collectable.css';
import TokenFactory from '../abis/TokenFactory.json'

const { create } = require('ipfs-http-client')
const client = create('http://ipfs.infura.io:5001')


class CreateHash extends Component {
    constructor(props) {
        super(props)

        this.state = {
            account: '',
            name: '',
            loading: true,
            description: '',
            buffer: null,
            image: '',
            ipfsHash: '',
            touched: {
                name: false,
                symbol: false
            }
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

        if (this.state.ipfsHash) {  
            console.log();
            await this.state.tokenFactory.methods.createCollectible(
                this.state.name,
                window.web3.utils.toWei(this.state.price.toString(), 'Ether') || 0,
                this.state.ipfsHash
            )
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
            })

        } else {
            alert('Document still uploading on IPFS')
        }
    }

    async handleFileInput(e) {
        this.setState({ loading: true })
        console.log('minor changes');
        let file;
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onloadend = async () => {
            this.setState({ buffer: Buffer(reader.result) })
            await client.add(this.state.buffer)
                .then(function (result) {
                    file = `https://ipfs.io/ipfs/${result.path}`
                    console.log('file', result.path);
                })

            console.log('file out', file);
            this.setState({ image: file });

            let ipfsHash;
            await client.add(Buffer.from(JSON.stringify({
                "name": this.state.name,
                "image": this.state.image,
                "description": this.state.description
                //"price": this.state.price
            })))
                .then(function (result) {
                    console.log('r', result.path);
                    //this.setState({ ipfsHash: `https://ipfs.io/ipfs/${result.path}` })
                    ipfsHash = `https://ipfs.io/ipfs/${result.path}`
                    console.log('IPFS', ipfsHash)
                })
                .catch(function (err) {
                    console.log('Fail: ', err)
                })
            
            console.log(ipfsHash);
            this.setState({ ipfsHash: ipfsHash })
            this.setState({ loading: false })
            console.log('ip',this.state);
        }
    }

    render() {
        return (
            <div className="main">
                <form onSubmit={this.handleSubmit}>
                    <div className="container">

                        <div className="form-el">
                            <label className='text-header1'>Name of the Diamond</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.name}
                                onChange={event => this.setState({ name: event.target.value })}
                            />
                        </div>

                        <div className="form-el">
                            <label className='text-header1'>Grade</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.description}
                                onChange={event => this.setState({ description: event.target.value })}
                            />
                        </div>

                        <div className="form-el">
                            <label className='text-header1'>Price</label> <br />
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.price}
                                onChange={event => this.setState({ price: event.target.value })}
                            />
                        </div>

                        <div className="form-el">
                            <label className='text-header1'>Image</label>
                            <input
                                id="myFile"
                                className="button-file"
                                name="filename"
                                type="file"
                                onChange={(e) => this.handleFileInput(e)}
                            />
                        </div>

                        <button type="submit" className="Button">Create</button>
                    </div>
                </form>
            </div>
        );
    }
}


export default CreateHash;
