# XUL Chain Deployment Guide

This guide will walk you through deploying the X402 Payment Processor smart contract to XUL Chain.

## Prerequisites

1. **Node.js** >= 18.0.0
2. **pnpm** >= 8.0.0
3. **XUL Chain wallet** with XUL tokens for gas
4. **Private key** of the deployer wallet

## Step 1: Install Dependencies

```bash
cd x402-xul-protocol
pnpm install
```

## Step 2: Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# XUL Chain Configuration
XUL_RPC_URL=https://rpc.xul.chain
XUL_CHAIN_ID=1
XUL_EXPLORER_URL=https://scan.rswl.ai

# Deployer Private Key (DO NOT COMMIT!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Payment Token Address (XUL token)
PAYMENT_TOKEN=0x...

# Server Configuration
PORT=3000
NODE_ENV=production
```

⚠️ **SECURITY WARNING**: Never commit your private key to Git!

## Step 3: Compile Contracts

```bash
pnpm compile
```

This will compile the Solidity contracts and generate TypeScript type definitions.

## Step 4: Deploy to XUL Chain

### Option A: Deploy to Mainnet

```bash
pnpm deploy:xul
```

### Option B: Deploy to Testnet (if available)

```bash
pnpm deploy:testnet
```

### Option C: Deploy to Local Network (for testing)

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
pnpm deploy:local
```

## Step 5: Save Contract Address

After deployment, save the contract address to your `.env`:

```env
PAYMENT_PROCESSOR_ADDRESS=0x...deployed_contract_address
```

## Step 6: Verify Contract (Optional)

Verify your contract on the XUL Chain explorer:

```bash
npx hardhat verify --network xul-mainnet <CONTRACT_ADDRESS> <DEPLOYER_ADDRESS>
```

Example:
```bash
npx hardhat verify --network xul-mainnet 0x123...abc 0xdef...456
```

## Step 7: Configure Payment Tokens

Add accepted payment tokens to your contract:

```bash
npx hardhat run scripts/add-token.ts --network xul-mainnet <TOKEN_ADDRESS>
```

Or use the contract directly:

```javascript
// Using ethers.js
const paymentProcessor = await ethers.getContractAt(
  "X402PaymentProcessor",
  "<CONTRACT_ADDRESS>"
);

await paymentProcessor.addAcceptedToken("<TOKEN_ADDRESS>");
```

## Step 8: Authorize Facilitators (Optional)

If you want to use a facilitator service:

```javascript
await paymentProcessor.authorizeFacilitator("<FACILITATOR_ADDRESS>");
```

## Step 9: Test the Deployment

### Run Contract Tests

```bash
pnpm test
```

### Test on Testnet

1. Get testnet XUL tokens from the faucet
2. Deploy to testnet
3. Make a test payment
4. Verify on the explorer: https://scan.rswl.ai

## Contract Addresses

After deployment, your contract addresses will be:

| Contract | Address | Explorer |
|----------|---------|----------|
| X402PaymentProcessor | `0x...` | [View on scan.rswl.ai](https://scan.rswl.ai) |

## Troubleshooting

### Error: Insufficient funds

- Make sure your wallet has enough XUL for gas
- Check your balance: `npx hardhat run scripts/check-balance.ts`

### Error: Invalid RPC URL

- Verify your `XUL_RPC_URL` is correct
- Test with curl: `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://rpc.xul.chain`

### Error: Invalid chain ID

- Verify your `XUL_CHAIN_ID` matches the network
- Check the explorer for the correct chain ID

### Contract verification fails

- Make sure you're using the exact compiler settings
- Check if the contract is already verified
- Try manual verification on the explorer

## Next Steps

1. **Update your server configuration** with the deployed contract address
2. **Test the payment flow** with small amounts
3. **Monitor transactions** on the explorer
4. **Set up monitoring** for your server

## Support

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/XUL999/x402-xul-protocol/issues)
- 💬 [XUL Chain Explorer](https://scan.rswl.ai)
