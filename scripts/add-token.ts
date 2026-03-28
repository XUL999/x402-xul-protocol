import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Error: PAYMENT_PROCESSOR_ADDRESS not set in .env");
    console.log("Please set it in your .env file:");
    console.log("PAYMENT_PROCESSOR_ADDRESS=0x...");
    process.exit(1);
  }

  const tokenAddress = process.argv[2];
  
  if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
    console.error("❌ Error: Please provide a valid token address");
    console.log("Usage: npx hardhat run scripts/add-token.ts --network xul-mainnet <TOKEN_ADDRESS>");
    process.exit(1);
  }

  console.log("🪙 Adding accepted token to X402PaymentProcessor...\n");
  console.log("   Contract:", contractAddress);
  console.log("   Token:", tokenAddress);

  const [deployer] = await ethers.getSigners();
  const X402PaymentProcessor = await ethers.getContractFactory("X402PaymentProcessor");
  const paymentProcessor = X402PaymentProcessor.attach(contractAddress);

  const tx = await paymentProcessor.addAcceptedToken(tokenAddress);
  await tx.wait();

  console.log("\n✅ Token added successfully!");
  console.log("   Transaction:", tx.hash);
  console.log("   Explorer:", `https://scan.rswl.ai/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
