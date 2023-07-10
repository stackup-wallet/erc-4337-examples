#!/usr/bin/env node
import { Command } from "commander";
import address from "./address";
import transact from "./transact";

const program = new Command();

program
  .name("ZeroDev Kernel")
  .description(
    "A collection of example scripts for working with a ZeroDev Kernel contract account"
  )
  .version("0.1.0");

program
  .command("address")
  .description("Generate a counterfactual address.")
  .action(address);

program
  .command("transact")
  .description("Execute a transaction.")
  .option(
    "-dr, --dryRun",
    "Builds the UserOperation without calling eth_sendUserOperation"
  )
  .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
  .option(
    "-b, --overrideBundlerRpc <url>",
    "Route all bundler RPC method calls to a separate URL"
  )
  .action(async (opts) =>
    transact({
      dryRun: Boolean(opts.dryRun),
      withPM: Boolean(opts.withPaymaster),
      overrideBundlerRpc: opts.overrideBundlerRpc,
    })
  );

program.parse();
