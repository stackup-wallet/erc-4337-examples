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

// This is an example script for sending a transaction that has its gas fees sponsored by
// a paymaster. First, a user operation is constructed and signed by the smart contract account.
// The paymaster (in this case Stackup's hosted paymaster) signs this user operation and returns
// the data. This data is added to the user operation and sent to the bundler.

async function main() {
  // Create an accountAPI object for the account.
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const accountAPI = getSimpleAccount(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleAccountFactory
  );

  // Create the unsigned user operation that the paymaster will sign.
  const target = ethers.utils.getAddress(process.argv[2]);
  const value = ethers.utils.parseEther(process.argv[3]);
  const unsignedOp = await accountAPI.createUnsignedUserOp({
    target,
    value,
    data: "0x",
    ...(await getGasFee(provider)),
  });

  // The account signs the user operation.
  const op = await accountAPI.signUserOp({
    ...unsignedOp,
    preVerificationGas: 50000, // temporary fix for v0.2.0. v0.3.0 should fix this
  });
  const serializedOp = await resolveProperties(op);

  // Ask the paymaster to sign the transaction and return it.
  const paymasterAndData = await axios
    .post(config.verifyingPaymasterUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "pm_sendUserOperation",
      params: [serializedOp, config.entryPoint],
    })
    .then((res) => res.data.result);
  console.log("paymasterAndData", paymasterAndData);

  // Add the signed paymaster data to the user operation that has been signed by the account
  const op2 = await accountAPI.signUserOp({
    ...op,
    paymasterAndData,
  });
  console.log(`Signed UserOperation: ${await printOp(op2)}`);

  // Create a connection to the bundler
  const client = await getHttpRpcClient(
    provider,
    config.bundlerUrl,
    config.entryPoint
  );

  // Send the user operation to the bundler.
  const uoHash = await client.sendUserOpToBundler(op2);
  console.log(`UserOpHash: ${uoHash}`);
  console.log("Waiting for transaction...");

  // Receive the receipt.
  const txHash = await accountAPI.getUserOpReceipt(uoHash);
  console.log(`Transaction hash: ${txHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
