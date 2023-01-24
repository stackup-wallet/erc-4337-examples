import { PaymasterAPI } from "@account-abstraction/sdk";
import { BytesLike, resolveProperties } from "ethers/lib/utils";
import axios from "axios";
import { UserOperationStruct } from "@account-abstraction/contracts";

interface paymasterResponse {
  jsonrpc: string;
  id: number;
  result: BytesLike;
}

export class VerifyingPaymasterAPI extends PaymasterAPI {
  private verifyingPaymasterUrl: string;
  private entryPoint: string;
  constructor(verifyingPaymasterUrl: string, entryPoint: string) {
    super();
    this.verifyingPaymasterUrl = verifyingPaymasterUrl;
    this.entryPoint = entryPoint;
  }

  async getPaymasterAndData(userOp: UserOperationStruct): Promise<string> {
    // The account signs the user operation.
    const serializedOp = await resolveProperties(userOp);

    // Ask the paymaster to sign the transaction and return it.
    const paymasterAndData = await axios
      .post<paymasterResponse>(this.verifyingPaymasterUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "pm_sendUserOperation",
        params: [serializedOp, this.entryPoint],
      })
      .then((res) => res.data.result.toString());

    return paymasterAndData;
  }
}
