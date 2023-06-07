import input from "@inquirer/input";
import { ICall } from "userop";
import { ethers } from "ethers";
import { ERC20_ABI } from "../abi";

export default async function main(
  provider: ethers.providers.JsonRpcProvider
): Promise<ICall> {
  const token = await input({
    message: "Enter token address",
    validate(addr) {
      return ethers.utils.isAddress(addr) ? true : "Address not valid.";
    },
  });

  const spender = await input({
    message: "Enter spender address",
    validate(addr) {
      return ethers.utils.isAddress(addr) ? true : "Address not valid.";
    },
  });
  const value = await input({
    message: "Enter amount",
    validate(amt) {
      try {
        ethers.BigNumber.from(amt);
      } catch {
        return "Value not valid.";
      }
      return true;
    },
  });

  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
  const [symbol, decimals] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
  ]);
  const amount = ethers.utils.parseUnits(value, decimals);
  console.log(
    `> Transaction will approve spender to transfer up to ${value} ${symbol}`
  );

  return {
    to: token,
    value: ethers.constants.Zero,
    data: erc20.interface.encodeFunctionData("approve", [spender, amount]),
  };
}
