import { ethers } from "ethers";
import { SimpleAccount } from "../../src/DFKSimpleAccount";
// @ts-ignore
import config from "../../config.json";

export default async function main() {
  const simpleAccount = await SimpleAccount.init(
    new ethers.Wallet(config.signingKey),
    config.rpcUrl
  );
  const address = simpleAccount.getSender();

  console.log(`SimpleAccount address: ${address}`);
}
