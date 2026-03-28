# X402 Protocol for XUL Chain

Open-source implementation of the X402 Payment Protocol for XUL Chain, enabling micropayments and API monetization through HTTP 402 Payment Required status codes.

## Overview

X402 is a protocol built on HTTP/1.1's 402 Payment Required status code, designed for:
- **Micropayments**: Enable pay-per-use API access
- **Web3 Integration**: Native blockchain payment support
- **Developer Friendly**: Simple HTTP-based integration
- **XUL Chain Native**: Optimized for XUL blockchain ecosystem

## Features

✅ HTTP 402 Payment Required protocol implementation  
✅ XUL Chain blockchain integration  
✅ Micropayment support  
✅ API monetization  
✅ Web3 wallet integration  
✅ Open source & auditable  

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- XUL Chain wallet (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/XUL999/x402-xul-protocol.git
cd x402-xul-protocol

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Basic Usage

```typescript
import { X402Server } from './src/server';

const server = new X402Server({
  chainId: 'xul-mainnet',
  rpcUrl: 'https://rpc.xul.chain',
  paymentToken: '0x...' // XUL token address
});

// Protect your API endpoint
server.use('/api/premium', x402Middleware, (req, res) => {
  res.json({ data: 'Premium content' });
});

server.listen(3000);
```

## Architecture

```
x402-xul-protocol/
├── src/
│   ├── server/          # X402 server implementation
│   ├── client/          # X402 client SDK
│   ├── contracts/       # Smart contracts for XUL Chain
│   ├── middleware/      # Express/Koa middleware
│   └── utils/           # Utility functions
├── contracts/           # Solidity contracts
├── examples/            # Usage examples
├── tests/               # Test suite
└── docs/                # Documentation
```

## Smart Contracts

X402 protocol contracts are deployed on XUL Chain:

- **PaymentProcessor**: Handles payment verification and settlement
- **TokenRegistry**: Manages accepted payment tokens
- **RateLimiter**: Enforces rate limiting per user

View contracts on [XUL Chain Explorer](https://scan.rswl.ai)

## API Reference

### Server

```typescript
// Initialize X402 server
const server = new X402Server(config);

// Middleware for protecting endpoints
server.use(x402Middleware);

// Verify payment
await server.verifyPayment(paymentProof);

// Get payment status
const status = await server.getPaymentStatus(userId);
```

### Client

```typescript
import { X402Client } from './src/client';

const client = new X402Client({
  chainId: 'xul-mainnet',
  walletAddress: '0x...'
});

// Make payment
const tx = await client.pay(amount, recipient);

// Check payment status
const isPaid = await client.checkPayment(paymentId);
```

## Configuration

Create `.env` file:

```env
# XUL Chain RPC
XUL_RPC_URL=https://rpc.xul.chain
XUL_CHAIN_ID=xul-mainnet

# Payment settings
PAYMENT_TOKEN=0x...
MIN_PAYMENT_AMOUNT=1000000000000000000

# Server
PORT=3000
NODE_ENV=production
```

## Examples

### Protect API Endpoint

```typescript
import express from 'express';
import { x402Middleware } from './src/middleware';

const app = express();

app.get('/api/data', x402Middleware, (req, res) => {
  res.json({ data: 'This requires payment' });
});
```

### Client Payment

```typescript
const client = new X402Client(config);

try {
  const receipt = await client.pay({
    amount: '1000000000000000000', // 1 XUL
    recipient: '0x...',
    data: 'API_ACCESS'
  });
  
  console.log('Payment successful:', receipt.transactionHash);
} catch (error) {
  console.error('Payment failed:', error);
}
```

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/server.test.ts
```

## Deployment

### Deploy to Mainnet

```bash
# Build
pnpm build

# Deploy contracts
pnpm deploy:contracts --network xul-mainnet

# Start server
pnpm start
```

### Docker

```bash
docker build -t x402-xul .
docker run -p 3000:3000 x402-xul
```

## Documentation

- [Protocol Specification](./docs/PROTOCOL.md)
- [Smart Contract Guide](./docs/CONTRACTS.md)
- [API Documentation](./docs/API.md)
- [Integration Guide](./docs/INTEGRATION.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Security

This project has been audited. For security concerns, please email security@xul.chain

## License

MIT License - see [LICENSE](./LICENSE) file

## Support

- 📖 [Documentation](./docs)
- 💬 [Discord Community](https://discord.gg/xul)
- 🐛 [Issue Tracker](https://github.com/XUL999/x402-xul-protocol/issues)
- 📧 [Email Support](mailto:support@xul.chain)

## Roadmap

- [x] Core protocol implementation
- [x] XUL Chain integration
- [ ] Multi-chain support
- [ ] Advanced rate limiting
- [ ] Analytics dashboard
- [ ] Mobile SDK

## Acknowledgments

Built on the X402 protocol specification and inspired by the Solana ecosystem implementation.

---

**Made for XUL Chain** 🚀
