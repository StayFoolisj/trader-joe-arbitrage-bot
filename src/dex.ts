import { BigNumber, Contract } from "ethers";


/**
 * Calculates the max amount of token given a known quantity of token_out
 * @param {int} poolReservesToken0 - Pool Reserve of token0
 * @param {int} poolReservesToken1 - Pool Reserve of token1
 * @param {int} token0PerToken1 - Ratio of token0 to token1
 * @param {int} token0Out - Amount of token0 to be output
 * @param {int} token1Out - Amount of token1 to be output
 */
export function getTokensInForRatioOut(
    poolReservesToken0: number,
    poolReservesToken1: number,
    token0PerToken1: number,
    token0Out: boolean = false,
    token1Out: boolean = false,
    fee: number = 0.0
): number {
    // Safety checks
    if (token0Out && token1Out) { 
        throw Error("getTokensInForRatioOut() failure: Both token0 and token1 inputted") 
    }

    // token1 input, token0 output
    if (token0Out) {
        // dy = x0/C - y0/(1-fee)
        // C = ratio of token0 (dx) to token1 (dy)
        const dy = poolReservesToken0 / token0PerToken1 - poolReservesToken1 / (1 - fee)
        if (dy > 0) {
            return dy
        } else {
            return 0
        }
    }
        
    // token0 input, token1 output
    if (token1Out) {
        // dx = y0*C - x0/(1-fee)
        // C = ratio of token0 (dxy) to token1 (dy)
        const dx = poolReservesToken1 * token0PerToken1 - poolReservesToken0 / (1 - fee)
        if (dx > 0) {
            return dx
        } else {
            return 0
        }
    }

    return 0
}


/**
 * Dynamically calculates token input and output using the reserves of a pool only
 * The main advantage is of boosted performance and efficiency. 
 * With this method we know by certainty what the pool will provide without asking it
 * 
 * @param {int} poolReservesToken0 - Pool Reserve of token0
 * @param {int} poolReservesToken1 - Pool Reserve of token1
 * @param {int} quantityToken0In - Amount of token0 to be input
 * @param {int} quantityToken1In - Amount of token0 to be output
 * @param {float} fee - Amount of token1 to be output
 */
export function getTokensOutForTokensIn(
    poolReservesToken0: number,
    poolReservesToken1: number,
    quantityToken0In: number,
    quantityToken1In: number,
    fee: number = 0.0
): number {   

    // Safety checks
    if (quantityToken0In && quantityToken1In) { 
        throw Error("getTokensOutForTokensIn() failure: Both token0 and token1 inputted") 
    }

    if (quantityToken0In) {
        return Math.floor((poolReservesToken1 * quantityToken0In * (1 - fee)) / (poolReservesToken0 + quantityToken0In) * (1 - fee))
    }

    if (quantityToken1In) {
        return Math.floor((poolReservesToken0 * quantityToken1In * (1 - fee)) / (poolReservesToken1 + quantityToken1In) * (1 - fee))
    }
    
    return 0
}

/**
 * This function computes a priority fee which is a product of estimated gas costs, 
    native token price and how much of our EV we are willing to spend in order to win the trade. 
    
    Useful in order to win against other arbitreugers. 
    Example: 
    get_scaled_priority_fee(base_fee=25000000000, swap_ev=100, gas_limit=125000, price_of_wei=100/(10**18), fee_ratio=0.10)
    >> 775000000000

    So for $100 of trade EV, at 10% fee ratio, $100 AVAX, and a typical token swap gas limit of 125,000, we can safely bid 
    up to 775,000,000,000 Wei, which is 775 Gwei. Note that this is $10 of gas, which is quite high for the Avalanche 
    network given its typical traffic and congestion.

    PS Only applicable to networks using EIP-1559, meaning for example ETH, AVAX but not FTM.
 * @param {int} baseFee - the network base fee
 * @param {float} swapEv - the expected positive value of the swap (represented by $ amount)
 * @param {int} gasLimit - the estimated gas cost in units of gas as denominated in native token 
 * @param {float} priceOfWei - a product of native token price and gas costs
 * @param {int} feeRatio - total gas spend / profit
 */
