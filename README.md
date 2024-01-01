![](https://i.imgur.com/Ym2VV8z.png)

# Getting started

A collection of example scripts for working with ERC-4337. **For details on how to use this repository, [check out the docs here](https://docs.stackup.sh/docs/erc-4337-examples).**

The implementation for all commands are located in the [scripts directory](./scripts/). All scripts are built with the following open source packages:

- Sample contracts: [eth-infinitism/account-abstraction](https://github.com/eth-infinitism/account-abstraction)
- ZeroDev Kernel contracts: [zerodevapp/kernel](https://github.com/zerodevapp/kernel)
- JS SDK: [userop.js](https://github.com/stackup-wallet/userop.js)

> **🚀 Looking for access to hosted infrastructure to build your Smart Accounts? Check out [stackup.sh](https://www.stackup.sh/)!**

### Batch transfer ERC-20 tokens (Flexible)

A more flexible version of `simpleAccount batchErc20Transfer` that allows you to specify multiple ERC-20 tokens, recipients, and amounts.

```bash
# token addresses, recipient addresses and amounts are comma separated.
# e.g. 0x123..abc,0x456...def
yarn run simpleAccount batchErc20TransferFlexible --tokens <addresses> --to <addresses> --amounts <decimals>
```
#### Example

```bash
yarn run simpleAccount batchErc20TransferFlexible --tokens 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984,0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6 --to 0xDB94f4423b0e4Bd9da30a1d41d5EeeE41af166B9,0xB79589a59D11ee94E0b778823b25B5Ad43443CE3 --amounts 0.05,0.03
```

The following command will
- Transfer `0.05 UNI` (`0x1f9840a85d5af5bf1d1762f925bdaddc4201f984`) to `0xDB94f4423b0e4Bd9da30a1d41d5EeeE41af166B9`
- Transfer `0.03 WETH` (`0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6`) to `0xB79589a59D11ee94E0b778823b25B5Ad43443CE3`

An example transaction can be found at: https://goerli.etherscan.io/tx/0xad53de4e45b5258c1bbd927a35fa88f0d0ea6f937bc1007a4fb211f4fac8c9aa

⚠️ **Reminder**: Make sure that the lengths of all parameters are equal. The script will throw an error otherwise.

---

# License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

# Contact

Feel free to direct any technical related questions to the `dev-hub` channel in the [Stackup Discord](https://discord.gg/VTjJGvMNyW).
