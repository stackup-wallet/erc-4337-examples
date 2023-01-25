import { getSimpleAccount } from "../../src";
import { ethers } from "ethers";
// @ts-ignore
import config from "../../config.json";

// This script returns the address of the smart contract account. The smart contract's address
// is deterministic and counterfactual, so you can use the getSimpleAccount function to get the
// address without deploying the contract.
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
