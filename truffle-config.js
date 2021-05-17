require('dotenv').config();
require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          process.env.METAMASK_WALLET_SECRET,
          'https://rinkeby.infura.io/v3/e95c6744ded94bbe81e881b8ca002ce7'
        )
      },
      networkCheckTimeout: 100000,
      network_id: 4,
      skipDryRun: true
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: '0.8.0+commit.c7dfd78e',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
}
