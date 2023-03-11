#!/usr/bin/env node
import { Command } from "commander";
import address from "./address";
import transfer from "./transfer";
import erc20Transfer from "./erc20Transfer";
import batchTransfer from "./batchTransfer";
import batchErc20Transfer from "./batchErc20Transfer";
import batchErc20TransferFlexible from "./batchErc20TransferFlexible";

const program = new Command();

program
  .name("ERC-4337 SimpleAccount")
  .description(
    "A collection of example scripts for working with ERC-4337 SimpleAccount.sol"
  )
  .version("0.1.0");

program
  .command("address")
  .description("Generate a counterfactual address.")
  .action(address);

program
  .command("transfer")
  .description("Transfer ETH")
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .requiredOption("-t, --to <address>", "The recipient address")
  .requiredOption("-amt, --amount <eth>", "Amount in ETH to transfer")
  .action(async (opts) =>
    transfer(opts.to, opts.amount, Boolean(opts.withPaymaster))
  );

program
  .command("erc20Transfer")
  .description("Transfer ERC-20 token")
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .requiredOption("-tkn, --token <address>", "The token address")
  .requiredOption("-t, --to <address>", "The recipient address")
  .requiredOption("-amt, --amount <decimal>", "Amount of the token to transfer")
  .action(async (opts) =>
    erc20Transfer(opts.token, opts.to, opts.amount, Boolean(opts.withPaymaster))
  );

program
  .command("batchTransfer")
  .description("Batch transfer ETH")
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .requiredOption(
    "-t, --to <addresses>",
    "Comma separated list of recipient addresses"
  )
  .requiredOption("-amt, --amount <eth>", "Amount in ETH to transfer")
  .action(async (opts) =>
    batchTransfer(opts.to.split(","), opts.amount, Boolean(opts.withPaymaster))
  );

  program
  .command("batchErc20Transfer")
  .description("Batch transfer ERC-20 token")
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .requiredOption("-tkn, --token <address>", "The token address")
  .requiredOption(
    "-t, --to <addresses>",
    "Comma separated list of recipient addresses"
  )
  .requiredOption("-amt, --amount <decimal>", "Amount of the token to transfer")
  .action(async (opts) =>
    batchErc20Transfer(
      opts.token,
      opts.to.split(","),
      opts.amount,
      Boolean(opts.withPaymaster)
    )
  );

  program
  .command("batchErc20TransferFlexible")
  .description("Batch transfer multiple ERC-20 tokens with multiple amounts to multiple recipients")
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .requiredOption("-tkns, --tokens <addresses>", "The token addresses")
  .requiredOption(
    "-t, --to <addresses>",
    "Comma separated list of recipient addresses"
  )
  .requiredOption("-amt, --amounts <decimals>", "Amounts of token to transfer")
  .action(async (opts) =>
    batchErc20TransferFlexible(
      opts.tokens.split(" "),
      opts.to.split(" "),
      opts.amounts.split(" "),
      Boolean(opts.withPaymaster)
    )
  );

program.parse();
