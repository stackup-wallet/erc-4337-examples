import { ethers } from "ethers";
import {
  ERC20_ABI,
  getSimpleAccount,
  getGasFee,
  printOp,
  getHttpRpcClient,
} from "../src";
// @ts-ignore
import config from "./config.json";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const accountAPI = getSimpleAccount(
    provider,
    config.signingKey,
    config.entryPoint,
    config.simpleAccountFactory
  );




  // get the wallet address from the private key
  const fromWallet = await accountAPI.getAccountAddress(); // 0xE17124A5bF99A0B0fA0ee61a9eFBfE805893545E right now with this PK



  // amount of eth to swap
 const ethAmount = 0.01


  // token to swap eth for on Goerli
  const DAI = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60"
  const bitUSDC  = "0xe6F7C1D584aDFBC2cb8b2854263671dC0913e763"
  const bitsToken = "0x61E20b5900aD7c8a2587BfB51A07E2D0651aF99D"
  const UniswapToken = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"



 /// change this to the token you want to swap for
  const tokenToBuy = UniswapToken


  // address to send tokens to
  const to = fromWallet;

 

  // WETH address
  const WETH = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"


  const erc20 = new ethers.Contract(tokenToBuy, ERC20_ABI, provider);
  const [symbol, decimals] = await Promise.all([
    erc20.name(),
    erc20.symbol(),
    erc20.decimals(),
  ]);


  console.log("\n\n")

 console.log("executing swap on Uniswap with ERC-4337 \n\n")
 console.log("from wallet --> ",  await accountAPI.getAccountAddress())

 console.log("to wallet --> ", to)
 console.log("token to buy  --> ", symbol)
 
  const amount = ethers.utils.parseEther(ethAmount.toString())
  console.log("amount to swap --> ", ethAmount, " ETH")
  console.log("\n\n")
 
  const deadline =  Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


  const op = await accountAPI.createSignedUserOp({
    target: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    data: erc20.interface.encodeFunctionData("swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)", [ 0, [WETH, tokenToBuy], to, deadline]),
    value: amount,
      
    ...(await getGasFee(provider)),
  });
  // console.log(`Signed UserOperation: ${await printOp(op)}`);

  const client = await getHttpRpcClient(
    provider,
    config.bundlerUrl,
    config.entryPoint
  );
  const uoHash = await client.sendUserOpToBundler(op);

  console.log("\n")
  console.log("Swapping tokens on Uniswap...please wait..\n\n");


  const txHash = await accountAPI.getUserOpReceipt(uoHash);
  console.log("\n\n")

  console.log(`Done! Transaction hash -->   ${txHash}\n\n\n`);
}
console.log("\n\n")
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
