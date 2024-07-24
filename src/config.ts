import dotenv from 'dotenv'; 
dotenv.config(); 

import { ethers } from "ethers";

function getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required environment variable "${name}" is not set.`);
    }
    return value;
}

// A websocket RPC URL for the Avalanche network
export const NODE_URL = getRequiredEnvVar('NODE_URL');

// The public key of the account that will be executing the swaps
export const userAddress = getRequiredEnvVar('TRADER_ACCOUNT_PUBLIC_KEY');

// The USD denominated amount to swap
export const swapAmountUsd = 50

// The target profit in USD. If set to 3, it will only execute swaps where the estimated EV is greater than $3
export const profitTarget = 3

// Trader Joe's 0.3% swap fee (per side)
export const swapFee = 0.003;

export const webSocketProvider = new ethers.providers.WebSocketProvider(NODE_URL);