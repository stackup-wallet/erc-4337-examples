import { ethers } from "ethers";
import { Client, Presets } from "userop";
import { CLIOpts } from "../../src";
import { ERC20Quotes } from "../../src/getERC20quotes";
// @ts-ignore
import config from "../../config.json";

export default async function main(t: string, amt: string, opts: CLIOpts) {
  const quotes = new ERC20Quotes(config.paymaster.rpcUrl);
  const paymasterMiddleware = opts.withPM ? quotes.middleware : undefined;
  const BarzAccount = await Presets.Builder.Barz.init(
    new Presets.Signers.BarzSecp256r1(config.secp256r1Key),
    config.rpcUrl,
    { paymasterMiddleware, overrideBundlerRpc: opts.overrideBundlerRpc }
  );
  const client = await Client.init(config.rpcUrl, {
    overrideBundlerRpc: opts.overrideBundlerRpc,
  });

  const target = ethers.utils.getAddress(t);
  const value = ethers.utils.parseEther(amt);
  quotes
    .setTokens([
      {
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        approve: ethers.utils.parseUnits("1", 6),
      },
      {
        address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        approve: ethers.utils.parseUnits("0.001", 18),
      },
      {
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        approve: ethers.utils.parseUnits("0.0001", 8),
      },
    ])
    .setPreferredToken("0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619")
    .setCallDataForToken((address, approveData) => {
      return BarzAccount.executeBatch(
        [address, target],
        [ethers.constants.Zero, value],
        [approveData, "0x"]
      ).getCallData();
    });
  const res = await client.sendUserOperation(BarzAccount, {
    dryRun: opts.dryRun,
    onBuild: (op) => console.log("Signed UserOperation:", op),
  });
  console.log(`UserOpHash: ${res.userOpHash}`);

  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
}
