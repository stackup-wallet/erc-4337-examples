// From https://github.com/stackup-wallet/userop.js/blob/main/src/preset/builder/simpleAccount.ts
// This an an edited version of SimpleAccount preset to remove estimateUserOperationGas logic so that you can
// set your own. Once DFK supports custom tracing, you can revert back to the normal preset.

import { BigNumberish, BytesLike, ethers } from "ethers";
import {
  Constants,
  UserOperationBuilder,
  BundlerJsonRpcProvider,
  Presets,
  IPresetBuilderOpts,
  UserOperationMiddlewareFn,
} from "userop";
import {
  EntryPoint,
  EntryPoint__factory,
  SimpleAccountFactory,
  SimpleAccountFactory__factory,
  SimpleAccount as SimpleAccountImpl,
  SimpleAccount__factory,
} from "userop/dist/typechain";

export class SimpleAccount extends UserOperationBuilder {
  private signer: ethers.Signer;
  private provider: ethers.providers.JsonRpcProvider;
  private entryPoint: EntryPoint;
  private factory: SimpleAccountFactory;
  private initCode: string;
  proxy: SimpleAccountImpl;

  private constructor(
    signer: ethers.Signer,
    rpcUrl: string,
    opts?: IPresetBuilderOpts
  ) {
    super();
    this.signer = signer;
    this.provider = new BundlerJsonRpcProvider(rpcUrl).setBundlerRpc(
      opts?.overrideBundlerRpc
    );
    this.entryPoint = EntryPoint__factory.connect(
      opts?.entryPoint || Constants.ERC4337.EntryPoint,
      this.provider
    );
    this.factory = SimpleAccountFactory__factory.connect(
      opts?.factory || Constants.ERC4337.SimpleAccount.Factory,
      this.provider
    );
    this.initCode = "0x";
    this.proxy = SimpleAccount__factory.connect(
      ethers.constants.AddressZero,
      this.provider
    );
  }

  private resolveAccount: UserOperationMiddlewareFn = async (ctx) => {
    ctx.op.nonce = await this.entryPoint.getNonce(ctx.op.sender, 0);
    ctx.op.initCode = ctx.op.nonce.eq(0) ? this.initCode : "0x";
  };

  private estimateCreationGas: UserOperationMiddlewareFn = async (ctx) => {
    if (ethers.BigNumber.from(ctx.op.nonce).eq(0)) {
      const initCodeHex = ethers.utils.hexlify(ctx.op.initCode);
      const factory = initCodeHex.substring(0, 42);
      const callData = "0x" + initCodeHex.substring(42);
      ctx.op.verificationGasLimit = ethers.BigNumber.from(
        ctx.op.verificationGasLimit
      ).add(
        await this.provider.estimateGas({
          to: factory,
          data: callData,
        })
      );
    }
  };

  public static async init(
    signer: ethers.Signer,
    rpcUrl: string,
    opts?: IPresetBuilderOpts
  ): Promise<SimpleAccount> {
    const instance = new SimpleAccount(signer, rpcUrl, opts);

    try {
      instance.initCode = await ethers.utils.hexConcat([
        instance.factory.address,
        instance.factory.interface.encodeFunctionData("createAccount", [
          await instance.signer.getAddress(),
          ethers.BigNumber.from(0),
        ]),
      ]);
      await instance.entryPoint.callStatic.getSenderAddress(instance.initCode);

      throw new Error("getSenderAddress: unexpected result");
    } catch (error: any) {
      const addr = error?.errorArgs?.sender;
      if (!addr) throw error;

      instance.proxy = SimpleAccount__factory.connect(addr, instance.provider);
    }

    const base = instance
      .useDefaults({
        preVerificationGas: 55000,
        verificationGasLimit: 250000,
        callGasLimit: 250000,
        sender: instance.proxy.address,
        signature: await instance.signer.signMessage(
          ethers.utils.arrayify(ethers.utils.keccak256("0xdead"))
        ),
      })
      .useMiddleware(instance.resolveAccount)
      .useMiddleware(instance.estimateCreationGas)
      .useMiddleware(Presets.Middleware.getGasPrice(instance.provider));

    const withPM = opts?.paymasterMiddleware
      ? base.useMiddleware(opts.paymasterMiddleware)
      : base;

    return withPM.useMiddleware(
      Presets.Middleware.EOASignature(instance.signer)
    );
  }

  execute(to: string, value: BigNumberish, data: BytesLike) {
    return this.setCallData(
      this.proxy.interface.encodeFunctionData("execute", [to, value, data])
    );
  }

  executeBatch(to: Array<string>, data: Array<BytesLike>) {
    return this.setCallData(
      this.proxy.interface.encodeFunctionData("executeBatch", [to, data])
    );
  }
}
