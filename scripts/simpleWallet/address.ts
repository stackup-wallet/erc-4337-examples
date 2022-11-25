import { SimpleWalletAPI } from "@account-abstraction/sdk";
import { ethers } from "ethers";
// @ts-ignore
import config from "../../config.json";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const owner = new ethers.Wallet(config.signingKey, provider);
  const entryPointAddress = config.entryPoint;
  const factoryAddress = config.simpleWalletFactory;

  const walletAPI = new SimpleWalletAPI({
    provider,
    entryPointAddress,
    owner,
    factoryAddress,
  });
  const address = await walletAPI.getCreate2Address();

  console.log(`SimpleWallet address: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
