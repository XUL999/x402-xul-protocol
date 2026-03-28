# X402 Protocol Deployment Record

## XUL Chain Mainnet

**Deployment Date:** 2026-03-28

### Contract Addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| X402PaymentProcessor | `0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6` | [View](https://scan.rswl.ai/address/0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6) |

### Network Details

- **Chain ID:** 12309
- **RPC URL:** https://pro.rswl.ai
- **Explorer:** https://scan.rswl.ai
- **Owner:** `0xC2F803f72033210718dbF150301b5A88Bb2C12CC`

### Deployment Info

```json
{
  "network": "xul-mainnet",
  "chainId": 12309,
  "contracts": {
    "X402PaymentProcessor": "0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6"
  },
  "deployer": "0xC2F803f72033210718dbF150301b5A88Bb2C12CC",
  "timestamp": "2026-03-28T06:15:09.842Z",
  "explorer": "https://scan.rswl.ai/address/0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6"
}
```

### Usage

#### Server Configuration

```typescript
import { X402Server } from 'x402-xul-protocol';

const server = new X402Server({
  chainId: '12309',
  rpcUrl: 'https://pro.rswl.ai',
  paymentToken: '0x...', // XUL token address
  paymentProcessorAddress: '0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6'
});
```

#### Client Configuration

```typescript
import { X402Client } from 'x402-xul-protocol';

const client = new X402Client({
  chainId: '12309',
  rpcUrl: 'https://pro.rswl.ai',
  paymentToken: '0x...',
  paymentProcessorAddress: '0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6'
}, signer);
```

### Next Steps

1. ✅ Contract deployed
2. ⏳ Add accepted payment tokens
3. ⏳ Test payment flow
4. ⏳ Verify contract on explorer
5. ⏳ Update documentation

## Security

- Contract owner has full control over:
  - Adding/removing accepted tokens
  - Authorizing/deauthorizing facilitators
- Consider using a multisig wallet for production
