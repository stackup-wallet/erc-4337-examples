import { ethers } from "ethers";
import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";

export default async function main() {
  const kernel = await Presets.Builder.Kernel.init(
    new ethers.Wallet(config.signingKey),
    config.rpcUrl
  );
  const address = kernel.getSender();

  console.log(`Kernel address: ${address}`);
}
