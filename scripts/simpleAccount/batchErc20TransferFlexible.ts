import { ethers } from "ethers";
import {
  ERC20_ABI,
  getVerifyingPaymaster,
  getSimpleAccount,
  getGasFee,
  printOp,
  getHttpRpcClient,
} from "../../src";
// @ts-ignore
import config from "../../config.json";

// This example requires several layers of calls:
// EntryPoint
//  ┕> sender.executeBatch
//    ┕> token.transfer (recipient 1)
//    ⋮
//    ┕> token.transfer (recipient N)

export default async function main(
  tokens: Array<string>,
  to: Array<string>,
  amounts: Array<string>,
  withPM: boolean
) {

  if (tokens.length != to.length || tokens.length != amounts.length || to.length != amounts.length) {
    throw new Error("All arrays must be of equal length");
  }

  const orders = tokens.map((token, i) => {
    return [token, to[i], amounts[i]];
  });

 

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const paymasterAPI = withPM
    ? getVerifyingPaymaster(config.paymasterUrl, config.entryPoint)
    : undefined;
  const accountAPI = getSimpleAccount(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleAccountFactory,
    paymasterAPI
  );
  const sender = await accountAPI.getCounterFactualAddress();

  let dest: Array<string> = [];
  let data: Array<string> = [];

  for (let order of orders) {
    // Token: 0
    // To: 1
    // Amount: 2

    dest.push(order[0]);

    const erc20 = new ethers.Contract(order[0], ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([
      erc20.symbol(),
      erc20.decimals(),
    ]);
 
    const amount = ethers.utils.parseUnits(order[2], decimals);

    data = [
      ...data,
      erc20.interface.encodeFunctionData("transfer", [
        ethers.utils.getAddress(order[1]),
        amount,
      ]),
    ];

    console.log(`Transferring ${order[2]} ${symbol} to ${order[1]}...`);
  }


  const ac = await accountAPI._getAccountContract();
  const op = await accountAPI.createSignedUserOp({
    target: sender,
    data: ac.interface.encodeFunctionData("executeBatch", [dest, data]),
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
