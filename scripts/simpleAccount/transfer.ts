import { ethers } from "ethers";
import {
  getSimpleAccount,
  getGasFee,
  printOp,
  getHttpRpcClient,
} from "../../src";
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

  const target = ethers.utils.getAddress(process.argv[2]);
  const value = ethers.utils.parseEther(process.argv[3]);
  const op = await accountAPI.createSignedUserOp({
    target,
    value,
    data: "0x",
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
  const txHash = await accountAPI.getUserOpReceipt(reqId);
  console.log(`Transaction hash: ${txHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
