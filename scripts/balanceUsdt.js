const { ethers } = require('ethers')
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
const signer = provider.getSigner();
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')

const path = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const usdt = new ethers.Contract(path, IERC20.abi, provider) // Path[1] will always be the token we are buying.

module.exports = async function (callback) {
    const signerArray = await provider.listAccounts();
    console.log('SignerArray[0]: ' + signerArray[0])
    const balance = await usdt.balanceOf(signerArray[0])
    var balHere = parseInt(balance);
    console.log(ethers.utils.formatUnits(balHere, 6))

    callback();
}