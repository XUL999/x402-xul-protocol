# Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/XUL999/x402-xul-protocol.git
cd x402-xul-protocol

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Build
pnpm build

# Run server
pnpm start
```

## Usage Examples

### 1. Server Side - Protect an API endpoint

```typescript
import { X402Server, createPaymentMiddleware } from 'x402-xul-protocol';

const server = new X402Server({
  chainId: 'xul-mainnet',
  rpcUrl: 'https://rpc.xul.chain',
  paymentToken: '0x...' // XUL token address
});

const paymentMiddleware = createPaymentMiddleware({
  chainId: 'xul-mainnet',
  rpcUrl: 'https://rpc.xul.chain',
  paymentToken: '0x...',
  minPaymentAmount: '1000000000000000000' // 1 XUL
});

// Protect an endpoint
server.use('/api/premium', paymentMiddleware, (req, res) => {
  res.json({ data: 'Premium content unlocked!' });
});

server.listen(3000);
```

### 2. Client Side - Make a payment request

```typescript
import { X402Client } from 'x402-xul-protocol';
import { ethers } from 'ethers';

// Initialize wallet
const provider = new ethers.JsonRpcProvider('https://rpc.xul.chain');
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Create client
const client = new X402Client({
  chainId: 'xul-mainnet',
  rpcUrl: 'https://rpc.xul.chain',
  paymentToken: '0x...'
}, wallet);

// Make payment request
const response = await client.pay('https://api.example.com/premium', '1000000000000000000');
const data = await response.json();
console.log(data);
```

### 3. Generate payment headers manually

```typescript
import { X402Client } from 'x402-xul-protocol';

const client = new X402Client(config, wallet);

// Generate payment headers
const headers = await client.generatePaymentHeaders(
  recipientAddress,
  '1000000000000000000' // 1 XUL
);

// Use headers in any HTTP request
const response = await fetch('https://api.example.com/premium', {
  headers: headers
});
```

## Smart Contract Deployment

1. Deploy the payment processor contract:

```bash
# Using Hardhat
npx hardhat run scripts/deploy.ts --network xul-mainnet
```

2. Update your `.env` with the contract address:

```
PAYMENT_TOKEN=0x...your_deployed_contract_address
```

## Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```

## API Reference

### Server Methods

- `new X402Server(config)` - Create server instance
- `server.use(path, middleware)` - Add middleware
- `server.verifyPaymentFromHeaders(req)` - Verify payment
- `server.settlePayment(payment)` - Settle payment
- `server.listen(port)` - Start server

### Client Methods

- `new X402Client(config, signer)` - Create client instance
- `client.createPayment(to, amount)` - Create payment payload
- `client.generatePaymentHeaders(to, amount)` - Generate HTTP headers
- `client.pay(url, amount)` - Make payment request
- `client.getBalance()` - Get wallet balance

### Middleware

- `createPaymentMiddleware(config)` - Create Express middleware
- `x402Middleware` - Default middleware instance

## Support

- 📖 [Documentation](./README.md)
- 🌐 [XUL Chain Explorer](https://scan.rswl.ai)
- 💬 [Issues](https://github.com/XUL999/x402-xul-protocol/issues)
