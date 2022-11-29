import { ethers } from "ethers";
import {
  getSimpleWallet,
  getGasFee,
  printOp,
  getHttpRpcClient,
} from "../../src";
// @ts-ignore
import config from "../../config.json";

// This example requires several layers of calls:
// EntryPoint
//  ┕> sender.execFromEntryPoint
//    ┕> sender.execBatch
//      ┕> sender.transfer (recipient 1)
//      ⋮
//      ┕> sender.transfer (recipient N)
async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const walletAPI = getSimpleWallet(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleWalletFactory
  );
  const sender = await walletAPI.getCounterFactualAddress();

  const wc = await walletAPI._getWalletContract();
  const value = ethers.utils.parseEther(process.argv[3]);
  let dest: Array<string> = [];
  let data: Array<string> = [];
  process.argv[2]
    .split(",")
    .map((addr) => addr.trim())
    .forEach((addr) => {
      dest = [...dest, sender];
      data = [
        ...data,
        wc.interface.encodeFunctionData("transfer", [
          ethers.utils.getAddress(addr),
          value,
        ]),
      ];
    });

  const op = await walletAPI.createSignedUserOp({
    target: sender,
    data: wc.interface.encodeFunctionData("execBatch", [dest, data]),
    ...(await getGasFee(provider)),
  });
  console.log(`Signed UserOperation: ${await printOp(op)}`);

  const client = await getHttpRpcClient(
    provider,
    config.bundlerUrl,
    config.entryPoint
  );
  const reqId = await client.sendUserOpToBundler(op);
  console.log(`RequestID: ${reqId}`);

  console.log("Waiting for transaction...");
  const txHash = await walletAPI.getUserOpReceipt(reqId);
  console.log(`Transaction hash: ${txHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
