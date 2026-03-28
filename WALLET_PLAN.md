# XUL Wallet - 项目结构

## 📁 目录结构

```
xul-wallet/
├── apps/
│   ├── mobile/              # React Native 移动端
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── WalletScreen.tsx
│   │   │   │   ├── SendScreen.tsx
│   │   │   │   ├── ReceiveScreen.tsx
│   │   │   │   ├── SwapScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── services/
│   │   └── package.json
│   │
│   ├── web/                 # Next.js Web 钱包
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   │
│   └── extension/           # 浏览器插件
│       ├── src/
│       ├── manifest.json
│       └── package.json
│
├── packages/
│   ├── core/                # 核心逻辑
│   │   ├── src/
│   │   │   ├── wallet/
│   │   │   ├── transactions/
│   │   │   └── tokens/
│   │   └── package.json
│   │
│   ├── imai/                # IMAI 服务
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   ├── chat/
│   │   │   └── analysis/
│   │   └── package.json
│   │
│   └── ui/                  # UI 组件库
│       ├── src/
│       └── package.json
│
├── services/
│   ├── api/                 # API 服务
│   ├── imai-engine/         # IMAI 引擎
│   └── notification/        # 通知服务
│
└── contracts/               # 智能合约
    └── ...
```

## 🚀 技术栈

### 移动端钱包
- **框架**: React Native + Expo
- **状态管理**: Zustand
- **加密**: ethers.js
- **UI**: React Native Paper

### Web 钱包
- **框架**: Next.js 14
- **UI**: Tailwind CSS + shadcn/ui
- **Web3**: wagmi + viem

### 浏览器插件
- **框架**: React + Vite
- **存储**: Chrome Storage API

### IMAI 服务
- **框架**: FastAPI / Node.js
- **AI**: OpenAI / Claude API
- **向量数据库**: Pinecone / Weaviate

---

## 📱 核心功能

### 钱包功能

#### 优先级 P0（核心）
- [ ] 创建/导入钱包
- [ ] 查看余额和交易历史
- [ ] 发送/接收代币
- [ ] 代币列表管理

#### 优先级 P1（重要）
- [ ] DApp 浏览器
- [ ] 代币交换（DEX）
- [ ] 跨链转账
- [ ] 地址簿

#### 优先级 P2（增强）
- [ ] NFT 展示
- [ ] 质押功能
- [ ] 治理投票
- [ ] 多签钱包

### IMAI 功能

#### 优先级 P0（核心）
- [ ] 智能客服聊天
- [ ] 交易风险提示
- [ ] 市场行情播报

#### 优先级 P1（重要）
- [ ] 交易建议
- [ ] 投资组合分析
- [ ] 合约安全审计

#### 优先级 P2（增强）
- [ ] 语音助手
- [ ] 智能策略推荐
- [ ] 社交情绪分析

---

## 🔧 开发计划

### Week 1: 基础钱包
- 钱包创建/导入
- 基础 UI 框架
- 代币显示

### Week 2: 交易功能
- 发送/接收
- 交易历史
- 手续费估算

### Week 3: IMAI 集成
- AI 聊天界面
- 风险提示系统
- 基础分析功能

### Week 4: DEX 集成
- 代币交换界面
- 流动性管理
- 价格图表

---

## 📋 技术要求

### 前端
```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "ethers": "^6.10.0",
    "zustand": "^4.5.0",
    "react-native-paper": "^5.12.0"
  }
}
```

### 后端
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "ethers": "^6.10.0",
    "openai": "^4.0.0"
  }
}
```

### 智能合约
```json
{
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0",
    "hardhat": "^2.19.0"
  }
}
```
