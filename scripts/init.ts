import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { ethers } from "ethers";

const INIT_CONFIG = {
  bundlerUrl: "http://localhost:4337",
  rpcUrl: "http://localhost:8545",
  signingKey: new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
  entryPoint: "0x1306b01bC3e4AD202612D3843387e94737673F53",
  simpleAccountFactory: "0xc99963686CB64e3B98DF7E877318D02D85DFE326",
  paymaster: "0xf5e6f3cdb0cfe01131eb6ee674cb62c9d811ac2d",
  verifyingPaymasterUrl: "",
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
