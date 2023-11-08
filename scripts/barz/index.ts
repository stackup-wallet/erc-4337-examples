#!/usr/bin/env node
import { Command } from "commander";
import address from "./address";
import transfer from "./transfer";

const program = new Command();

program
  .name("Barz")
  .description(
    "A collection of example scripts for working with Barz.sol and secp256r1 signatures"
  )
  .version("0.1.0");

program
  .command("address")
  .description("Generate a counterfactual address.")
  .action(address);

program
  .command("transfer")
  .description("Transfer ETH")
  .option(
    "-dr, --dryRun",
    "Builds the UserOperation without calling eth_sendUserOperation"
  )
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .option(
    "-b, --overrideBundlerRpc <url>",
    "Route all bundler RPC method calls to a separate URL"
  )
  .requiredOption("-t, --to <address>", "The recipient address")
  .requiredOption("-amt, --amount <eth>", "Amount in ETH to transfer")
  .action(async (opts) =>
    transfer(opts.to, opts.amount, {
      dryRun: Boolean(opts.dryRun),
      withPM: Boolean(opts.withPaymaster),
      overrideBundlerRpc: opts.overrideBundlerRpc,
    })
  );

program.parse();
