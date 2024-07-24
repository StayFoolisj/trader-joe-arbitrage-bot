import { ethers } from "ethers";

import { 
    POOL_ABI,
    USDT_ABI, 
    MIM_ABI, 
    USDC_ABI, 
    DAI_ABI, 
    TRADER_JOE_ROUTER_ABI,
    ORACLE_ABI
} from "./abis";

import { Pool, Token } from "./types";
import { webSocketProvider } from "./config";

const traderJoeRouterAddress = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'
export const traderJoeRouter = new ethers.Contract(traderJoeRouterAddress, TRADER_JOE_ROUTER_ABI, webSocketProvider);
export const avaxOracle = new ethers.Contract('0x0a77230d17318075983913bc2145db16c7366156', ORACLE_ABI, webSocketProvider)

// pool addresses
const mimUsdtEAddress = '0xeaae66c72513796363181e0d3954a15a0a64cc22'
const mimUsdcEaddress = '0x50141c21e4e861d4b2cbeb825b9a2b5e5e09a186'
const usdcUsdcEAddress = '0x2a8a315e82f85d1f0658c5d66a452bbdd9356783'
const usdcEUsdtEAddress = '0x2e02539203256c83c7a9f6fa6f8608a32a2b1ca2'
const usdtUsdtEAddress = '0x74b651eff97871ea99fcc14423e611d85eb0ea93'
const usdtEDaiEAddress = '0xa6908c7e3be8f4cd2eb704b5cb73583ebf56ee62'
const usdcEDaiEAddress = '0x63abe32d0ee76c05a11838722a63e012008416e6'
const usdcMimAddress = '0xa503a768aaff4237a5ebb1b7d3177703b56901eb'

// token addresses
export const usdtAddress = '0xc7198437980c041c805a1edcba50c1ce5db95118'
export const usdcAddress = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'
const mimAddress = '0x130966628846bfd36ff31a822705796e8cb8c18d'
const daiAddress = '0xd586e7f844cea2f87f50152665bcbc2c279d8d70'

export let stableCoins: Token[] = [
    {
        name: 'USDT',
        address: usdtAddress,
        contract: new ethers.Contract(usdtAddress, USDT_ABI, webSocketProvider),
        decimals: 6,
    },
    {
        name: 'MIM',
        address: mimAddress,
        contract: new ethers.Contract(mimAddress, MIM_ABI, webSocketProvider),
        decimals: 18,
    },
    {
        name: 'USDC',
        address: usdcAddress,
        contract: new ethers.Contract(usdcAddress, USDC_ABI, webSocketProvider),
        decimals: 6,
    },
    {
        name: 'DAI',
        address: daiAddress,
        contract: new ethers.Contract(daiAddress, DAI_ABI, webSocketProvider),
        decimals: 18,
    },
];

export let pools: Pool[] = [
    {
        name: '[MIM/USDT.e]-[TRADER JOE]',
        address: mimUsdtEAddress,
        contract: new ethers.Contract(mimUsdtEAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'MIM')!,
        token1: stableCoins.find(x => x.name === 'USDT')!,
    },
    {
        name: '[MIM/USDC.e]-[TRADER JOE]',
        address: mimUsdcEaddress,
        contract: new ethers.Contract(mimUsdcEaddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'MIM')!,
        token1: stableCoins.find(x => x.name === 'USDC')!
    },
    {
        name: '[USDC/USDC.e]-[TRADER JOE]',
        address: usdcUsdcEAddress,
        contract: new ethers.Contract(usdcUsdcEAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'USDC')!,
        token1: stableCoins.find(x => x.name === 'USDC')!
    },
    {
        name: '[USDC.e/USDT.e]-[TRADER JOE]',
        address: usdcEUsdtEAddress,
        contract: new ethers.Contract(usdcEUsdtEAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'USDC')!,
        token1: stableCoins.find(x => x.name === 'USDT')!
    },
    {
        name: '[USDT/USDT.e]-[TRADER JOE]',
        address: usdtUsdtEAddress,
        contract: new ethers.Contract(usdtUsdtEAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'USDT')!,
        token1: stableCoins.find(x => x.name === 'USDT')!
    },
    {
        name: '[USDT.e/DAI.e]-[TRADER JOE]',
        address: usdtEDaiEAddress,
        contract: new ethers.Contract(usdtEDaiEAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'USDT')!,
        token1: stableCoins.find(x => x.name === 'DAI')!
    },
    {
        name: '[USDC.e/DAI.e]-[TRADER JOE]',
        address: usdcEDaiEAddress,
        contract: new ethers.Contract(usdcEDaiEAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'USDC')!,
        token1: stableCoins.find(x => x.name === 'DAI')!
    },
    {
        name: '[USDC/MIM]-[TRADER JOE]',
        address: usdcMimAddress,
        contract: new ethers.Contract(usdcMimAddress, POOL_ABI, webSocketProvider),
        token0: stableCoins.find(x => x.name === 'USDC')!,
        token1: stableCoins.find(x => x.name === 'MIM')!
    }
];