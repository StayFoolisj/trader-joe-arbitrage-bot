import { ethers, BigNumber, Contract } from "ethers";


import { 
    getTokensInForRatioOut, 
    getTokensOutForTokensIn,
    getScaledPriorityFee,
    getNativeTokenPrice,
    getNetworkBaseFee,
    estimateGasLimitForTokenSwap,
    tokenSwap
} from "./dex";

import {
    traderJoeRouter,
    usdtAddress,
    usdcAddress,
    avaxOracle,
    pools
} from "./contracts";

import {
    userAddress,
    webSocketProvider,
    swapAmountUsd,
    profitTarget,
    swapFee,
} from "./config";


import { Pool, Expenses } from "./types";

// Initialize variables to store pool state and calculation results
let x0: number
let y0: number
let rate: number
let ratio0to1: number
let ratio1to0: number
let tokensOut0to1: number
let tokensOut1to0: number
let priorityFee: number
let swapExtractedValue: number

/**
 * Sets up an event listener for the 'Sync' event on a given liquidity pool.
 * This function continuously monitors the pool for reserve changes and checks for arbitrage opportunities.
 *
 * @async
 * @function swapEventListener
 * @param {Object} pool - The liquidity pool object to monitor.
 * @param {Contract} pool.contract - The ethers.js Contract instance for the pool.
 * @param {Object} pool.token0 - The first token in the pool.
 * @param {Object} pool.token1 - The second token in the pool.
 * @param {Contract} pool.token0.contract - The ethers.js Contract instance for token0.
 * @param {Contract} pool.token1.contract - The ethers.js Contract instance for token1.
 *
 * @description
 * This function does the following:
 * 1. Sets up variables to store pool state and calculation results.
 * 2. Caches the decimal places for both tokens to avoid repeated async calls.
 * 3. Listens for 'Sync' events on the pool contract.
 * 4. When an event is received, it:
 *    - Updates the reserves (x0 and y0) with the new values.
 *    - Calculates the current exchange rate between the tokens.
 *    - Determines the maximum tokens that can be swapped in both directions.
 *    - Calculates the expected output for these maximum swaps.
 *    - Checks for arbitrage opportunities in both directions.
 *
 * @note
 * This function is designed for high-frequency events. It minimizes variable declarations
 * and async operations within the event handler to optimize performance.
 *
 * @throws Will throw an error if there are issues with contract interactions or calculations.
 */
