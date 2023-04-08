![](https://i.imgur.com/Ym2VV8z.png)

# Getting started

A collection of example scripts for working with ERC-4337. For an overview on the EIP and account abstraction, see our docs [here](https://docs.stackup.sh/).

All scripts in this repository is built using [@account-abstraction/sdk](https://www.npmjs.com/package/@account-abstraction/sdk). The implementation of all the following commands are located in the [scripts directory](./scripts/).

## Table of contents

- [Getting started](#getting-started)
  - [Table of contents](#table-of-contents)
- [Setup](#setup)
  - [Init config](#init-config)
    - [`bundlerUrl`](#bundlerurl)
    - [`rpcUrl`](#rpcurl)
    - [`signingKey`](#signingkey)
    - [`entryPoint`](#entrypoint)
    - [`simpleAccountFactory`](#simpleaccountfactory)
    - [`paymasterUrl`](#paymasterurl)
- [Commands](#commands)
  - [Optional flags](#optional-flags)
    - [With Paymaster](#with-paymaster)
  - [Simple Account](#simple-account)
    - [Get account address](#get-account-address)
    - [Transfer ETH](#transfer-eth)
    - [Transfer ERC-20 token](#transfer-erc-20-token)
    - [Batch transfer ETH](#batch-transfer-eth)
    - [Batch transfer ERC-20 token](#batch-transfer-erc-20-token)
    - [Uniswap Approve and SwapExactETHForTokens on UniswapV2 Router](#uniswap-approve-and-swapexactethfortokens-on-uniswapv2-router)
- [License](#license)
- [Contact](#contact)

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

**Default value is set to `http://localhost:8545`.**

This is a standard RPC URL for an ethereum node. By default it uses the public RPC for Polygon mumbai testnet. You can change this to any network you like.

### `signingKey`

**Default value is randomly generated with ethers.js.**

All UserOperations have a `signature` field which smart contract accounts will use to validate transactions. This key will be used to sign all UserOperations and set as the owner for the smart contract account.

### `entryPoint`

**Default value is set to `0x0576a174D229E3cFA37253523E645A78A0C91B57`.**

This is address of the singleton EntryPoint contract. It is the same on all networks.

### `simpleAccountFactory`

**Default value is set to `0x71D63edCdA95C61D6235552b5Bc74E32d8e2527B`.**

This is the factory address for deploying [SimpleAccount.sol](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol). It is the same on all networks and allows us to generate deterministic addresses.

_The default factory deploys a [forked version of `SimpleAccount.sol`](https://github.com/hazim-j/account-abstraction/blob/7f31abdd702772890a6633af70e1598e23f9b177/contracts/samples/SimpleAccount.sol#L98) with a one line change to make calling batched transactions easier._

### `paymasterUrl`

**Default value is an empty string.**

This field specifies the URL to request paymaster approval when using the `--withPaymaster` flag. The examples assume that any paymaster service follows the interface specified [here](https://docs.stackup.sh/docs/api/paymaster/rpc-methods).

# Commands

Once you have an environment setup, these commands can be used for running the example scripts.

The location of each script mimics the command structure. For example `yarn run simpleAccount address` will be located in `scripts/simpleAccount/address.ts`

## Optional flags

All commands below can be augmented with the following flags.

### With Paymaster

Appending `--withPaymaster` to any command will send UserOperations to the `paymasterUrl` specified in the config for approval. If successful, gas for this transaction will be paid for by the paymaster.

Example:

```bash
yarn run simpleAccount:erc20Transfer --withPaymaster ...
```

In this example, the contract account does not need to hold any ETH for gas fees.

---

## Simple Account

Scripts for managing accounts based on [SimpleAccount.sol](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol).

For CLI details:

```bash
yarn run simpleAccount -h
```

### Get account address

Smart contract account addresses can be deterministically generated. Use this command to get your account address based on the `signingKey` set in your `config.json`.

The account will be automatically deployed on the first transaction.

```bash
yarn run simpleAccount address
```

### Transfer ETH

Before executing a transfer, make sure to deposit some ETH to the address generated by the `simpleAccount address` command.

```bash
yarn run simpleAccount transfer --to <address> --amount <eth>
```

### Transfer ERC-20 token

Make sure the address generated by `simpleAccount:address` has enough specified tokens to execute the transfer.

If not using a paymaster, make sure to also have enough ETH to pay gas fees.

```bash
yarn run simpleAccount erc20Transfer --token <address> --to <address> --amount <decimal>
```

### Batch transfer ETH

This example shows how we can do multiple atomic ETH transfers in a single transaction.

```bash
# recipient addresses is comma separated.
# e.g. 0x123..abc,0x456...def
yarn run simpleAccount batchTransfer --to <addresses> --amount <eth>
```

### Batch transfer ERC-20 token

Similar to `simpleAccount batchTransfer`, we can also do multiple atomic contract interactions in a single transaction. This example shows us how with an ERC-20 token.

```bash
# recipient addresses is comma separated.
# e.g. 0x123..abc,0x456...def
yarn run simpleAccount batchErc20Transfer --token <address> --to <addresses> --amount <decimal>
```

### Uniswap Approve and SwapExactETHForTokens on UniswapV2 Router

This examples shows how to do an approve and swapExactETHForTokens on a uniswapV2 router. Note that amountOutMin is hardcoded to 0, so DO NOT USE THIS EXAMPLE ON MAINNET otherwise you are likely to be sandwiched!

```bash
yarn run simpleAccount uniswapApproveAndSwap --token <address> --routerAddress <address> --weth <addresses> --amount <decimal>
```

---

# License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

# Contact

Feel free to direct any technical related questions to the `dev-hub` channel in the [Stackup Discord](https://discord.gg/VTjJGvMNyW).
