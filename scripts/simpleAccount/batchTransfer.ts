import { ethers } from "ethers";
import {
  getSimpleAccount,
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
  const accountAPI = getSimpleAccount(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleAccountFactory
  );
  const sender = await accountAPI.getCounterFactualAddress();

  const ac = await accountAPI._getAccountContract();
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
        ac.interface.encodeFunctionData("transfer", [
          ethers.utils.getAddress(addr),
          value,
        ]),
      ];
    });

  const op = await accountAPI.createSignedUserOp({
    target: sender,
    data: ac.interface.encodeFunctionData("execBatch", [dest, data]),
    ...(await getGasFee(provider)),
  });
  console.log(`Signed UserOperation: ${await printOp(op)}`);

  const client = await getHttpRpcClient(
    provider,
    config.bundlerUrl,
    config.entryPoint
  );
  const uoHash = await client.sendUserOpToBundler(op);
  console.log(`UserOpHash: ${uoHash}`);

  console.log("Waiting for transaction...");
  const txHash = await accountAPI.getUserOpReceipt(uoHash);
  console.log(`Transaction hash: ${txHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
