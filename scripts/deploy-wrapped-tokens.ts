import { ethers } from "hardhat";

async function main() {
  console.log("🌉 Deploying Wrapped Tokens for Cross-Chain Bridge\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    throw new Error("No deployer found. Check your private key in .env");
  }
  
  const deployerAddress = await deployer.getAddress();
  console.log("📝 Deploying with account:", deployerAddress);
  
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(balance), "XUL\n");

  // Deploy WUSDT
  console.log("📦 Deploying WUSDT...");
  const WUSDT = await ethers.getContractFactory("WUSDT");
  const wusdt = await WUSDT.deploy(deployerAddress);
  await wusdt.waitForDeployment();
  const wusdtAddress = await wusdt.getAddress();
  console.log("✅ WUSDT deployed to:", wusdtAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${wusdtAddress}\n`);

  // Deploy WUSDC
  console.log("📦 Deploying WUSDC...");
  const WUSDC = await ethers.getContractFactory("WUSDC");
  const wusdc = await WUSDC.deploy(deployerAddress);
  await wusdc.waitForDeployment();
  const wusdcAddress = await wusdc.getAddress();
  console.log("✅ WUSDC deployed to:", wusdcAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${wusdcAddress}\n`);

  // Deploy WBTC
  console.log("📦 Deploying WBTC...");
  const WBTC = await ethers.getContractFactory("WBTC");
  const wbtc = await WBTC.deploy(deployerAddress);
  await wbtc.waitForDeployment();
  const wbtcAddress = await wbtc.getAddress();
  console.log("✅ WBTC deployed to:", wbtcAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${wbtcAddress}\n`);

  // Deploy WETH
  console.log("📦 Deploying WETH...");
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy(deployerAddress);
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("✅ WETH deployed to:", wethAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${wethAddress}\n`);

  // Network info
  const network = await ethers.provider.getNetwork();
  
  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Deployment Summary:\n");
  console.log("Network:", network.name || "xul-mainnet");
  console.log("Chain ID:", network.chainId.toString());
  console.log("\nWrapped Tokens:");
  console.log("  WUSDT:", wusdtAddress);
  console.log("  WUSDC:", wusdcAddress);
  console.log("  WBTC:", wbtcAddress);
  console.log("  WETH:", wethAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name || "xul-mainnet",
    chainId: Number(network.chainId),
    tokens: {
      WUSDT: wusdtAddress,
      WUSDC: wusdcAddress,
      WBTC: wbtcAddress,
      WETH: wethAddress,
    },
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Add these tokens to X402PaymentProcessor:");
  console.log(`   - WUSDT: ${wusdtAddress}`);
  console.log(`   - WUSDC: ${wusdcAddress}`);
  console.log(`   - WBTC: ${wbtcAddress}`);
  console.log(`   - WETH: ${wethAddress}`);
  console.log("\n2. Set up bridge infrastructure:");
  console.log("   - Deploy bridge contract");
  console.log("   - Add bridge address to tokens");
  console.log("   - Connect to external chains");
  console.log("\n3. Provide initial liquidity (optional):");
  console.log("   - Mint tokens for testing");
  console.log("   - Add to DEX when available");

  return {
    WUSDT: wusdtAddress,
    WUSDC: wusdcAddress,
    WBTC: wbtcAddress,
    WETH: wethAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
