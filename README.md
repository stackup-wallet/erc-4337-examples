![](https://i.imgur.com/Ym2VV8z.png)

# Getting started

A collection of example scripts for working with ERC-4337. For an overview on the EIP and account abstraction, see our docs [here](https://docs.stackup.sh/).

All scripts in this repository is built using [@account-abstraction/sdk](https://www.npmjs.com/package/@account-abstraction/sdk). The implementation of all the following commands are located in the [scripts directory](./scripts/).

# Setup

Clone this repo into your local environment:

```bash
git clone git@github.com:stackup-wallet/erc-4337-examples.git
```

Install dependencies:

```bash
yarn install
```

## Init config

These config values will be used for all documented [commands](#commands).

```bash
yarn run init
```

### `bundlerUrl`

**Default value is set to `http://localhost:4337`.**

All UserOperations are required to be sent to a bundler. This field specifies the URL for the bundler you want to use.

You can run a self-hosted instance with [stackup-bundler](https://github.com/stackup-wallet/stackup-bundler). **Fully managed instances are also available. If you would like one setup, come [talk to us](https://discord.gg/FpXmvKrNed)!**

### `rpcUrl`

**Default value is set to `https://rpc-mumbai.maticvigil.com/`.**

This is a standard RPC URL for an ethereum node. By default it uses the public RPC for Polygon mumbai testnet. You can change this to any network you like.

### `signingKey`

**Default value is randomly generated with ethers.js.**

All UserOperations have a `signature` field which smart contract wallets will use to validate transactions. This key will be used to sign all UserOperations and set as the owner for the smart contract wallet.

### `entryPoint`

**Default value is set to `0x1b98F08dB8F12392EAE339674e568fe29929bC47`.**

This is address of the singleton EntryPoint contract. It is the same on all networks.

### `simpleWalletFactory`

**Default value is set to `0xE6aFCD2B4e085F44596b925E401DeA5bB544399A`.**

This is factory address for deploying [SimpleWallet.sol]. It is the same on all networks and allows us to generate deterministic addresses.

# Commands

Once you have an environment setup, these commands can be used for running the example scripts.

The location of each script mimics the command structure. For example `yarn run simpleWallet:address` will be located in `scripts/simpleWallet/address.ts`

## Simple Wallet

Scripts for managing accounts based on [SimpleWallet.sol](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleWallet.sol).

### Get wallet address

Smart contract wallet addresses can be deterministically generated. Use this command to get your wallet address based on the `signingKey` set in your `config.json`.

```bash
yarn run simpleWallet:address
```

# License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

# Contact

Feel free to direct any technical related questions to the `dev-hub` channel in the [Stackup Discord](https://discord.gg/FpXmvKrNed).
