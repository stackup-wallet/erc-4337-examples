const express = require("express");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
const { ethers } = require("ethers");
import { swap } from "./scripts/simpleAccount/swapper";

let requestValue: string;
let requestToken: string;
let requestAmount: string;
let requestTo: string;
let requestFrom: string;
let requestDeadline: string;
let requestPath: string;
let txHash: string;

const ERC20_ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function multicall(uint256 deadline,bytes[] data)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Mint(address indexed sender, uint amount0, uint amount1)",
  "event Burn(address indexed sender, uint amount0, uint amount1, address indexed to)",
  "event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out, uint amount1Out,address indexed to)",
];

const provider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/"
);
const wallet = new ethers.Wallet(
  "0x0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
  provider
);
const contract = new ethers.Contract(
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  ERC20_ABI,
  provider
);

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Function to handle the root path
//@ts-ignore
app.get("/", async function (req, res) {
  console.log("Request received");
  const requestToken = req.query.token;
  const requestAmount = req.query.amount;
  const requestTo = req.query.to;
  if (requestToken == null) {
    res.send(
      "<style> body { background: #000000 } h1{ color: #ff1100 } </style> <h1> Please enter a token address </h1>"
    );
  }

  if (
    requestToken == "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" ||
    requestToken == "0xe6F7C1D584aDFBC2cb8b2854263671dC0913e763" ||
    requestToken == "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
  ) {
    const contractoken = new ethers.Contract(requestToken, ERC20_ABI, wallet);

    const tokenName2 = await contractoken.name();
    res.send(
      "<style> body { background: #000000 } h1{ color: #ff1100 } </style> <h1> Swapping -->  " +
        tokenName2 +
        " </h1>"
    );
    console.log("Token Name : " + tokenName2);
    console.log("Token : " + requestToken);
    console.log("Amount : " + requestAmount);
    console.log("To : " + requestTo);

    //@ts-ignore
    await swap(requestToken, requestAmount, requestTo);
  } else {
    res.send(
      "<style> body { background: #000000 } h1{ color: #ff1100 } </style> <h1> NOT AN ACTIVE TOKEN  </h1>"
    );
  }
});

let server = app.listen(8080, function () {
  console.log("Server is listening on port 8080");
});
