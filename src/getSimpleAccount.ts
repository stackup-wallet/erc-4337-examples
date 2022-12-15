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
    const abi = [
      "event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)",
    ];
    const ep = new ethers.Contract(sw.entryPointAddress, abi, sw.provider);

    const block = await sw.provider.getBlock("latest");
    const endtime = Date.now() + timeout;
    while (Date.now() < endtime) {
      const events = await ep.queryFilter(
        ep.filters.UserOperationEvent(userOpHash),
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
