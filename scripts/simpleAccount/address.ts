import { ethers } from "ethers";
import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";
import { SimpleAccount } from "../../src/DFKSimpleAccount";

export default async function main() {
  const simpleAccount = await SimpleAccount.init(
    new ethers.Wallet(config.signingKey),
    config.rpcUrl
  );
  const address = simpleAccount.getSender();

  console.log(`SimpleAccount address: ${address}`);
}
