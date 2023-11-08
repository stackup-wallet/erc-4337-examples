import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";

export default async function main() {
  const BarzAccount = await Presets.Builder.Barz.init(
    new Presets.Signers.BarzSecp256r1(config.secp256r1Key),
    config.rpcUrl
  );
  const address = BarzAccount.getSender();

  console.log(`Barz address: ${address}`);
}
