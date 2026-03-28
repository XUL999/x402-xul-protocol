import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🔍 Checking XUL Chain Native Token\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const rpcUrl = process.env.XUL_RPC_URL || "https://pro.rswl.ai";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Check native token
  console.log("📊 Native Token Info:");
  
  const blockNumber = await provider.getBlockNumber();
  console.log("   Block Number:", blockNumber);

  const gasPrice = await provider.getFeeData();
  console.log("   Gas Price:", gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") + " gwei" : "N/A");

  // Check balance of deployer
  if (process.env.DEPLOYER_PRIVATE_KEY) {
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    const address = wallet.address;
    const balance = await provider.getBalance(address);
    
    console.log("\n💰 Account Balance:");
    console.log("   Address:", address);
    console.log("   Balance:", ethers.formatEther(balance), "XUL (Native Token)");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 Note:");
  console.log("   - XUL Chain uses XUL as the native token");
  console.log("   - For USDT, USDC, etc., you need to:");
  console.log("     1. Deploy wrapped tokens on XUL Chain");
  console.log("     2. Set up a cross-chain bridge");
  console.log("     3. Or use XUL native token for payments");
  console.log("\n   For testing, you can use XUL as payment token");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
