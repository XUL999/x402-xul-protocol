import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🔍 XUL Chain Connection Check\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check environment variables
  const rpcUrl = process.env.XUL_RPC_URL || "https://pro.rswl.ai";
  const chainId = process.env.XUL_CHAIN_ID || "12309";

  console.log("📋 Configuration:");
  console.log("   RPC URL:", rpcUrl);
  console.log("   Chain ID:", chainId);
  console.log("   Explorer:", "https://scan.rswl.ai\n");

  // Test connection
  console.log("🔌 Testing connection...\n");

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get network info
    console.log("📡 Fetching network information...");
    const network = await provider.getNetwork();
    console.log("   ✅ Connected to network!");
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Name:", network.name || "XUL Chain");

    // Get latest block
    console.log("\n📦 Fetching latest block...");
    const blockNumber = await provider.getBlockNumber();
    console.log("   ✅ Latest block:", blockNumber);

    // Get gas price
    console.log("\n⛽ Fetching gas price...");
    const feeData = await provider.getFeeData();
    if (feeData.gasPrice) {
      console.log("   ✅ Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    } else {
      console.log("   ⚠️  Gas price not available (EIP-1559 may be active)");
    }

    // Check if deployer is configured
    if (process.env.DEPLOYER_PRIVATE_KEY) {
      console.log("\n👤 Checking deployer account...");
      const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
      const address = wallet.address;
      console.log("   Address:", address);

      const balance = await provider.getBalance(address);
      console.log("   Balance:", ethers.formatEther(balance), "XUL");

      if (balance === 0n) {
        console.log("\n   ⚠️  WARNING: Account has zero balance!");
        console.log("   Please fund your account before deploying.");
      } else {
        console.log("   ✅ Account has funds for deployment");
      }
    } else {
      console.log("\n⚠️  DEPLOYER_PRIVATE_KEY not set in .env");
      console.log("   Set it to enable contract deployment:");
      console.log("   DEPLOYER_PRIVATE_KEY=your_private_key_here");
    }

    // Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Connection successful!\n");
    console.log("🚀 Ready to deploy! Run:");
    console.log("   pnpm deploy:xul\n");

  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("\nError:", error instanceof Error ? error.message : error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check your internet connection");
    console.log("   2. Verify RPC URL is correct:", rpcUrl);
    console.log("   3. Try alternative RPC endpoint");
    console.log("   4. Check if XUL Chain is operational\n");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
