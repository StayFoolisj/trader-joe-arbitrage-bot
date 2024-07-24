import { Contract } from "ethers";

export interface Pool {
    name: string;
    address: string;
    contract: Contract;
    token0: Token;
    token1: Token;
}

export interface Token {
    name: string;
    address: string;
    contract: Contract;
    decimals: number;
}

export interface Expenses {
    avaxPrice: number | null;
    avaxNetworkBaseFee: string | null;
    swapGasEstimationFee: string | null;
}