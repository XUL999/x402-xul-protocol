# XUL Chain Protocol

> 🚀 XUL Chain 的完整 DeFi + AI 基础设施

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)
[![Network](https://img.shields.io/badge/Network-XUL%20Chain-00d4aa)](https://scan.rswl.ai)

## 🌐 网络信息

| 参数 | 值 |
|------|------|
| **链名称** | XUL Chain |
| **链 ID** | 12309 (0x3015) |
| **RPC** | https://pro.rswl.ai |
| **浏览器** | https://scan.rswl.ai |

---

## ✨ 功能模块

### 💰 支付协议 (X402)
- 多代币支付支持
- 原生 XUL 代币支付
- 支付验证和结算

### 🔄 DEX 交易所 (XULSwap)
- 自动做市商 (AMM)
- 代币交换
- 流动性池
- 支持多代币交易对

### 🌉 包装代币
- WUSDT, WUSDC, WBTC, WETH
- 跨链资产映射
- 标准 ERC20 接口

### 🤖 AI 功能

#### AI 代理注册 (ERC-8004)
- AI 身份 NFT
- 行为记录和信誉系统
- 资产所有权管理

#### zkML 验证器
- 零知识机器学习证明
- AI 推理验证
- 隐私保护计算

#### DePIN 网络
- 分布式计算网络
- GPU/CPU/IoT 设备注册
- AI 任务分发
- 激励机制

### 🌐 翻译系统
- **15种语言**支持
- AI 智能翻译
- 人工翻译支持
- 质量验证和信誉系统

### 📱 Web 钱包
- 创建/导入钱包
- 多代币管理
- 发送/接收
- 内置翻译功能

---

## 📋 已部署合约

### 🎉 V2 合约 (安全升级版)

> ✅ 经过安全审计，修复了 V1 中的安全漏洞

| 合约 | 地址 | 安全特性 |
|------|------|----------|
| **WXULV2** | [`0x3111...`](https://scan.rswl.ai/address/0x3111Baf82B89becc5B636d10fdeA1d2697F209F4) | 黑名单、限额、暂停 |
| **XULSwapRouterV2** | [`0x1AAd...`](https://scan.rswl.ai/address/0x1AAdFfA792e71D1e75FB61CA53E6949352B5e18B) | Deadline、滑点保护、暂停 |
| **X402PaymentProcessorV2** | [`0x1D75...`](https://scan.rswl.ai/address/0x1D754Fb5A8D1db7B83DDb2D6Fb8fD1365C8A6263) | EIP-712、Nonce检查、暂停 |
| **XULSwapFactoryV2** | [`0x9466...`](https://scan.rswl.ai/address/0x9466113e4b78b66FB2863e1C36670D47EA276Ca9) | 基础工厂 |

### 📦 V1 合约 (原有版)

| 合约 | 地址 | 功能 |
|------|------|------|
| X402PaymentProcessor | [`0x04Ae...`](https://scan.rswl.ai/address/0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF) | 支付处理器 |
| XULSwap Router | [`0x9fE6...`](https://scan.rswl.ai/address/0x9fE62F9F607feFA5806b8B36D174550Aa755917d) | DEX 路由 |
| WXUL | [`0xf6c8...`](https://scan.rswl.ai/address/0xf6c896656d8f05dC287187749ccEE04FE5589275) | 包装 XUL |
| WUSDT | [`0x79be...`](https://scan.rswl.ai/address/0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8) | 包装 USDT |
| WUSDC | [`0x41Bf...`](https://scan.rswl.ai/address/0x41Bf8fACF9af7aB03EF4dbeD5239699d2FB2a6b8) | 包装 USDC |
| WBTC | [`0x1A39...`](https://scan.rswl.ai/address/0x1A39DB2188Bf238293BE9c4706C0119cA271266f) | 包装 BTC |
| WETH | [`0x3dE4...`](https://scan.rswl.ai/address/0x3dE47F28888D90BACcD7f40D068653104A60B70F) | 包装 ETH |
| XULSmartWallet | [`0x4788...`](https://scan.rswl.ai/address/0x47887c4b47E9CE70d38B58207073b286fDb34C86) | 智能钱包 |
| XULAIAgentRegistry | [`0xa1cD...`](https://scan.rswl.ai/address/0xa1cD6f5547106903f24E1D69ADE4e9fc45E9c5f4) | AI 代理注册 |
| XULzkMLVerifier | [`0x3477...`](https://scan.rswl.ai/address/0x3477b6D7694a482117f21adD3eA5460b9f3Cc0e8) | zkML 验证器 |
| XULDePIN | [`0x060e...`](https://scan.rswl.ai/address/0x060e5a6c96B8D78bF4Ac6eF0c03cBfa8B944D8ec) | DePIN 网络 |
| XULTranslator | [`0xA0E4...`](https://scan.rswl.ai/address/0xA0E46D446ae01f0E32b327cB4ef928aB7b339A5b) | 翻译系统 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/XUL999/x402-xul-protocol.git
cd x402-xul-protocol

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 编辑 .env 文件，填入私钥
```

### 编译合约

```bash
npx hardhat compile
```

### 运行测试

```bash
npx hardhat test
```

### 部署合约

```bash
# 部署基础合约（支付、DEX、包装代币）
npx hardhat run scripts/deploy.ts --network xul-mainnet

# 部署高级功能合约
npx hardhat run scripts/deploy-advanced.ts --network xul-mainnet

# 部署翻译系统
npx hardhat run scripts/deploy-translator.ts --network xul-mainnet
```

---

## 📁 项目结构

```
x402-xul-protocol/
├── contracts/              # 智能合约
│   ├── X402PaymentProcessor.sol    # 支付处理器
│   ├── WXUL.sol                    # 包装 XUL
│   ├── XULSwapFactory.sol          # DEX 工厂
│   ├── XULSwapRouter.sol           # DEX 路由
│   ├── WUSDT.sol                   # 包装 USDT
│   ├── WUSDC.sol                   # 包装 USDC
│   ├── WBTC.sol                    # 包装 BTC
│   ├── WETH.sol                    # 包装 ETH
│   ├── XULAdvanced.sol             # 高级功能（钱包、AI、zkML、DePIN）
│   └── XULTranslator.sol           # 翻译系统
├── scripts/                # 部署脚本
├── test/                   # 测试文件
├── src/                    # SDK 和服务端代码
├── docs/                   # 文档
├── hardhat.config.ts       # Hardhat 配置
└── package.json
```

---

## 🔧 开发

### 添加新代币到支付处理器

```bash
npx hardhat run scripts/add-token.ts --network xul-mainnet
```

### 添加原生代币支持

```bash
npx hardhat run scripts/add-native-token.ts --network xul-mainnet
```

---

## 📖 文档

- [合约文档](./CONTRACTS.md) - 完整合约使用指南
- [审计报告](./AUDIT_REPORT.md) - 安全审计详情
- [升级指南](./UPGRADE_GUIDE.md) - V1 → V2 升级说明
- [部署记录](./DEPLOYMENTS.md)

---

## 🌐 支持的语言

XULTranslator 支持 **15种语言**：

| 语言 | 代码 | 语言 | 代码 |
|------|------|------|------|
| 🇨🇳 中文 | ZH | 🇺🇸 English | EN |
| 🇯🇵 日本語 | JA | 🇰🇷 한국어 | KO |
| 🇫🇷 Français | FR | 🇩🇪 Deutsch | DE |
| 🇪🇸 Español | ES | 🇷🇺 Русский | RU |
| 🇸🇦 العربية | AR | 🇵🇹 Português | PT |
| 🇮🇹 Italiano | IT | 🇻🇳 Tiếng Việt | VI |
| 🇹🇭 ไทย | TH | 🇮🇩 Bahasa Indonesia | ID |
| 🇲🇾 Bahasa Melayu | MS | | |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 链接

- **区块链浏览器**: https://scan.rswl.ai
- **GitHub**: https://github.com/XUL999/x402-xul-protocol
- **Web 钱包**: http://192.168.110.224:3000

---

## 📞 联系

- GitHub: [@XUL999](https://github.com/XUL999)

---

<p align="center">
  Made with ❤️ for XUL Chain
</p>
