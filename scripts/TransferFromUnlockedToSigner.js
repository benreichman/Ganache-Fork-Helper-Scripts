const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')
const UNLOCKED_ACCOUNT = '0x6555e1CC97d3cbA6eAddebBCD7Ca51d75771e0B8'
const { ethers } = require("ethers");
module.exports = async function (callback) {

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = provider.getSigner('UNLOCKED ACCOUNT: ' + UNLOCKED_ACCOUNT)
    await provider.getBlockNumber();
    const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const erc20Abi = IERC20.abi;
    const wethContract = new ethers.Contract(wethAddress, erc20Abi, signer);
    const signerAddresses = await provider.listAccounts()
    console.log('signerAddresses[0]: ' + signerAddresses[0])

    await transferWETH(signerAddresses[0])
    const wethBal = await wethContract.balanceOf(signer._address)
    console.log('WETH Balance UNLOCKED_ACCOUNT: ' + wethBal + '\n')
    const wethBaldep = await wethContract.balanceOf(signerAddresses[0])
    console.log('WETH Balance signerAddresses[0]: ' + wethBaldep)


    async function transferWETH(_temp) {
        const srcTokenDecimals = await wethContract.decimals()
        const amt = ethers.utils.parseUnits('200', srcTokenDecimals)
        try {
            const tx = await wethContract.transfer(_temp, amt)
            console.log(tx);
        } catch (error) {
            console.log('Tx Failed ! Balance may be insufficent...')
        }
    }

    callback();
}