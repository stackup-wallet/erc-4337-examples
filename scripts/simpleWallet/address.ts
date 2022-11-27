import { getSimpleWallet } from "../../src";
import { ethers } from "ethers";
// @ts-ignore
import config from "../../config.json";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const walletAPI = getSimpleWallet(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleWalletFactory
  );
  const address = await walletAPI.getCounterFactualAddress();

  console.log(`SimpleWallet address: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
