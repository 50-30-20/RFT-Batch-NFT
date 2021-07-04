const TokenFactory = artifacts.require("TokenFactory");
const RFTToken = artifacts.require("RFTToken");
const USDTToken = artifacts.require("USDTToken");
const Batch = artifacts.require("Batch");

const BigNumber = require('bignumber.js');

module.exports = async function (deployer, network, accounts) {
    const DEPLOYER_ADDRESS = accounts[0];

    await deployer.deploy(RFTToken);
    let rftToken = await RFTToken.deployed();
    
    //console.log('rftToken', rftToken);

    await deployer.deploy(USDTToken);
    let usdtToken = await USDTToken.deployed();
    //console.log('USDTToken', usdtToken);

    await deployer.deploy(TokenFactory, rftToken.address, usdtToken.address);
    let tokenFactory = await TokenFactory.deployed()

    await deployer.deploy(Batch, rftToken.address, usdtToken.address)
    let batchContract = await Batch.deployed()
    
    await rftToken.setOwner(batchContract.address);
}