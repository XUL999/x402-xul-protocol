const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 XUL Chain V2 合约...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("部署者:", deployer.address);
  console.log("余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "XUL\n");
  
  // 1. 部署 WXULV2
  console.log("📦 1. 部署 WXULV2...");
  const WXULV2 = await ethers.getContractFactory("contracts/WXULV2.sol:WXULV2");
  const wxul = await WXULV2.deploy();
  await wxul.waitForDeployment();
  const wxulAddr = await wxul.getAddress();
  console.log("✅ WXULV2:", wxulAddr);
  
  // 2. 部署 XULSwapFactory
  console.log("\n📦 2. 部署 XULSwapFactory...");
  const Factory = await ethers.getContractFactory("contracts/XULSwapFactory.sol:XULSwapFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("✅ XULSwapFactory:", factoryAddr);
  
  // 3. 部署 XULSwapRouterV2
  console.log("\n📦 3. 部署 XULSwapRouterV2...");
  const Router = await ethers.getContractFactory("contracts/XULSwapRouterV2.sol:XULSwapRouter");
  const router = await Router.deploy(factoryAddr, wxulAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("✅ XULSwapRouterV2:", routerAddr);
  
  // 4. 部署 X402PaymentProcessorV2
  console.log("\n📦 4. 部署 X402PaymentProcessorV2...");
  const X402 = await ethers.getContractFactory("contracts/X402PaymentProcessorV2.sol:X402PaymentProcessor");
  const x402 = await X402.deploy();
  await x402.waitForDeployment();
  const x402Addr = await x402.getAddress();
  console.log("✅ X402PaymentProcessorV2:", x402Addr);
  
  // 5. 配置 Factory (设置 Router)
  console.log("\n⚙️  5. 配置 Factory...");
  await factory.setFeeToSetter(deployer.address);
  console.log("✅ FeeToSetter 设置完成");
  
  // 6. 添加 XUL 原生币和 WXUL 为接受的代币
  console.log("\n⚙️  6. 配置 X402PaymentProcessor...");
  await x402.addAcceptedToken("0x0000000000000000000000000000000000000000"); // 原生 XUL
  await x402.addAcceptedToken(wxulAddr);
  console.log("✅ 接受代币配置完成");
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 部署完成!");
  console.log("=".repeat(60));
  console.log("\n📋 V2 合约地址:");
  console.log("  WXULV2:                   ", wxulAddr);
  console.log("  XULSwapFactory:            ", factoryAddr);
  console.log("  XULSwapRouterV2:           ", routerAddr);
  console.log("  X402PaymentProcessorV2:   ", x402Addr);
  console.log("\n🔗 Explorer 链接:");
  console.log("  https://scan.rswl.ai/address/", wxulAddr);
  console.log("=".repeat(60));
  
  // 保存部署结果
  const deployment = {
    network: "XUL Chain",
    chainId: 12309,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      WXULV2: wxulAddr,
      XULSwapFactory: factoryAddr,
      XULSwapRouterV2: routerAddr,
      X402PaymentProcessorV2: x402Addr,
    }
  };
  
  require("fs").writeFileSync(
    "deployments-v2.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log("\n📁 部署结果已保存到 deployments-v2.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
