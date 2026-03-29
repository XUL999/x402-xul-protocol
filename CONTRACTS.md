# XUL Chain 智能合约文档

> XUL Chain (Chain ID: 12309) 智能合约完整使用指南

## 📋 目录

- [合约概览](#-合约概览)
- [V2 合约](#-v2-合约升级版)
- [V1 合约](#-v1-合约原有版)
- [快速开始](#-快速开始)
- [合约交互](#-合约交互)
- [安全特性](#-安全特性)
- [部署信息](#-部署信息)

---

## 🔗 合约概览

### 网络配置

| 参数 | 值 |
|------|-----|
| **Chain ID** | 12309 |
| **RPC** | https://pro.rswl.ai |
| **Explorer** | https://scan.rswl.ai |

---

## 🎉 V2 合约 (升级版)

V2 合约经过安全审计，修复了 V1 中的多个安全漏洞。

### 1. WXULV2 - 包装代币

**地址**: [`0x3111Baf82B89becc5B636d10fdeA1d2697F209F4`](https://scan.rswl.ai/address/0x3111Baf82B89becc5B636d10fdeA1d2697F209F4)

```solidity
// 存款 (将 XUL 包装成 WXUL)
await wxulV2.deposit({ value: ethers.parseEther("1") });

// 取款 (将 WXUL 换回 XUL)
await wxulV2.withdraw(ethers.parseEther("1"));

// 转账
await wxulV2.transfer(recipient, ethers.parseEther("1"));
```

#### 安全特性

| 功能 | 说明 |
|------|------|
| `pause()` | 暂停所有操作 |
| `addBlacklist(addr)` | 添加地址到黑名单 |
| `removeBlacklist(addr)` | 从黑名单移除 |
| `setTransferLimit(addr, amount)` | 设置个人转账限额 |
| `setGlobalTransferLimit(amount)` | 设置全局限额 |
| `setCooldown(addr, seconds)` | 设置冷却时间 |

---

### 2. XULSwapRouterV2 - DEX 路由

**地址**: [`0x1AAdFfA792e71D1e75FB61CA53E6949352B5e18B`](https://scan.rswl.ai/address/0x1AAdFfA792e71D1e75FB61CA53E6949352B5e18B)

```solidity
// 添加流动性
await routerV2.addLiquidity(
    tokenA,           // 代币A地址
    tokenB,           // 代币B地址
    amountADesired,   // 期望数量A
    amountBDesired,   // 期望数量B
    amountAMin,       // 最小数量A (滑点保护)
    amountBMin,       // 最小数量B (滑点保护)
    to,               // 接收地址
    deadline          // 截止时间戳
);

// 移除流动性
await routerV2.removeLiquidity(
    tokenA,
    tokenB,
    liquidity,        // LP代币数量
    amountAMin,
    amountBMin,
    to,
    deadline
);

// 交换代币
await routerV2.swapExactTokensForTokens(
    amountIn,         // 输入数量
    amountOutMin,     // 最小输出数量 (滑点保护)
    path,             // 交易路径 [tokenA, tokenB, tokenC]
    to,               // 接收地址
    deadline          // 截止时间戳
);
```

#### 安全特性

| 功能 | 说明 |
|------|------|
| `pause()` | 暂停交易 |
| `unpause()` | 恢复交易 |
| `updateMaxSlippage(50)` | 设置最大滑点 (默认0.5%) |

---

### 3. X402PaymentProcessorV2 - 支付协议

**地址**: [`0x1D754Fb5A8D1db7B83DDb2D6Fb8fD1365C8A6263`](https://scan.rswl.ai/address/0x1D754Fb5A8D1db7B83DDb2D6Fb8fD1365C8A6263)

```solidity
// 授权支付
const auth = {
    from: payerAddress,
    to: recipientAddress,
    value: amount,
    validAfter: 0,
    validBefore: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
    nonce: ethers.randomBytes(32),
    domainSeparator: await processor.DOMAIN_SEPARATOR()
};

// 签名 (使用 EIP-712)
const signature = await payer.signTypedData(domain, types, auth);

// 执行支付
await processor.settlePayment(token, auth, signature);
```

#### 安全特性

| 功能 | 说明 |
|------|------|
| `pause()` | 暂停支付 |
| `updateMaxPaymentValue(max)` | 设置最大支付金额 |
| `addAcceptedToken(token)` | 添加接受的代币 |

---

### 4. XULSwapFactoryV2 - DEX 工厂

**地址**: [`0x9466113e4b78b66FB2863e1C36670D47EA276Ca9`](https://scan.rswl.ai/address/0x9466113e4b78b66FB2863e1C36670D47EA276Ca9)

```solidity
// 创建交易对
await factoryV2.createPair(tokenA, tokenB);

// 获取交易对地址
const pair = await factoryV2.getPair(tokenA, tokenB);

// 获取所有交易对数量
const pairCount = await factoryV2.allPairsLength();
```

---

## 📦 V1 合约 (原有版)

### 支付协议

| 合约 | 地址 |
|------|------|
| X402PaymentProcessor | [`0x04Ae...`](https://scan.rswl.ai/address/0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF) |
| xulPayment | [`0x6BF2...`](https://scan.rswl.ai/address/0x6BF2CE82a99a5C90178C4Ec00c94D71063f6951e) |

### DEX

| 合约 | 地址 |
|------|------|
| XULSwapFactory | [`0x0A7e...`](https://scan.rswl.ai/address/0x0A7e1C43582D9b617360F279105Febb9236664A9) |
| XULSwapRouter | [`0x9fE6...`](https://scan.rswl.ai/address/0x9fE62F9F607feFA5806b8B36D174550Aa755917d) |
| XULDEX | [`0xc246...`](https://scan.rswl.ai/address/0xc24692bd06bc4CF4c4f1bc0ddF48E01501DB0B47) |

### 代币

| 代币 | 地址 |
|------|------|
| WXUL | [`0xf6c8...`](https://scan.rswl.ai/address/0xf6c896656d8f05dC287187749ccEE04FE5589275) |
| WUSDT | [`0x79be...`](https://scan.rswl.ai/address/0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8) |
| WUSDC | [`0x41Bf...`](https://scan.rswl.ai/address/0x41Bf8fACF9af7aB03EF4dbeD5239699d2FB2a6b8) |
| WBTC | [`0x1A39...`](https://scan.rswl.ai/address/0x1A39DB2188Bf238293BE9c4706C0119cA271266f) |
| WETH | [`0x3dE4...`](https://scan.rswl.ai/address/0x3dE47F28888D90BACcD7f40D068653104A60B70F) |
| POWER Token | [`0x2222...`](https://scan.rswl.ai/address/0x2222E9644CD033AeD841434f149f787c32c3aB54) |

### AI 智能合约

| 合约 | 地址 |
|------|------|
| XULSmartWallet | [`0x4788...`](https://scan.rswl.ai/address/0x47887c4b47E9CE70d38B58207073b286fDb34C86) |
| ERC8004 | [`0xFc61...`](https://scan.rswl.ai/address/0xFc615999552c0E9D6d2Be35ebbb0D00Ef60D9548) |
| XULAIAgentRegistry | [`0xa1cD...`](https://scan.rswl.ai/address/0xa1cD6f5547106903f24E1D69ADE4e9fc45E9c5f4) |
| AIAgentIdentitySBT | [`0x4BBC...`](https://scan.rswl.ai/address/0x4BBC7F4f6d0c14571f58619A0125EAE056F9fD6a) |
| XULzkMLVerifier | [`0x3477...`](https://scan.rswl.ai/address/0x3477b6D7694a482117f21adD3eA5460b9f3Cc0e8) |

### 其他

| 合约 | 地址 |
|------|------|
| XULDePIN | [`0x060e...`](https://scan.rswl.ai/address/0x060e5a6c96B8D78bF4Ac6eF0c03cBfa8B944D8ec) |
| XULNFT | [`0x854F...`](https://scan.rswl.ai/address/0x854F5661fF614283ee5190FF7a6Ad2D39abe2012) |
| XULBridge | [`0x4d8C...`](https://scan.rswl.ai/address/0x4d8C97D58A9320a28c6630D82EADB7e50A05F424) |
| XULTranslator | [`0xA0E4...`](https://scan.rswl.ai/address/0xA0E46D446ae01f0E32b327cB4ef928aB7b339A5b) |

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境

```bash
cp .env.example .env
# 编辑 .env 设置 DEPLOYER_PRIVATE_KEY
```

### 编译合约

```bash
npx hardhat compile
```

### 运行测试

```bash
npx hardhat test
```

### 部署到 XUL Chain

```bash
npx hardhat run scripts/deploy-v2.js --network xul-mainnet
```

---

## 📖 合约交互示例

### 使用 ethers.js

```javascript
const { ethers } = require("ethers");

// 连接 RPC
const provider = new ethers.JsonRpcProvider("https://pro.rswl.ai");
const wallet = new ethers.Wallet(privateKey, provider);

// 连接 WXULV2
const wxul = new ethers.Contract(
  "0x3111Baf82B89becc5B636d10fdeA1d2697F209F4",
  ["function deposit() payable", "function withdraw(uint256)"],
  wallet
);

// 存款 1 XUL
await wxul.deposit({ value: ethers.parseEther("1") });
```

### 使用 web3.js

```javascript
const Web3 = require("web3");
const web3 = new Web3("https://pro.rswl.ai");

// WXULV2 ABI
const wxulABI = [...];
const wxul = new web3.eth.Contract(wxulABI, "0x3111Baf82B89becc5B636d10fdeA1d2697F209F4");

// 存款
await wxul.methods.deposit().send({ from: account, value: web3.utils.toWei("1") });
```

---

## 🔒 安全特性

### V2 合约安全改进

| 漏洞类型 | V1 | V2 |
|----------|-----|-----|
| 签名重放攻击 | ❌ 存在 | ✅ 已修复 |
| 闪电贷攻击 | ❌ 存在 | ✅ 已修复 |
| 无 Deadline 检查 | ❌ 存在 | ✅ 已修复 |
| 缺少暂停功能 | ❌ 存在 | ✅ 已修复 |
| 缺少黑名单 | ❌ 存在 | ✅ 已修复 |

### 审计报告

完整审计报告: [AUDIT_REPORT.md](./AUDIT_REPORT.md)

---

## 📊 部署信息

### 部署者

```
0xC2F803f72033210718dbF150301b5A88Bb2C12CC
```

### 部署时间

V2 合约部署于 2026-03-29

### Gas 消耗

| 合约 | Gas 消耗 |
|------|----------|
| WXULV2 | ~2,100,000 |
| XULSwapFactoryV2 | ~3,500,000 |
| XULSwapRouterV2 | ~2,800,000 |
| X402PaymentProcessorV2 | ~2,200,000 |

---

## 🔗 相关链接

- [XUL Chain Explorer](https://scan.rswl.ai)
- [XUL Chain RPC](https://pro.rswl.ai)
- [审计报告](./AUDIT_REPORT.md)
- [升级指南](./UPGRADE_GUIDE.md)

---

## 📝 许可证

MIT License
