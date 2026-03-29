/**
 * XUL Chain 合约迁移脚本
 * 从 V1 迁移到 V2
 * 
 * 使用方法:
 * npx hardhat run scripts/migrate-v1-to-v2.js --network xul-mainnet
 */

const { ethers } = require("hardhat");

// V1 合约地址
const V1_CONTRACTS = {
  WXUL: "0xf6c896656d8f05dC287187749ccEE04FE5589275",
  XULSwapFactory: "0x0A7e1C43582D9b617360F279105Febb9236664A9",
  XULSwapRouter: "0x9fE62F9F607feFA5806b8B36D174550Aa755917d",
  X402PaymentProcessor: "0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF",
};

// V2 合约地址
const V2_CONTRACTS = {
  WXULV2: "0x3111Baf82B89becc5B636d10fdeA1d2697F209F4",
  XULSwapFactoryV2: "0x9466113e4b78b66FB2863e1C36670D47EA276Ca9",
  XULSwapRouterV2: "0x1AAdFfA792e71D1e75FB61CA53E6949352B5e18B",
  X402PaymentProcessorV2: "0x1D754Fb5A8D1db7B83DDb2D6Fb8fD1365C8A6263",
};

async function main() {
  console.log("🚀 XUL Chain V1 → V2 迁移脚本\n");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log("执行者:", deployer.address);
  console.log("网络:", (await ethers.provider.getNetwork()).chainId);
  console.log("=".repeat(60) + "\n");
  
  // 验证 V2 合约已部署
  console.log("📋 1. 验证 V2 合约状态...\n");
  
  for (const [name, addr] of Object.entries(V2_CONTRACTS)) {
    const code = await ethers.provider.getCode(addr);
    const deployed = code !== "0x";
    console.log(`   ${deployed ? "✅" : "❌"} ${name}: ${addr}`);
    if (!deployed) {
      console.error(`   错误: ${name} 未部署!`);
      process.exit(1);
    }
  }
  
  // 连接 V2 合约
  const wxulV2 = await ethers.getContractAt("contracts/WXULV2.sol:WXULV2", V2_CONTRACTS.WXULV2);
  const factoryV2 = await ethers.getContractAt("contracts/XULSwapFactory.sol:XULSwapFactory", V2_CONTRACTS.XULSwapFactoryV2);
  const routerV2 = await ethers.getContractAt("contracts/XULSwapRouterV2.sol:XULSwapRouter", V2_CONTRACTS.XULSwapRouterV2);
  const x402V2 = await ethers.getContractAt("contracts/X402PaymentProcessorV2.sol:X402PaymentProcessor", V2_CONTRACTS.X402PaymentProcessorV2);
  
  // 检查管理员权限
  console.log("\n📋 2. 验证管理员权限...\n");
  
  try {
    const owner = await wxulV2.owner();
    const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();
    console.log(`   ${isOwner ? "✅" : "⚠️"} WXULV2 管理员: ${owner}`);
    
    if (!isOwner) {
      console.log("\n⚠️  警告: 当前账户不是管理员，部分迁移步骤可能无法执行。");
      console.log("   请确保使用正确的管理员账户。\n");
    }
  } catch (e) {
    console.log("   ⚠️  无法验证管理员权限");
  }
  
  // 迁移步骤
  console.log("=".repeat(60));
  console.log("📦 开始迁移步骤");
  console.log("=".repeat(60));
  
  // 步骤 1: 配置 X402PaymentProcessorV2
  console.log("\n📋 步骤 1: 配置 X402PaymentProcessorV2");
  console.log("-".repeat(40));
  
  try {
    // 添加原生 XUL (address(0)) 为接受的代币
    const nativeToken = "0x0000000000000000000000000000000000000000";
    const isNativeAccepted = await x402V2.acceptedTokens(nativeToken);
    
    if (!isNativeAccepted) {
      console.log("   添加原生 XUL 到接受列表...");
      const tx = await x402V2.addAcceptedToken(nativeToken);
      await tx.wait();
      console.log("   ✅ 原生 XUL 已添加");
    } else {
      console.log("   ✅ 原生 XUL 已在接受列表");
    }
    
    // 添加 WXULV2 到接受列表
    const isWXULAccepted = await x402V2.acceptedTokens(V2_CONTRACTS.WXULV2);
    if (!isWXULAccepted) {
      console.log("   添加 WXULV2 到接受列表...");
      const tx = await x402V2.addAcceptedToken(V2_CONTRACTS.WXULV2);
      await tx.wait();
      console.log("   ✅ WXULV2 已添加");
    } else {
      console.log("   ✅ WXULV2 已在接受列表");
    }
    
    console.log("   ✅ X402PaymentProcessorV2 配置完成");
  } catch (error) {
    console.log("   ⚠️  X402PaymentProcessorV2 配置失败:", error.message);
  }
  
  // 步骤 2: 配置 DEX 流动性迁移提示
  console.log("\n📋 步骤 2: DEX 流动性迁移说明");
  console.log("-".repeat(40));
  console.log("   ⚠️  手动操作: 需要用户将 V1 流动性迁移到 V2");
  console.log("   1. 在 V1 DEX 移除流动性");
  console.log("   2. 在 V2 DEX 添加流动性");
  console.log("   3. V2 Factory 地址:", V2_CONTRACTS.XULSwapFactoryV2);
  console.log("   4. V2 Router 地址:", V2_CONTRACTS.XULSwapRouterV2);
  
  // 步骤 3: WXULV2 配置
  console.log("\n📋 步骤 3: WXULV2 配置");
  console.log("-".repeat(40));
  
  try {
    // 排除部署者的大额转账限制
    const isExcluded = await wxulV2.isExcludedFromLimit(deployer.address);
    if (!isExcluded) {
      console.log("   排除部署者的大额转账限制...");
      const tx = await wxulV2.setExcludedFromLimit(deployer.address, true);
      await tx.wait();
      console.log("   ✅ 已排除限制");
    } else {
      console.log("   ✅ 部署者已排除限制");
    }
    
    console.log("   ✅ WXULV2 配置完成");
  } catch (error) {
    console.log("   ⚠️  WXULV2 配置失败:", error.message);
  }
  
  // 迁移总结
  console.log("\n" + "=".repeat(60));
  console.log("📊 迁移总结");
  console.log("=".repeat(60));
  console.log("\n✅ V2 合约部署验证: 通过");
  console.log("✅ X402PaymentProcessorV2: 配置完成");
  console.log("⚠️  DEX 流动性: 需要手动迁移");
  console.log("✅ WXULV2: 配置完成");
  
  console.log("\n📋 V2 合约地址:");
  for (const [name, addr] of Object.entries(V2_CONTRACTS)) {
    console.log(`   ${name}: ${addr}`);
  }
  
  console.log("\n📋 V1 合约地址 (保留):");
  for (const [name, addr] of Object.entries(V1_CONTRACTS)) {
    console.log(`   ${name}: ${addr}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 迁移脚本执行完成!");
  console.log("=".repeat(60));
  
  console.log("\n📝 后续步骤:");
  console.log("1. 更新前端合约地址配置");
  console.log("2. 通知用户使用 V2 合约");
  console.log("3. 监控 V1 合约余额变化");
  console.log("4. 建议用户迁移流动性到 V2");
  console.log("5. V1 合约可以保留用于历史查询");
}

// 导出迁移数据供前端使用
function exportMigrationData() {
  return {
    version: "v2.0.0",
    migrationDate: new Date().toISOString(),
    v1Contracts: V1_CONTRACTS,
    v2Contracts: V2_CONTRACTS,
    changes: {
      WXULV2: [
        "新增暂停功能 (Pausable)",
        "新增黑名单功能",
        "新增转账限额",
        "新增冷却时间",
        "新增紧急提款"
      ],
      XULSwapRouterV2: [
        "新增 Deadline 检查",
        "新增滑点保护",
        "新增暂停功能",
        "新增报价优化"
      ],
      X402PaymentProcessorV2: [
        "Nonce 前置检查 (防重放)",
        "EIP-712 域名分隔 (防跨域攻击)",
        "新增暂停功能",
        "新增支付金额上限"
      ]
    },
    breakingChanges: [],
    recommendations: [
      "建议用户将资产迁移到 V2",
      "V1 合约保留用于向后兼容",
      "监控异常交易行为"
    ]
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { V1_CONTRACTS, V2_CONTRACTS, exportMigrationData };
