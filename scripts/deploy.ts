import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying X402 Payment Processor to XUL Chain...\n");

  // Get deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    throw new Error("No deployer found. Check your private key in .env");
  }
  
  const deployerAddress = await deployer.getAddress();
  console.log("📝 Deploying contracts with account:", deployerAddress);
  
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(balance), "XUL\n");

  // Deploy Payment Processor
  console.log("📦 Deploying X402PaymentProcessor...");
  const X402PaymentProcessor = await ethers.getContractFactory("X402PaymentProcessor");
  
  // Deploy with owner address
  const paymentProcessor = await X402PaymentProcessor.deploy(deployerAddress);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await paymentProcessor.waitForDeployment();

  const processorAddress = await paymentProcessor.getAddress();
  console.log("✅ X402PaymentProcessor deployed to:", processorAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${processorAddress}\n`);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network Info:");
  console.log("   Chain ID:", network.chainId.toString());
  console.log("   Name:", network.name || "xul-mainnet");
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   Payment Processor:", processorAddress);
  console.log("   Owner:", deployerAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name || "xul-mainnet",
    chainId: Number(network.chainId),
    contracts: {
      X402PaymentProcessor: processorAddress,
    },
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    explorer: `https://scan.rswl.ai/address/${processorAddress}`,
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Add accepted payment tokens:");
  console.log("   npx hardhat run scripts/add-token.ts --network xul-mainnet --token <TOKEN_ADDRESS>");
  console.log("\n2. Update your .env file:");
  console.log(`   PAYMENT_PROCESSOR_ADDRESS=${processorAddress}`);
  console.log("\n3. Verify contract on explorer:");
  console.log(`   npx hardhat verify --network xul-mainnet ${processorAddress} ${deployerAddress}`);

  return {
    paymentProcessor: processorAddress,
    deployer: deployerAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
