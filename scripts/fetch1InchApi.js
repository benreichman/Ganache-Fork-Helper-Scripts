const ethers = require('ethers');
const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDTAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
const signer = provider.getSigner(0);
const fetch = require('node-fetch');
module.exports = async function (callback) {
    const axios = require('axios')
    var swapsArray = [];
    const tokensList = await axios.post('http://tokens.1inch.eth.link').then(result => {
        return (result.data.tokens);
    })
    const usdt = tokensList.filter(obj => {
        return obj.symbol === 'USDT'
    })
    const usdc = tokensList.filter(obj => {
        return obj.symbol === 'USDC'
    })
    const dai = tokensList.filter(obj => {
        return obj.symbol === 'DAI'
    })


    const supplyAmount = 1000;
    const formattedSupplyAmount = (BigInt(ethers.utils.parseUnits(String(supplyAmount), selectedToken[0].decimals)))
    const selectedToken = tokensList.filter(obj => {
        return obj.symbol === 'yUSDCv2'
    })

    await fetchPricesForward(selectedToken[0].address);

    async function fetchPricesForward(_tokenAddress) {
        var formattedUSDT = null;
        var formattedUSDC = null;
        var formattedDAI = null;
        var max = null;
        var maxReturnToken = null;
        var maxReturnTokenDecimals = null;
        var maxReturnTokenAddress = null;
        var maxParsed = null;
        await axios.get('https://api.1inch.io/v4.0/1/quote?fromTokenAddress=' + _tokenAddress + '&toTokenAddress=' + USDTAddress + '&amount=' + formattedSupplyAmount).then(res => {
            formattedUSDT = ethers.utils.formatUnits(res.data.toTokenAmount, usdt[0].decimals);
            max = formattedUSDT;
            maxReturnToken = 'USDT'
            maxReturnTokenDecimals = 6
            maxParsed = res.data.toTokenAmount;
            maxReturnTokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
        })
        await axios.get('https://api.1inch.io/v4.0/1/quote?fromTokenAddress=' + _tokenAddress + '&toTokenAddress=' + USDCAddress + '&amount=' + formattedSupplyAmount).then(res => {
            formattedUSDC = ethers.utils.formatUnits(res.data.toTokenAmount, usdc[0].decimals);
            if (formattedUSDC > max) {
                max = formattedUSDC
                maxReturnToken = 'USDC'
                maxReturnTokenDecimals = 6
                maxParsed = res.data.toTokenAmount;
                maxReturnTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
            }
        })
        await axios.get('https://api.1inch.io/v4.0/1/quote?fromTokenAddress=' + _tokenAddress + '&toTokenAddress=' + DAIAddress + '&amount=' + formattedSupplyAmount).then(res => {
            formattedDAI = ethers.utils.formatUnits(res.data.toTokenAmount, dai[0].decimals);
            if (formattedDAI > max) {
                max = formattedDAI
                maxReturnToken = 'DAI'
                maxReturnTokenDecimals = 18;
                maxParsed = res.data.toTokenAmount;
                maxReturnTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
            }
        })
        const formattedResults = [formattedUSDT, formattedUSDC, formattedDAI];
        console.log(
            selectedToken[0].name + " -> USDT " + formattedUSDT + "\n" + selectedToken[0].name + " -> USDC " + formattedUSDC + '\n' + selectedToken[0].name + ' -> DAI ' + formattedDAI
        )
        console.log('Max Return Forward : ' + max + '\n')

        const signerAddresses = await provider.listAccounts()
        console.log(signerAddresses[0])
        var temp = (parseFloat(max)).toFixed(2)
        console.log(max)
        console.log(temp)
        var temp2 = temp * (10 ** maxReturnTokenDecimals)
        console.log(temp2)

        await fetch('https://api.1inch.io/v4.0/1/swap?fromTokenAddress=' + selectedToken[0].address + '&toTokenAddress=' + maxReturnTokenAddress + '&amount=' + formattedSupplyAmount + '&fromAddress=' + signerAddresses[0] + '&slippage=1&disableEstimate=true').then(res => res.json()).then(res => {
            console.log(res.tx)
            swapsArray.push(res.tx);
        });
        fetchBackward(max, maxParsed, maxReturnToken, maxReturnTokenDecimals)


    }
    async function fetchBackward(_max, _maxParsed, _maxToken, _maxDecimals) {
        var temp = (parseFloat(_max)).toFixed(2)
        formattedAmtUSDT = (temp * (10 ** 6))
        formattedAmtUSDC = (temp * (10 ** 6))
        formattedAmtDAI = (temp * (10 ** 18))
        var reversedAmt = null;
        var max2 = null;
        const reversedUSDT = await axios.get('https://api.1inch.io/v4.0/1/quote?fromTokenAddress=' + usdt[0].address + '&toTokenAddress=' + selectedToken[0].address + '&amount=' + formattedAmtUSDT).then(res => {
            console.log('USDT -> ' + selectedToken[0].name + ': ' + ethers.utils.formatUnits(res.data.toTokenAmount, selectedToken[0].decimals) + ' ' + selectedToken[0].name);
            var temp = (ethers.utils.formatUnits(res.data.toTokenAmount, selectedToken[0].decimals))
            console.log(temp)
            console.log(temp > max2)
            max2 = temp;
        })
        const reversedUSDC = await axios.get('https://api.1inch.io/v4.0/1/quote?fromTokenAddress=' + usdc[0].address + '&toTokenAddress=' + selectedToken[0].address + '&amount=' + formattedAmtUSDT).then(res => {
            console.log('USDC -> ' + selectedToken[0].name + ': ' + ethers.utils.formatUnits(res.data.toTokenAmount, selectedToken[0].decimals) + ' ' + selectedToken[0].name);
            var temp2 = (ethers.utils.formatUnits(res.data.toTokenAmount, selectedToken[0].decimals))
            console.log(temp2)
            console.log(temp2 > max2)
            if (temp2 > max2) {
                max2 = temp2;
            }
        })
        try {
            const reversedDAI = await axios.get('https://api.1inch.io/v4.0/1/quote?fromTokenAddress=' + dai[0].address + '&toTokenAddress=' + selectedToken[0].address + '&amount=' + formattedAmtUSDT).then(res => {
                console.log('DAI -> ' + selectedToken[0].name + ': ' + ethers.utils.formatUnits(res.data.toTokenAmount, selectedToken[0].decimals) + ' ' + selectedToken[0].name);
                var temp = (ethers.utils.formatUnits(res.data.toTokenAmount, selectedToken[0].decimals))
                console.log(temp)
                console.log(temp > max2)
                if (temp > max2) {
                    max2 = temp;
                }
            })
        } catch (error) {
            console.log('DAI -> !Error: Likely insufficient liquidity!')

        }
        console.log('Max Return Backwards : ' + max2)
        callback();
    }

}