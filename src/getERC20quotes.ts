import { BigNumberish, BytesLike, ethers } from "ethers";
import { UserOperationMiddlewareCtx, Utils, Constants } from "userop";
import { ERC20_ABI } from "./abi";

interface Token {
  address: string;
  approve: BigNumberish;
}

interface QuoteResponse {
  symbol: string;
  decimals: number;
  etherTokenExchangeRate: BigNumberish;
  serviceFeePercent: BigNumberish;
}

interface UserOperationOverridesResponse {
  paymasterAndData: BytesLike;
  preVerificationGas: BytesLike;
  verificationGasLimit: BytesLike;
  callGasLimit: BytesLike;
}

interface TokenQuotes {
  token: string;
  userOperationOverrides: UserOperationOverridesResponse;
  quote: QuoteResponse;
}

interface GetERC20TokenQuotesResponse {
  postOpGas: BigNumberish;
  etherUSDExchangeRate: BigNumberish;
  tokens: Array<TokenQuotes>;
}

export class ERC20Quotes {
  private callDataFn: (address: string, approveData: BytesLike) => BytesLike;
  private tokens: Array<Token>;
  private pref: string;
  private provider: ethers.providers.JsonRpcProvider;

  private approveCallData = async (spender: string, token: Token) => {
    const erc20 = new ethers.Contract(token.address, ERC20_ABI);
    return erc20.interface.encodeFunctionData("approve", [
      spender,
      token.approve,
    ]);
  };

  constructor(paymasterRpc: string) {
    this.provider = new ethers.providers.JsonRpcProvider(paymasterRpc);
    this.callDataFn = () => "0x";
    this.tokens = [];
    this.pref = "";
  }

  setTokens = (tokens: Array<Token>): ERC20Quotes => {
    this.tokens = tokens;
    return this;
  };

  setPreferredToken = (token: string): ERC20Quotes => {
    this.pref = token;
    return this;
  };

  setCallDataFn = (
    fn: (address: string, approveData: BytesLike) => BytesLike
  ): ERC20Quotes => {
    this.callDataFn = fn;
    return this;
  };

  middleware = async (ctx: UserOperationMiddlewareCtx) => {
    const accounts = (await this.provider.send("pm_accounts", [
      Constants.ERC4337.EntryPoint,
    ])) as Array<string>;

    const quotesReq = await Promise.all(
      this.tokens.map(async (token) => ({
        token: token.address,
        callData: this.callDataFn(
          token.address,
          await this.approveCallData(accounts[0], token)
        ),
      }))
    );

    const res = (await this.provider.send("pm_getERC20TokenQuotes", [
      Utils.OpToJSON(ctx.op),
      ctx.entryPoint,
      quotesReq,
    ])) as GetERC20TokenQuotesResponse;

    console.log(JSON.stringify(res, null, 2));
    const i = res.tokens.findIndex(
      (tokenQuote) => tokenQuote.token === this.pref
    );
    if (i === -1) {
      throw new Error("Could not find preferred token.");
    }
    ctx.op.callData = quotesReq[i].callData;
    ctx.op = {
      ...ctx.op,
      ...res.tokens[i].userOperationOverrides,
    };
  };
}
