import { ethers } from "ethers";
import { UserOperationStruct } from "@account-abstraction/contracts";

export async function printOp(op: UserOperationStruct): Promise<string> {
  return ethers.utils
    .resolveProperties(op)
    .then((userOp) =>
      Object.keys(userOp)
        .map((key) => {
          let val = (userOp as any)[key];
          if (typeof val !== "string" || !val.startsWith("0x")) {
            val = ethers.utils.hexValue(val);
          }
          return [key, val];
        })
        .reduce(
          (set, [k, v]) => ({
            ...set,
            [k]: v,
          }),
          {}
        )
    )
    .then((userOp) => JSON.stringify(userOp, null, 2));
}
