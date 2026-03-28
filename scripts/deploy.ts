import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying X402 Payment Processor to XUL Chain...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "XUL\n");

  // Deploy Payment Processor
  console.log("📦 Deploying X402PaymentProcessor...");
  const X402PaymentProcessor = await ethers.getContractFactory("X402PaymentProcessor");
  const paymentProcessor = await X402PaymentProcessor.deploy(deployer.address);
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
  console.log("   Owner:", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name || "xul-mainnet",
    chainId: Number(network.chainId),
    contracts: {
      X402PaymentProcessor: processorAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorer: `https://scan.rswl.ai/address/${processorAddress}`,
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Add accepted payment tokens:");
  console.log("   npx hardhat add-token --network xul-mainnet --token <TOKEN_ADDRESS>");
  console.log("\n2. Authorize facilitators (optional):");
  console.log("   npx hardhat authorize-facilitator --network xul-mainnet --facilitator <ADDRESS>");
  console.log("\n3. Update your .env file:");
  console.log(`   PAYMENT_TOKEN=${processorAddress}`);
  console.log("\n4. Verify contract on explorer:");
  console.log(`   npx hardhat verify --network xul-mainnet ${processorAddress} ${deployer.address}`);

  return {
    paymentProcessor: processorAddress,
    deployer: deployer.address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
