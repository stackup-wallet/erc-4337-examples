import { SimpleAccountAPI } from "@account-abstraction/sdk";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

export function getSimpleAccount(
  provider: JsonRpcProvider,
  signingKey: string,
  entryPointAddress: string,
  factoryAddress: string
) {
  const owner = new ethers.Wallet(signingKey, provider);
  const sw = new SimpleAccountAPI({
    provider,
    entryPointAddress,
    owner,
    factoryAddress,
  });

  // Hack: default getUserOpReceipt does not include fromBlock which causes an error for some RPC providers.
  sw.getUserOpReceipt = async (
    userOpHash: string,
    timeout = 30000,
    interval = 5000
  ): Promise<string | null> => {
    const block = await sw.provider.getBlock("latest");
    const endtime = Date.now() + timeout;
    while (Date.now() < endtime) {
      // @ts-ignore
      const events = await sw.entryPointView.queryFilter(
        // @ts-ignore
        sw.entryPointView.filters.UserOperationEvent(userOpHash),
        Math.max(100, block.number - 100)
      );
      if (events.length > 0) {
        return events[0].transactionHash;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return null;
  };

  return sw;
}