async function swapEventListener(pool: Pool) {
    pool.contract.on("Sync", async (
        reserve0: BigNumber,
        reserve1: BigNumber
        // adddress, 
        // amount0In, 
        // amount1In, 
        // amount0Out, 
        // amount1Out, 
        // to
    ) => {
        console.log({
            reserve0: reserve0,
            reserve1: reserve1
        })

    x0 = parseFloat(ethers.utils.formatUnits(reserve0, pool.token0.decimals));
    y0 = parseFloat(ethers.utils.formatUnits(reserve1, pool.token1.decimals));
    rate = x0 / y0;
    console.log(rate)

    // Get max tokens out that fits our profit treshold
    ratio0to1 = getTokensInForRatioOut(x0, y0, swapAmountUsd, false, true, swapFee)
    ratio1to0 = getTokensInForRatioOut(x0, y0, swapAmountUsd, true, false, swapFee)

    // Pre-compute precisely how many tokens we will receive from the optimized ratio
    tokensOut0to1 = getTokensOutForTokensIn(x0, y0, ratio0to1, 0, swapFee)
    tokensOut1to0 = getTokensOutForTokensIn(x0, y0, 0, ratio1to0, swapFee)

    if (tokensOut0to1) {
        // calculate our EV (Extracted Value) from the swap
        swapExtractedValue = (rate + 1) * tokensOut0to1;

        
        // calculate our bribe priority fee
        if (expenses.avaxNetworkBaseFee && expenses.swapGasEstimationFee && expenses.avaxPrice) {
            priorityFee = getScaledPriorityFee(
                parseFloat(expenses.avaxNetworkBaseFee),
                swapExtractedValue,
                parseFloat(expenses.swapGasEstimationFee),
                expenses.avaxPrice,
                0.1
            );
        } else {
            console.log('Unable to calculate priority fee due to missing data');
            priorityFee = 0;
        }

        console.log('Pool:', pool.name);
        console.log('MaxOut:', ratio0to1 * (10**pool.token1.decimals), '(', rate, ')');
        console.log('tokensOut: $', tokensOut0to1.toFixed(4), 'USD');
        console.log('');

        if (swapExtractedValue > profitTarget) {
            try {
                const tokenInAmount = ethers.utils.parseUnits(ratio0to1.toString(), pool.token0.decimals);
                const tokenOutAmount = ethers.utils.parseUnits(tokensOut0to1.toString(), pool.token1.decimals);
                
                const tx = await tokenSwap(
                    traderJoeRouter,
                    pool.token0.address,
                    pool.token1.address,
                    tokenInAmount,
                    tokenOutAmount,
                    ethers.utils.parseUnits(priorityFee.toString(), 'gwei'),
                    userAddress
                );

                console.log('Swap transaction initiated:', tx.hash);
                const receipt = await tx.wait();
                console.log('Swap transaction confirmed:', receipt.transactionHash);
            } catch (error) {
                console.error('Error executing swap:', error);
            }
        }
    }

    if (tokensOut1to0) {
        // calculate our EV (Extracted Value) from the swap
        swapExtractedValue = (rate + 1) * tokensOut1to0;

        // calculate our bribe priority fee
        if (expenses.avaxNetworkBaseFee && expenses.swapGasEstimationFee && expenses.avaxPrice) {
            priorityFee = getScaledPriorityFee(
                parseFloat(expenses.avaxNetworkBaseFee),
                swapExtractedValue,
                parseFloat(expenses.swapGasEstimationFee),
                expenses.avaxPrice,
                0.1
            );
        } else {
            console.log('Unable to calculate priority fee due to missing data');
            priorityFee = 0;
        }

        console.log('Pool:', pool.name);
        console.log('MaxOut:', ratio1to0 * (10**pool.token1.decimals), '(', rate, ')');
        console.log('tokensOut: $', tokensOut1to0.toFixed(4), 'USD');
        console.log('');

        if (swapExtractedValue > profitTarget) {
            try {
                const tokenInAmount = ethers.utils.parseUnits(ratio1to0.toString(), pool.token0.decimals);
                const tokenOutAmount = ethers.utils.parseUnits(tokensOut1to0.toString(), pool.token1.decimals);
                
                const tx = await tokenSwap(
                    traderJoeRouter,
                    pool.token0.address,
                    pool.token1.address,
                    tokenInAmount,
                    tokenOutAmount,
                    ethers.utils.parseUnits(priorityFee.toString(), 'gwei'),
                    userAddress
                );

                console.log('Swap transaction initiated:', tx.hash);
                const receipt = await tx.wait();
                console.log('Swap transaction confirmed:', receipt.transactionHash);
            } catch (error) {
                console.error('Error executing swap:', error);
            }
        }
    }
});
}



/**
 * Periodically updates network and token price information.
 * 
 * @async
 * @function runFrequently
 * @param {number} delay - The time in milliseconds between each update.
 * @param {Object} obj - An object to store the updated information.
 * @param {number} obj.avaxPrice - The price of AVAX, updated by this function.
 * @param {number} obj.avaxNetworkBaseFee - The current network base fee, updated by this function.
 * @param {number} obj.swapGasEstimationFee - The estimated gas fee for a swap, updated by this function.
 * 
 * @description
 * This function performs the following tasks:
 * 1. Updates the AVAX price using the AVAX oracle.
 * 2. Updates the current network base fee.
 * 3. Estimates the gas limit for a token swap using specific parameters.
 * 4. Schedules itself to run again after the specified delay.
 * 
 * @note
 * This function runs indefinitely, updating the provided object at regular intervals.
 * It's designed to keep network and price information current for use in arbitrage calculations.
 * 
 * @throws Will throw an error if there are issues with fetching prices or fees.
 */
async function runFrequently(delay: number, obj: Expenses): Promise<void> {
    obj.avaxPrice = await getNativeTokenPrice(avaxOracle)
    obj.avaxNetworkBaseFee = await getNetworkBaseFee(webSocketProvider)
    obj.swapGasEstimationFee = await estimateGasLimitForTokenSwap(
        traderJoeRouter,
        usdtAddress,
        usdcAddress,
        ethers.utils.parseUnits('5', 6),
        ethers.utils.parseUnits('1', 6),
        '0xf518FfEdE07512A3C24537fE6F4c6C7dBDacb418',
    )
    setTimeout(() => runFrequently(delay, obj), delay)
}
  


let expenses: Expenses = {
    avaxPrice: null,
    avaxNetworkBaseFee: null,
    swapGasEstimationFee: null
};
runFrequently(15000, expenses)


pools.map(poolContract => swapEventListener(poolContract))