import { ethers } from "ethers";
import {
  ERC20_ABI,
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
//      ┕> token.transfer (recipient 1)
//      ⋮
//      ┕> token.transfer (recipient N)
async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const accountAPI = getSimpleAccount(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleAccountFactory
  );
  const sender = await accountAPI.getCounterFactualAddress();

  const token = ethers.utils.getAddress(process.argv[2]);
  const value = process.argv[4];
  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
  const [symbol, decimals] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
  ]);
  const amount = ethers.utils.parseUnits(value, decimals);

  let dest: Array<string> = [];
  let data: Array<string> = [];
  process.argv[3]
    .split(",")
    .map((addr) => addr.trim())
    .forEach((addr) => {
      dest = [...dest, erc20.address];
      data = [
        ...data,
        erc20.interface.encodeFunctionData("transfer", [
          ethers.utils.getAddress(addr),
          amount,
        ]),
      ];
    });
  console.log(
    `Batch transferring ${value} ${symbol} to ${dest.length} recipients...`
  );

  const ac = await accountAPI._getAccountContract();
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
