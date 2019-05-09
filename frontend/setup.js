Web3 = require("web3");
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
contractJSON = require("../build/contracts/Roulette.json");

async function getSpin() {
    let networkId = await web3.eth.net.getId();
    console.log(networkId);
    const deployedAddress = contractJSON.networks[networkId].address;
    const contract = new web3.eth.Contract(contractJSON.abi, deployedAddress);
    let result = await contract.methods.spin().call();
    return parseInt(result._hex, 16);
}

module.exports = getSpin;
