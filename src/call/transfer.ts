import input from "@inquirer/input";
import { ICall } from "userop";
import { ethers } from "ethers";

export default async function main(): Promise<ICall> {
  const to = await input({
    message: "Enter recipient address",
    validate(value) {
      return ethers.utils.isAddress(value) ? true : "Address not valid.";
    },
  });
  const value = await input({
    message: "Enter value in Ether",
    validate(amt) {
      try {
        ethers.utils.parseEther(amt);
      } catch {
        return "Value not valid.";
      }
      return true;
    },
  });

  return {
    to: ethers.utils.getAddress(to),
    value: ethers.utils.parseEther(value),
    data: "0x",
  };
}
