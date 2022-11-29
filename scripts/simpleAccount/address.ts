import { getSimpleAccount } from "../../src";
import { ethers } from "ethers";
// @ts-ignore
import config from "../../config.json";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const accountAPI = getSimpleAccount(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleAccountFactory
  );
  const address = await accountAPI.getCounterFactualAddress();

  console.log(`SimpleAccount address: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
