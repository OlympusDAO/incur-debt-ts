# 💳 Incur Debt CLI

Utility library to build calldata for Olympus Incur Debt partners.

### Installation

`npm install @olympusdao/incur-debt`
or
`yarn install @olympusdao/incur-debt`

### Use

A pool must have been created on the desired DEX before using this CLI.

Create a JSON file with the following information:

- Chain ID (Should always be 1 unless you are whitelisted for testing on Goerli)
- RPC Url (i.e. "https://goerli.infura.io/v3/00000000000000000000000000000000" but with your Infura or Alchemy key)
- Your multisig address
- The name of the DEX strategy you wish to use (i.e. "sushiswap")
- The address of the liquidity pool you wish to use on the DEX
- Your maximum allowed slippage level on deposit
- The amount of OHM you wish to borrow
  - NOTE: OHM uses 9 decimals so 10 OHM should be input as 10000000000
- If you are using Balancer as your DEX, an array of the other tokens you wish to deposit to the pool
- If you are using Balancer as your DEX, an array of the amounts of the previously specified other tokens you wish to deposit to the pool

Template:

```js
{
    "chainId": 0,
    "rpcUrl": "https://goerli.infura.io/v3/00000000000000000000000000000000",
    "sender": "0x0000000000000000000000000000000000000000",
    "strategy": "uniswap",
    "lpAddress": "0x0000000000000000000000000000000000000000",
    "slippage": 0.01,
    "ohmAmount": "0",
    "otherTokens": ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
    "otherTokenAmounts": ["100000000", "100000000000000000"]
}
```

An example for a OHM-DAI Sushiswap pool on Goerli can be found in `examples/goerli/goerliSushiParams.json` on Github

To build the calldata for adding liquidity, start a command line or terminal instance in the directory where your JSON file exists and run `npx incur-debt add-liq file.json` in the command line

### Current Status

Currently building transactions to add liquidity to Uniswap V2, Sushiswap, and Balancer pools is supported and has been tested. The Incur Debt Curve strategy has only a rudimentary implementation.
