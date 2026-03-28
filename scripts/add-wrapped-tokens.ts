import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🪙 Adding Wrapped Tokens to X402PaymentProcessor\n");

  const contractAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Error: PAYMENT_PROCESSOR_ADDRESS not set in .env");
    process.exit(1);
  }

  // Wrapped token addresses
  const tokens = {
    WUSDT: "0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8",
    WUSDC: "0x41Bf8fACF9af7aB03EF4dbeD5239699d2FB2a6b8",
    WBTC: "0x1A39DB2188Bf238293BE9c4706C0119cA271266f",
    WETH: "0x3dE47F28888D90BACcD7f40D068653104A60B70F",
  };

  console.log("📋 Contract:", contractAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await ethers.getSigners();
  const X402PaymentProcessor = await ethers.getContractFactory("X402PaymentProcessor");
  const paymentProcessor = X402PaymentProcessor.attach(contractAddress);

  // Add each token
  for (const [name, address] of Object.entries(tokens)) {
    console.log(`📝 Adding ${name} (${address})...`);
    
    try {
      const tx = await paymentProcessor.addAcceptedToken(address);
      await tx.wait();
      
      console.log(`   ✅ ${name} added successfully!`);
      console.log(`   Transaction: ${tx.hash}`);
      console.log(`   Explorer: https://scan.rswl.ai/tx/${tx.hash}\n`);
    } catch (error) {
      console.log(`   ⚠️  ${name} might already be added or error occurred\n`);
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ All wrapped tokens added!\n");
  
  console.log("🎯 Accepted Payment Tokens:");
  console.log("   - XUL (Native): 0x0000000000000000000000000000000000000000");
  console.log(`   - WUSDT: ${tokens.WUSDT}`);
  console.log(`   - WUSDC: ${tokens.WUSDC}`);
  console.log(`   - WBTC: ${tokens.WBTC}`);
  console.log(`   - WETH: ${tokens.WETH}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
