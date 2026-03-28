import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🪙 Adding Native XUL Token to X402PaymentProcessor\n");

  const contractAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Error: PAYMENT_PROCESSOR_ADDRESS not set in .env");
    process.exit(1);
  }

  // Native token address (0x0)
  const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

  console.log("📋 Configuration:");
  console.log("   Contract:", contractAddress);
  console.log("   Token: Native XUL");
  console.log("   Token Address:", NATIVE_TOKEN, "(Native Token)\n");

  const [deployer] = await ethers.getSigners();
  const X402PaymentProcessor = await ethers.getContractFactory("X402PaymentProcessor");
  const paymentProcessor = X402PaymentProcessor.attach(contractAddress);

  console.log("📝 Adding native token as accepted payment...");
  
  const tx = await paymentProcessor.addAcceptedToken(NATIVE_TOKEN);
  await tx.wait();

  console.log("\n✅ Native XUL token added successfully!");
  console.log("   Transaction:", tx.hash);
  console.log("   Explorer:", `https://scan.rswl.ai/tx/${tx.hash}\n`);
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 You can now use XUL for payments!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("💡 Next steps:");
  console.log("   1. Update .env: PAYMENT_TOKEN=" + NATIVE_TOKEN);
  console.log("   2. Test payment with XUL");
  console.log("   3. View contract: https://scan.rswl.ai/address/" + contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
