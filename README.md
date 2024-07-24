# Simple Arbitrage Bot

This project demonstrates a basic arbitrage bot for on-chain trading on the Trader Joe DEX on Avalanche. It monitors multiple token pairs across different liquidity pools, identifies potential arbitrage opportunities, and executes trades when profitable.

## Features

- Real-time monitoring of multiple liquidity pools
- Computes arbitrage opportunities directly from swap event data
- Configurable profit thresholds
- Gas price optimization for trade execution
- Support for multiple token pairs (USDT, MIM, USDC, DAI)

## Prerequisites

Before running this bot, ensure you have the following:

- Node.js (v17 or later)
- npm (Node Package Manager)
- An Ethereum wallet with some funds for trading and gas fees
- Access to an Ethereum node (e.g., Infura, Alchemy, or your own node)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/simple-arbitrage-bot.git
   cd simple-arbitrage-bot
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your configuration:
   ```
   TRADER_ACCOUNT_PUBLIC_KEY=your_ethereum_wallet_public_key
   NODE_URL=your_websocket_provider_url
   ```

## Usage

To start the arbitrage bot, run:

```
npm start
```

The bot will begin monitoring the specified liquidity pools and print information about potential arbitrage opportunities. 

## Disclaimer

This bot is for educational purposes only. Trading cryptocurrencies carries a high level of risk, and may not be suitable for all investors. Before deciding to trade cryptocurrency you should carefully consider your investment objectives, level of experience, and risk appetite.



## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check [issues page](https://github.com/yourusername/simple-arbitrage-bot/issues) if you want to contribute.

## Contact
Sam Amundsen - Telegram @stay_foolisj