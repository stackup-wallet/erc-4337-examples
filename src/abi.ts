export const ERC20_ABI = [
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
