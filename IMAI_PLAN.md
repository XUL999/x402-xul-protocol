# IMAI - 智能助手服务

## 🤖 功能概述

IMAI (Intelligent Multi-chain AI) 是集成在钱包中的智能助手，提供：

1. **智能客服** - 回答用户问题
2. **交易建议** - 基于市场分析
3. **风险评估** - 交易/合约风险提示
4. **市场分析** - 价格趋势分析
5. **语音助手** - 语音交互（可选）

---

## 📁 服务架构

```
imai-service/
├── src/
│   ├── core/
│   │   ├── chat.ts          # 聊天核心
│   │   ├── risk.ts          # 风险评估
│   │   └── analysis.ts      # 市场分析
│   │
│   ├── tools/
│   │   ├── blockchain.ts     # 区块链工具
│   │   ├── price.ts          # 价格查询
│   │   └── contract.ts       # 合约分析
│   │
│   ├── prompts/
│   │   ├── system.ts         # 系统提示词
│   │   └── templates.ts      # 模板
│   │
│   └── index.ts
│
├── api/
│   ├── chat.ts              # 聊天 API
│   ├── analyze.ts           # 分析 API
│   └── webhook.ts           # Webhook
│
└── package.json
```

---

## 🔧 核心 API

### 1. 智能客服

```typescript
// POST /api/imai/chat
{
  "message": "如何发送 XUL 代币？",
  "context": {
    "walletAddress": "0x...",
    "chain": "xul"
  }
}

// Response
{
  "response": "发送 XUL 代币很简单：\n1. 打开钱包\n2. 点击发送\n3. 输入接收地址\n4. 输入金额\n5. 确认交易",
  "actions": [
    {
      "type": "open_screen",
      "screen": "send"
    }
  ]
}
```

### 2. 风险评估

```typescript
// POST /api/imai/risk
{
  "type": "transaction",
  "data": {
    "to": "0x...",
    "value": "1.0",
    "token": "XUL"
  }
}

// Response
{
  "risk_level": "low",
  "score": 85,
  "warnings": [],
  "recommendations": ["建议先发送小额测试"]
}
```

### 3. 市场分析

```typescript
// POST /api/imai/analyze
{
  "token": "WXUL",
  "timeframe": "24h"
}

// Response
{
  "trend": "bullish",
  "price_change": "+5.2%",
  "volume": "1,234,567",
  "recommendation": "市场情绪积极，可考虑持有"
}
```

---

## 💡 提示词系统

### System Prompt

```typescript
export const SYSTEM_PROMPT = `
你是 IMAI，XUL Chain 钱包的智能助手。

你的职责：
1. 帮助用户管理钱包资产
2. 提供交易建议和风险提示
3. 解答区块链相关问题
4. 分析市场趋势

你可以访问：
- 用户钱包地址和余额
- 实时价格数据
- 交易历史
- 合约代码

回答风格：
- 简洁明了
- 专业但易懂
- 优先用户安全
- 主动提示风险
`;
```

---

## 🔌 集成示例

### 在钱包中使用

```typescript
import { IMAI } from '@xul/imai';

// 初始化 IMAI
const imai = new IMAI({
  apiKey: 'your-api-key',
  walletAddress: '0x...',
  chain: 'xul'
});

// 聊天
const response = await imai.chat('如何购买 WXUL？');
console.log(response.text);

// 风险评估
const risk = await imai.assessRisk({
  type: 'transaction',
  to: '0x...',
  value: '1.0'
});

if (risk.level === 'high') {
  alert('⚠️ 高风险交易！');
}
```

---

## 📊 技术实现

### 核心依赖

```json
{
  "dependencies": {
    "@ai-sdk/openai": "^0.0.1",
    "ai": "^3.0.0",
    "ethers": "^6.10.0",
    "zod": "^3.22.0"
  }
}
```

### 示例代码

```typescript
// src/core/chat.ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function chat(
  message: string,
  context: WalletContext
): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    system: SYSTEM_PROMPT,
    prompt: `
用户钱包：${context.address}
余额：${context.balance} XUL
最近交易：${context.recentTransactions}

用户问题：${message}
    `,
  });
  
  return text;
}
```

---

## 🎯 开发计划

### Phase 1: 基础聊天
- [ ] AI 聊天功能
- [ ] 上下文管理
- [ ] 基础提示词

### Phase 2: 风险评估
- [ ] 交易风险分析
- [ ] 合约安全检查
- [ ] 钓鱼网站识别

### Phase 3: 市场分析
- [ ] 价格趋势分析
- [ ] 投资组合建议
- [ ] 新闻情绪分析

### Phase 4: 高级功能
- [ ] 语音助手
- [ ] 多语言支持
- [ ] 个性化推荐
