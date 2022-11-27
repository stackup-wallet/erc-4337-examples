import { SimpleWalletAPI } from "@account-abstraction/sdk";
import { ethers, BigNumberish } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

export function getSimpleWallet(
  provider: JsonRpcProvider,
  signingKey: string,
  entryPointAddress: string,
  factoryAddress: string
) {
  const owner = new ethers.Wallet(signingKey, provider);
  const sw = new SimpleWalletAPI({
    provider,
    entryPointAddress,
    owner,
    factoryAddress,
  });

  // Hack: default verificationGasLimit is too low. Overriding it here.
  sw.getVerificationGasLimit = async (): Promise<BigNumberish> => {
    return 1090000;
  };

  // Hack: default getUserOpReceipt does not include fromBlock which causes an error for some RPC providers.
  sw.getUserOpReceipt = async (
    requestId: string,
    timeout = 30000,
    interval = 5000
  ): Promise<string | null> => {
    const block = await sw.provider.getBlock("latest");
    const endtime = Date.now() + timeout;
    while (Date.now() < endtime) {
      // @ts-ignore
      const events = await sw.entryPointView.queryFilter(
        // @ts-ignore
        sw.entryPointView.filters.UserOperationEvent(requestId),
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
