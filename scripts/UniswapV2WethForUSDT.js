
const { ethers, utils, BigNumber } = require('ethers')
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
const signer = provider.getSigner(0);
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json")
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')
const uFactoryAddress = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const uRouterAddress = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
const uFactory = new ethers.Contract(uFactoryAddress, IUniswapV2Factory.abi, signer)
const uRouter = new ethers.Contract(uRouterAddress, IUniswapV2Router02.abi, signer)
const WETH = new ethers.Contract('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', IERC20.abi, signer)
const SLIPPAGE = 0.02
module.exports = async function (callback) {
    const signerArray = await provider.listAccounts();
    console.log(signerArray);
    const path = ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xdAC17F958D2ee523a2206206994597C13D831ec7'];
    const pairAddress = await uFactory.getPair(path[0], path[1]);
    console.log('Pair address : ' + pairAddress )

    const uPair = new ethers.Contract(pairAddress, IUniswapV2Pair.abi, signer)

    const reserves = await uPair.getReserves()
    console.log(ethers.utils.formatUnits(reserves[0],6) + 'USDT');
    console.log(ethers.utils.formatUnits(reserves[1], 18) + ' WETH \n');

    if (reserves[0] == 0 && reserves[1] == 0) {
        console.log(`Token has no liquidity...`)
        return
    }
    const amountIn = ethers.utils.parseUnits('100', 18);
    const amounts = await uRouter.getAmountsOut(amountIn, path)
    // console.log(amounts)
    const deadline = Date.now() + 1000 * 60 * 10
    console.log(deadline)
    try {
        console.log('Approving....')
        const tx =  await WETH.approve(uRouter.address, amountIn)
        console.log('Approved.\n')
        const gasEstimation = await uRouter.estimateGas.swapExactTokensForTokens(amountIn, amounts[1], path, signerArray[0], deadline);
        console.log("Gas price "+ gasEstimation)
        console.log('Swapping........\n')
        const swap = await uRouter.swapExactTokensForTokens(amountIn, amounts[1], path, signerArray[0], deadline);
        console.log(swap.hash)
        console.log(`Swap Successful\n`)
    } catch (error) {
        console.log(`Error Occured while swapping...`)
        console.log(`You may need to adjust slippage, or amountIn.\n`)
        console.log(error)

    }
    callback();
}