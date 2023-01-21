import { ethers } from "ethers";
import {
  getSimpleAccount,
  getGasFee,
  printOp,
  getHttpRpcClient,
} from "../../src";
// @ts-ignore
import config from "../../config.json";
import { resolveProperties } from "ethers/lib/utils";
import axios from "axios";

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

  const unsignedOp = await accountAPI.createUnsignedUserOp({
    target,
    value,
    data: "0x",
    ...(await getGasFee(provider)),
  });

  const op = await accountAPI.signUserOp({
    ...unsignedOp,
    preVerificationGas: 50000, // tmp fix v0.3.0 should fix this
  });

  const serializedOp = await resolveProperties(op);
  const paymasterAndData = await axios
    .post(config.verifyingPaymasterUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "pm_sendUserOperation",
      params: [serializedOp, config.entryPoint],
    })
    .then((res) => res.data.result);
  console.log("paymasterAndData", paymasterAndData);

  const op2 = await accountAPI.signUserOp({
    ...op,
    paymasterAndData,
  });
  console.log(`Signed UserOperation: ${await printOp(op2)}`);

  const client = await getHttpRpcClient(
    provider,
    config.bundlerUrl,
    config.entryPoint
  );
  const uoHash = await client.sendUserOpToBundler(op2);
  console.log(`UserOpHash: ${uoHash}`);

  console.log("Waiting for transaction...");

  const txHash = await accountAPI.getUserOpReceipt(uoHash);
  console.log(`Transaction hash: ${txHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
