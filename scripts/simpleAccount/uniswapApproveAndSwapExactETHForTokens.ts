import { ethers } from "ethers";
import {
  WETH_ABI,
  UNISWAP_V2_ROUTER_ABI,
  getVerifyingPaymaster,
  getSimpleAccount,
  getGasFee,
  printOp,
  getHttpRpcClient,
} from "../../src";
// @ts-ignore
import config from "../../config.json";

export default async function main(
  tkn: string,
  uniswapV2RouterAddress: string, //Mainnet & Goerli - 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
  wethAddress: string, //Goerli - 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6
  amt: string,
  withPM: boolean
) {
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

  const amount = ethers.utils.parseUnits(amt, 18);
  const ac = await accountAPI._getAccountContract();
  const sender = await accountAPI.getCounterFactualAddress();
  
  const wethContract = new ethers.utils.Interface(WETH_ABI)
  const approve = wethContract.encodeFunctionData('approve', [uniswapV2RouterAddress, amount])

  const uniswapV2RouterContract = new ethers.utils.Interface(UNISWAP_V2_ROUTER_ABI)
  const amountOutMin = "0" //DON'T DO THIS IRL or on MAINNET -> can add the Uniswap SDK to do properly slippage calculation
  const deadline = (Math.floor(Date.now() / 1000) + 60 * 20).toString() //20 minutes from current unix time
  const path = [wethAddress, tkn]
  const swap = ac.interface.encodeFunctionData("execute", [
    uniswapV2RouterAddress,
    amount,
    uniswapV2RouterContract.encodeFunctionData('swapExactETHForTokens', [amountOutMin, path, sender, deadline]),
  ])

  console.log(`Approving and Swapping ${amt} WETH...`);

  const dest: Array<string> = [
    wethAddress,
    sender
  ];
  const data: Array<string> = [
    approve,
    swap
  ];

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