export function getScaledPriorityFee(
    baseFee: number, 
    swapEv: number, 
    gasLimit: number, 
    priceOfWei: number, 
    feeRatio: number
): number {
    return Math.floor(swapEv * feeRatio / (gasLimit * priceOfWei)) - baseFee
}


/**
 * Returns the latest price from a Chainlink Oracle
 * @param {object} oracleContract - Contract of the Chainlink Oracle
 * @returns {float} fee - Latest token price in USD
 */
export async function getNativeTokenPrice(oracleContract: Contract): Promise<number> {   
    let price = await oracleContract.latestRoundData()
    return price.answer.toString() / (10**8) // All Chainlink oracle prices are using 8 decimals
}

/**
 * Returns the network Base fee in Gwei
 * @param eth provider instance
 * @returns {Promise<string>} A promise that resolves to the current gas price as a string.
 */
export async function getNetworkBaseFee(provider: any): Promise<string> {
    let feeData = await provider.getFeeData()
    return feeData.gasPrice.toString()
}

/**
 * Gets an estimate for gas limit (units of gas) expressed in Gwei
 * @param {object} dexRouterContract - Contract object of the DEX router 
 * @param {str} tokenInAddress - Address of the input token
 * @param {str} tokenOutAddress - Address of the output token 
 * @param {int} tokenInAmount - Amount of input token denominated in Wei
 * @param {int} tokenOutAmount - Amount of output token denominated in Wei
 * @param {str} userAddress - Address to perform the swap 
 * (PS: Ensure this address has enough of the input and output token as it impacts the gas estimation) 
 * @returns {str} gasLimit - upper gas limit estimation denominated in Gwei
 */
export async function estimateGasLimitForTokenSwap(
    dexRouterContract: Contract,
    tokenInAddress: string,
    tokenOutAddress: string,
    tokenInAmount: BigNumber,
    tokenOutAmount: BigNumber,
    userAddress: string
): Promise<string> {
    // Uniswap requires a deadline for the swap. 30 minutes from now expressed as milliseconds since epoch 
    let now = new Date
    const deadline = now.setTime(now.getTime() + (30 * 60 * 1000)) 
    const gasLimit = await dexRouterContract.estimateGas.swapExactTokensForTokens(
        tokenInAmount,
        tokenOutAmount,
        [
            tokenInAddress,
            tokenOutAddress
        ],
        userAddress,
        deadline,
        {
            from: userAddress
        }
    )
    return gasLimit.toString()
}


/**
 * Swaps an exact amount of input tokens for as many output tokens as possible, 
 * along the route determined by the path. The first element of path is the 
 * input token, the last is the output token, and any intermediate elements 
 * represent intermediate pairs to trade through (if, for example, a direct 
 * pair does not exist).
 * 
 * Ref: https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokens
 * @param {object} dexRouterContract - Contract object of the DEX router 
 * @param {str} tokenInAddress - Address of the input token
 * @param {str} tokenOutAddress - Address of the output token 
 * @param {int} tokenInAmount - Amount of input token denominated in Wei
 * @param {int} tokenOutAmount - Amount of output token denominated in Wei
 * @param {int} priorityFee - The miner bribe to attempt to win the tx
 * @param {str} userAddress - Address to perform the swap 
 * @returns {str} tx - 
 */
 export async function tokenSwap(
    dexRouterContract: Contract,
    tokenInAddress: string,
    tokenOutAddress: string,
    tokenInAmount: BigNumber,
    tokenOutAmount: BigNumber,
    priorityFee: BigNumber,
    userAddress: string
) {
    // Uniswap requires a deadline for the swap. 30 minutes from now expressed as milliseconds since epoch 
    let now = new Date
    const deadline = now.setTime(now.getTime() + (30 * 60 * 1000)) 

    try {
        const tx = await dexRouterContract.swapExactTokensForTokens(
            tokenInAmount,
            tokenOutAmount,
            [
                tokenInAddress,
                tokenOutAddress
            ],
            userAddress,
            deadline,
            {
                from: userAddress,
                priority_fee: priorityFee
            }
        )
        return tx
    } catch (error) {
        console.log(error)
    }
}