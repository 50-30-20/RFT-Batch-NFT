import Web3 from 'web3';
import React, { Component } from 'react';
import './style.css';


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
        // this.handleBlur = this.handleBlur.bind(this);
        // this.validate = this.validate.bind(this);
        // this.handleInputChange = this.handleInputChange.bind(this);

        // this.loadWeb3 = this.loadWeb3.bind(this)
        // this.loadBlockchainData = this.loadBlockchainData.bind(this)
    }

    async componentWillMount() {
        // await this.loadWeb3()
        // await this.loadBlockchainData()
    }

    async loadWeb3() {
        // if (window.ethereum) {
        //     window.web3 = new Web3(window.ethereum)
        //     await window.ethereum.enable()
        // }
        // else if (window.web3) window.web3 = new Web3(window.web3.currentProvider)
        // else window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }

    async loadBlockchainData() {
        const web3 = window.web3
        // const accounts = await web3.eth.getAccounts()
        // this.setState({ account: accounts[0] })

        // // const networkId = await web3.eth.net.getId()
        // // const networkData = Token.networks[networkId]

        // // if (networkData) {
        // //   const film = new web3.eth.Contract(Token.abi, networkData.address)
        // //   this.setState({ film })

        // this.setState({ loading: false })

        // // } else {
        // //   window.alert("FilmFactory contract is not deployed to detected network")
        // }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log(this.state.loading);
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
            this.setState({ image: file })

            let ipfsHash
            client.add(Buffer.from(JSON.stringify({
                "name": this.state.name,
                "image": this.state.image,
                "description": this.state.description
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
            this.setState({ loading: true })
        }
    }

    render() {

        return (
            <div className="main">
                <form onSubmit={this.handleSubmit}>
                    <div className="container">

                        <div className="form-group">
                            <label className='text-header1'>Name of the Diamond</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.name}
                                onChange={event => this.setState({ name: event.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className='text-header1'>Grade</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.description}
                                onChange={event => this.setState({ description: event.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className='text-header1'>Image</label>
                            <br />
                            <input
                                id="myFile"
                                name="filename"
                                type="file"
                                onChange={(e) => this.handleFileInput(e)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Submit</button>
                    </div>
                </form>
            </div>
        );
    }
}


export default CreateHash;