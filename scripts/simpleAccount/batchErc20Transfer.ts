import { ethers } from "ethers";
import { Client, Presets } from "userop";
import { ERC20_ABI } from "../../src";
// @ts-ignore
import config from "../../config.json";

// This example requires several layers of calls:
// EntryPoint
//  ┕> sender.executeBatch
//    ┕> token.transfer (recipient 1)
//    ⋮
//    ┕> token.transfer (recipient N)
export default async function main(
  tkn: string,
  t: Array<string>,
  amt: string,
  withPM: boolean
) {
  const paymaster = withPM
    ? Presets.Middleware.verifyingPaymaster(
        config.paymaster.rpcUrl,
        config.paymaster.context
      )
    : undefined;
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    config.signingKey,
    config.rpcUrl,
    config.entryPoint,
    config.simpleAccountFactory,
    paymaster
  );
  const client = await Client.init(config.rpcUrl, config.entryPoint);

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const token = ethers.utils.getAddress(tkn);
  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
  const [symbol, decimals] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
  ]);
  const amount = ethers.utils.parseUnits(amt, decimals);

  let dest: Array<string> = [];
  let data: Array<string> = [];
  t.map((addr) => addr.trim()).forEach((addr) => {
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
    `Batch transferring ${amt} ${symbol} to ${dest.length} recipients...`
  );

  const res = await client.sendUserOperation(
    simpleAccount.executeBatch(dest, data),
    { onBuild: (op) => console.log("Signed UserOperation:", op) }
  );
  console.log(`UserOpHash: ${res.userOpHash}`);

  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
}
