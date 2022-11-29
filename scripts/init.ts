import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { ethers } from "ethers";

const INIT_CONFIG = {
  bundlerUrl: "http://localhost:4337",
  rpcUrl: "https://rpc-mumbai.maticvigil.com/",
  signingKey: new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
  entryPoint: "0x1D9a2CB3638C2FC8bF9C01D088B79E75CD188b17",
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
