import select from "@inquirer/select";
import { ICall } from "userop";
import { ethers } from "ethers";
import createERC20Approve from "./erc20approve";
import createERC20Transfer from "./erc20transfer";
import createTransfer from "./transfer";

enum TransactionType {
  transfer,
  erc20transfer,
  erc20approve,
}

const createTransaction = async (
  provider: ethers.providers.JsonRpcProvider,
  type: TransactionType
): Promise<ICall> => {
  switch (type) {
    case TransactionType.transfer:
      return createTransfer();
    case TransactionType.erc20transfer:
      return createERC20Transfer(provider);
    case TransactionType.erc20approve:
      return createERC20Approve(provider);
    default:
      throw new Error("Transaction type not implemented.");
  }
};

export const createCalls = async (
  provider: ethers.providers.JsonRpcProvider,
  calls: Array<ICall> = []
): Promise<Array<ICall>> => {
  console.log(`Transaction ${calls.length + 1}:`);
  const call = await createTransaction(
    provider,
    await select({
      message: "Select a transaction type",
      choices: [
        {
          name: "Transfer",
          value: TransactionType.transfer,
          description: "Transfer ETH or the native token from your account.",
        },
        {
          name: "ERC20 Transfer",
          value: TransactionType.erc20transfer,
          description: "Transfer ERC20 tokens from your account.",
        },
        {
          name: "ERC20 Approve",
          value: TransactionType.erc20approve,
          description:
            "Approve an account to transfer your ERC20 tokens up to a limit.",
        },
      ],
    })
  );

  const hasMore = await select({
    message: "Batch another transaction?",
    choices: [
      {
        name: "Yes",
        value: true,
        description:
          "Create another transaction to atomically include in the useOperation.",
      },
      {
        name: "No",
        value: false,
        description: "Continue to build and send the UserOperation.",
      },
    ],
  });
  console.log("\n");

  const batch = [...calls, call];
  if (hasMore) {
    return createCalls(provider, batch);
  }
  return batch;
};
