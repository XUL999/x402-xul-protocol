import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying DEX Contracts to XUL Chain\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    throw new Error("No deployer found");
  }
  
  const deployerAddress = await deployer.getAddress();
  console.log("📝 Deploying with account:", deployerAddress);
  
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(balance), "XUL\n");

  // 1. Deploy WXUL
  console.log("📦 Deploying WXUL...");
  const WXUL = await ethers.getContractFactory("WXUL");
  const wxul = await WXUL.deploy();
  await wxul.waitForDeployment();
  const wxulAddress = await wxul.getAddress();
  console.log("✅ WXUL deployed to:", wxulAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${wxulAddress}\n`);

  // 2. Deploy Factory
  console.log("📦 Deploying XULSwapFactory...");
  const XULSwapFactory = await ethers.getContractFactory("XULSwapFactory");
  const factory = await XULSwapFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ XULSwapFactory deployed to:", factoryAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${factoryAddress}\n`);

  // 3. Deploy Router
  console.log("📦 Deploying XULSwapRouter...");
  const XULSwapRouter = await ethers.getContractFactory("XULSwapRouter");
  const router = await XULSwapRouter.deploy(factoryAddress, wxulAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ XULSwapRouter deployed to:", routerAddress);
  console.log("   Explorer:", `https://scan.rswl.ai/address/${routerAddress}\n`);

  // Network info
  const network = await ethers.provider.getNetwork();
  
  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 DEX Deployment Summary:\n");
  console.log("Network:", network.name || "xul-mainnet");
  console.log("Chain ID:", network.chainId.toString());
  console.log("\nDEX Contracts:");
  console.log("  WXUL:", wxulAddress);
  console.log("  Factory:", factoryAddress);
  console.log("  Router:", routerAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name || "xul-mainnet",
    chainId: Number(network.chainId),
    dex: {
      WXUL: wxulAddress,
      Factory: factoryAddress,
      Router: routerAddress,
    },
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Create trading pairs:");
  console.log(`   factory.createPair(WXUL, WUSDT)`);
  console.log(`   factory.createPair(WXUL, WUSDC)`);
  console.log("\n2. Add initial liquidity:");
  console.log(`   router.addLiquidity(...)`);

  return {
    WXUL: wxulAddress,
    Factory: factoryAddress,
    Router: routerAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
