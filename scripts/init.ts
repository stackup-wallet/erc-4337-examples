import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { ethers } from "ethers";

const INIT_CONFIG = {
  bundlerUrl: "http://localhost:4337",
  rpcUrl: "https://rpc-mumbai.maticvigil.com/",
  signingKey: new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
  entryPoint: "0x78d4f01f56b982a3B03C4E127A5D3aFa8EBee686",
  simpleAccountFactory: "0xe19E9755942BB0bD0cCCCe25B1742596b8A8250b",
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
