import fs from "fs";

interface Config {
  bundlerUrl: string;
  rpcUrl: string;
  signingKey: string;
  entryPoint: string;
  simpleAccountFactory: string;
  paymasterUrl: string;
}

const DEFAULT_CONFIG_PATH = "./config.json";
export type Network =
  | "polygon-mainnet"
  | "polygon-testnet"
  | "ethereum-mainnet"
  | "ethereum-testnet"
  | "optimism-mainnet"
  | "optimism-testnet";
export function getConfig(network: Network): Config {
  const configPath = network ? `./${network}.config.json` : DEFAULT_CONFIG_PATH;
  const file = fs.readFileSync(configPath).toString();
  const conf = JSON.parse(file);

  return conf;
}
