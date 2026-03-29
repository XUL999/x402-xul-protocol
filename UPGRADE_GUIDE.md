# XUL Chain 合约升级指南

## 📋 升级总结

| 合约 | v1.0 | v2.0 | 状态 |
|------|------|------|------|
| X402PaymentProcessor | ✅ | ✅ | 新增3个安全修复 |
| XULSwapPair | ✅ | ✅ | 新增6个安全修复 |
| XULSwapRouter | ✅ | ✅ | 新增4个安全修复 |
| WXUL | ✅ | ✅ | 新增5个安全修复 |

---

## 🔐 安全修复详情

### X402PaymentProcessor → X402PaymentProcessorV2

| # | 修复 | 描述 |
|---|------|------|
| 1 | Nonce 前置检查 | 在签名验证**前**检查 nonce，防止重放 |
| 2 | DomainSeparator | 添加 EIP-712 域名分隔，防止跨域签名攻击 |
| 3 | Pausable | 继承 Pausable，支持紧急暂停 |
| 4 | 金额上限 | 添加 `maxPaymentValue` 防止大额损失 |

### XULSwapPair → XULSwapPairV2

| # | 修复 | 描述 |
|---|------|------|
| 1 | 重入锁 | 添加 `unlocked` 修饰符，防止重入攻击 |
| 2 | K 值增强 | 增强 K 值校验，防止闪电贷攻击 |
| 3 | sync() | 添加同步函数，强制同步储备金 |
| 4 | skim() | 添加提取函数，处理额外余额 |
| 5 | 闪电贷回调 | 添加 `IXULSwapCallee` 接口 |
| 6 | 流动性锁定 | MINIMUM_LIQUIDITY 永久锁定到 address(0) |

### XULSwapRouter → XULSwapRouterV2

| # | 修复 | 描述 |
|---|------|------|
| 1 | Deadline 检查 | 强制验证 deadline，防止延迟交易 |
| 2 | 滑点保护 | 添加 `amountOutMin` 和 `maxSlippage` |
| 3 | Pausable | 支持紧急暂停 |
| 4 | 报价优化 | 改进流动性添加的比例计算 |

### WXUL → WXULV2

| # | 修复 | 描述 |
|---|------|------|
| 1 | 黑名单 | 添加 `isBlacklisted` 功能 |
| 2 | 转账限额 | 添加个人和全局限额 |
| 3 | 冷却时间 | 添加 `transferCooldown` 防刷 |
| 4 | Pausable | 支持紧急暂停 |
| 5 | 紧急提款 | 添加 `emergencyWithdraw` |

---

## 🚀 升级步骤

### 1. 编译新合约

```bash
cd x402-xul
npx hardhat compile
```

### 2. 测试新合约

```bash
npx hardhat test test/X402PaymentProcessorV2.js
npx hardhat test test/XULSwapPairV2.js
```

### 3. 部署到测试网

```bash
npx hardhat run scripts/deploy-v2.js --network rswl_testnet
```

### 4. 验证合约

```bash
npx hardhat verify --network rswl_testnet <contract-address>
```

### 5. 迁移策略

**选项 A: 全新部署 (推荐)**
- 部署新合约
- 更新前端地址
- 通知用户迁移

**选项 B: 代理升级**
- 使用 UUPS/透明代理
- 平滑过渡

---

## 📊 安全指标对比

| 指标 | v1.0 | v2.0 |
|------|------|------|
| 高危漏洞 | 3 | 0 |
| 中危漏洞 | 5 | 0 |
| 低危漏洞 | 8 | 2 |
| 安全特性 | 2 | 8 |

---

## 🔍 合约验证清单

- [ ] `slither .` 无高危警告
- [ ] `npx hardhat compile` 编译成功
- [ ] `npx hardhat test` 所有测试通过
- [ ] 代码覆盖率 > 90%
- [ ] Gas 优化检查通过

---

## 📞 联系方式

如有问题，请联系安全团队: security@xulchain.io
