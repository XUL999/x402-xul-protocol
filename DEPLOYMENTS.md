# X402 Protocol Deployment Record

## XUL Chain Mainnet

**Deployment Date:** 2026-03-28

### Contract Addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| X402PaymentProcessor (v2 - Native Token Support) | `0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF` | [View](https://scan.rswl.ai/address/0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF) |
| X402PaymentProcessor (v1 - Deprecated) | `0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6` | [View](https://scan.rswl.ai/address/0x752C9A994804E6bBEf19Bd7fFb669A322f2A36E6) |

### Network Details

- **Chain ID:** 12309
- **RPC URL:** https://pro.rswl.ai
- **Explorer:** https://scan.rswl.ai
- **Owner:** `0xC2F803f72033210718dbF150301b5A88Bb2C12CC`

### Accepted Payment Tokens

| Token | Address | Type |
|-------|---------|------|
| XUL (Native) | `0x0000000000000000000000000000000000000000` | Native Token |

### Deployment Info (v2)

```json
{
  "network": "xul-mainnet",
  "chainId": 12309,
  "contracts": {
    "X402PaymentProcessor": "0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF"
  },
  "deployer": "0xC2F803f72033210718dbF150301b5A88Bb2C12CC",
  "timestamp": "2026-03-28T06:26:24.045Z",
  "explorer": "https://scan.rswl.ai/address/0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF"
}
```

### Adding Token Transaction

- **Transaction:** `0x0d8275f1c0ad257bb41da401bad31b5a2259b4c9c3ebf74468ab5c0553d0881e`
- **Explorer:** [View](https://scan.rswl.ai/tx/0x0d8275f1c0ad257bb41da401bad31b5a2259b4c9c3ebf74468ab5c0553d0881e)

### Usage

#### Server Configuration

```typescript
import { X402Server } from 'x402-xul-protocol';

const server = new X402Server({
  chainId: '12309',
  rpcUrl: 'https://pro.rswl.ai',
  paymentToken: '0x0000000000000000000000000000000000000000', // Native XUL
  paymentProcessorAddress: '0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF'
});
```

#### Client Configuration

```typescript
import { X402Client } from 'x402-xul-protocol';

const client = new X402Client({
  chainId: '12309',
  rpcUrl: 'https://pro.rswl.ai',
  paymentToken: '0x0000000000000000000000000000000000000000', // Native XUL
  paymentProcessorAddress: '0x04Ae399878a2bCE9E9e196C14C3029EFc7dF00cF'
}, signer);
```

### Features (v2)

- ✅ Support for native XUL token
- ✅ Support for ERC20 tokens
- ✅ Payment verification
- ✅ Settlement with facilitator support

### Security

- Contract owner has full control over:
  - Adding/removing accepted tokens
  - Authorizing/deauthorizing facilitators
- Consider using a multisig wallet for production

## Notes

- **USDT, USDC, BTC, ETH, BNB, OKX, TON**: These tokens are not yet deployed on XUL Chain. To use them:
  1. Deploy wrapped versions (WUSDT, WUSDC, etc.)
  2. Set up cross-chain bridges
  3. Add their addresses to the contract
- For now, use native XUL token for payments
