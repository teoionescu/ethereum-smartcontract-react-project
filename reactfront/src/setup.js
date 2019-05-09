
let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

let contractJSON = require("./roulette.js");

// USAGE:
// https://techbrij.com/setup-local-private-blockchain-deploy-smart-contract-ethereum-dapp-part-2
// truffle develop > console
// truffle compile
// truffle migrate --reset

async function getSpin() {
    let networkId = await web3.eth.net.getId();
    // console.log(networkId);
    const deployedAddress = contractJSON.networks[networkId].address;
    const contract = new web3.eth.Contract(contractJSON.abi, deployedAddress);
    let result = await contract.methods.spin().call();
    return parseInt(result._hex, 16);
}

module.exports = getSpin;
