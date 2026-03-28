# X402 Protocol Deployment Record

## XUL Chain Mainnet

**Deployment Date:** 2026-03-28

---

## Smart Contracts

### X402PaymentProcessor

| 版本 | 地址 | 浏览器 |
|------|------|--------|
| v2 (当前) | `0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF` | [查看](https://scan.rswl.ai/address/0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF) |
| v1 (已弃用) | `0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6` | [查看](https://scan.rswl.ai/address/0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6) |

---

## Wrapped Tokens (跨链桥)

| 代币 | 名称 | 小数位 | 地址 | 浏览器 |
|------|------|--------|------|--------|
| **WUSDT** | Wrapped USDT | 6 | `0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8` | [查看](https://scan.rswl.ai/address/0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8) |
| **WUSDC** | Wrapped USDC | 6 | `0x41Bf8fACF9af7aB03EF4dbeD5239699d2FB2a6b8` | [查看](https://scan.rswl.ai/address/0x41Bf8fACF9af7aB03EF4dbeD5239699d2FB2a6b8) |
| **WBTC** | Wrapped BTC | 8 | `0x1A39DB2188Bf238293BE9c4706C0119cA271266f` | [查看](https://scan.rswl.ai/address/0x1A39DB2188Bf238293BE9c4706C0119cA271266f) |
| **WETH** | Wrapped ETH | 18 | `0x3dE47F28888D90BACcD7f40D068653104A60B70F` | [查看](https://scan.rswl.ai/address/0x3dE47F28888D90BACcD7f40D068653104A60B70F) |

---

## Accepted Payment Tokens

X402PaymentProcessor 当前接受以下代币作为支付：

| 代币 | 类型 | 地址 |
|------|------|------|
| **XUL** | 原生代币 | `0x0000000000000000000000000000000000000000` |
| **WUSDT** | 包装代币 | `0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8` |
| **WUSDC** | 包装代币 | `0x41Bf8fACF9af7aB03EF4dbeD5239699d2FB2a6b8` |
| **WBTC** | 包装代币 | `0x1A39DB2188Bf238293BE9c4706C0119cA271266f` |
| **WETH** | 包装代币 | `0x3dE47F28888D90BACcD7f40D068653104A60B70F` |

---

## Network Details

- **Chain ID:** 12309
- **RPC URL:** https://pro.rswl.ai
- **Explorer:** https://scan.rswl.ai
- **Owner:** `0xC2F803f72033210718dbF150301b5A88Bb2C12CC`

---

## Usage Examples

### 使用 WUSDT 支付

```typescript
import { X402Client } from 'x402-xul-protocol';

const client = new X402Client({
  chainId: '12309',
  rpcUrl: 'https://pro.rswl.ai',
  paymentToken: '0x79be35563947b6D194b3f0A22c6D4a10F7Cba5B8', // WUSDT
  paymentProcessorAddress: '0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF'
}, wallet);

// 支付 10 WUSDT
const response = await client.pay('https://api.example.com/premium', '10000000'); // 10 USDT (6 decimals)
```

### 使用 WETH 支付

```typescript
const client = new X402Client({
  chainId: '12309',
  rpcUrl: 'https://pro.rswl.ai',
  paymentToken: '0x3dE47F28888D90BACcD7f40D068653104A60B70F', // WETH
  paymentProcessorAddress: '0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF'
}, wallet);

// 支付 0.1 WETH
const response = await client.pay('https://api.example.com/premium', '100000000000000000'); // 0.1 ETH (18 decimals)
```

---

## Cross-Chain Bridge Status

| 状态 | 说明 |
|------|------|
| ⏳ **包装代币已部署** | WUSDT, WUSDC, WBTC, WETH 合约已部署 |
| ⏳ **桥接服务待搭建** | 需要部署桥合约或对接第三方桥 |
| ⏳ **流动性待提供** | 需要注入初始代币 |

### 下一步

1. **对接第三方桥**（推荐）
   - Multichain
   - LayerZero
   - Wormhole

2. **或自建桥合约**
   - 部署桥合约
   - 添加桥地址到包装代币
   - 连接外部链

---

## Security

- 所有合约所有者：`0xC2F803f72033210718dbF150301b5A88Bb2C12CC`
- 建议使用多签钱包管理生产环境合约
