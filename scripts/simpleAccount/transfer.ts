import { ethers } from "ethers";
import { Client, Presets } from "userop";
import { CLIOpts } from "../../src";
// @ts-ignore
import config from "../../config.json";

export default async function main(t: string, amt: string, opts: CLIOpts) {
  const paymasterMiddleware = opts.withPM
    ? Presets.Middleware.verifyingPaymaster(
        config.paymaster.rpcUrl,
        config.paymaster.context
      )
    : undefined;

  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    new ethers.Wallet(config.signingKey),
    config.rpcUrl,
    { paymasterMiddleware, overrideBundlerRpc: opts.overrideBundlerRpc }
  );
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  simpleAccount
    .resetMiddleware()
    .useMiddleware(Presets.Middleware.getGasPrice(provider))
    .useMiddleware(
      Presets.Middleware.EOASignature(new ethers.Wallet(config.signingKey))
    )
    .setCallGasLimit(1500000)
    .setPreVerificationGas(1500000)
    .setVerificationGasLimit(1500000)

    .setInitCode(
      "0x9406cc6185a346906296840746125a0e449764545fbfb9cf000000000000000000000000f4d69e0a356e652fd8dae476589777ae7f67f9ec0000000000000000000000000000000000000000000000000000000000000000"
    );

  const client = await Client.init(config.rpcUrl, {
    overrideBundlerRpc: opts.overrideBundlerRpc,
  });

  const target = ethers.utils.getAddress(t);
  const value = ethers.utils.parseEther(amt);
  const res = await client.sendUserOperation(
    simpleAccount.execute(target, value, "0x"),
    {
      dryRun: opts.dryRun,
      onBuild: (op) => console.log("Signed UserOperation:", op),
    }
  );
  console.log(`UserOpHash: ${res.userOpHash}`);

  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
}
