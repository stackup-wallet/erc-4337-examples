import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { ethers } from "ethers";

const INIT_CONFIG = {
  bundlerUrl: "http://localhost:4337",
  rpcUrl: "http://localhost:8545",
  signingKey: new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
  entryPoint: "0x0F46c65C17AA6b4102046935F33301f0510B163A",
  simpleAccountFactory: "0x71D63edCdA95C61D6235552b5Bc74E32d8e2527B",
  paymasterUrl: "",
};
const CONFIG_PATH = path.resolve(__dirname, "../config.json");

async function main() {
  return fs.writeFile(
    CONFIG_PATH,
    prettier.format(JSON.stringify(INIT_CONFIG, null, 2), { parser: "json" })
  );
}

main()
  .then(() => console.log(`Config written to ${CONFIG_PATH}`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
