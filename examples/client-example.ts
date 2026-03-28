/**
 * Example: How to use X402 Protocol Client
 * 
 * This script demonstrates how to:
 * 1. Create a payment payload
 * 2. Generate payment headers
 * 3. Make a payment request to an X402-protected endpoint
 */

import { ethers } from 'ethers';
import { X402Client } from './src/client';

// Configuration
const config = {
  chainId: 'xul-mainnet',
  rpcUrl: 'https://rpc.xul.chain',
  paymentToken: process.env.PAYMENT_TOKEN || '0x0000000000000000000000000000000000000000',
  minPaymentAmount: '1000000000000000000', // 1 XUL
};

async function main() {
  console.log('🚀 X402 Protocol Client Example\n');

  // Check if private key is provided
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in environment');
    console.log('\nPlease set your private key:');
    console.log('export PRIVATE_KEY=your_private_key_here\n');
    process.exit(1);
  }

  // Initialize wallet
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log('📝 Wallet Address:', wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'XUL\n');

  // Create X402 client
  const client = new X402Client(config, wallet);

  try {
    // Example 1: Generate payment headers
    console.log('📦 Example 1: Generate Payment Headers');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const recipientAddress = '0x1234567890123456789012345678901234567890';
    const amount = '1000000000000000000'; // 1 XUL

    const headers = await client.generatePaymentHeaders(recipientAddress, amount);

    console.log('Generated Payment Headers:');
    console.log('  X-Payment:', headers['X-Payment'].substring(0, 50) + '...');
    console.log('  X-Payment-Signature:', headers['X-Payment-Signature'].substring(0, 20) + '...');
    console.log('  X-Payment-From:', headers['X-Payment-From']);
    console.log('  X-Payment-To:', headers['X-Payment-To']);
    console.log('  X-Payment-Amount:', headers['X-Payment-Amount']);
    console.log('  X-Payment-Chain:', headers['X-Payment-Chain']);
    console.log();

    // Example 2: Create payment payload
    console.log('📦 Example 2: Create Payment Payload');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const payment = await client.createPayment(recipientAddress, amount, 3600);

    console.log('Payment Payload:');
    console.log('  Version:', payment.x402Version);
    console.log('  Scheme:', payment.scheme);
    console.log('  Network:', payment.network);
    console.log('  From:', payment.payload.authorization.from);
    console.log('  To:', payment.payload.authorization.to);
    console.log('  Value:', ethers.formatEther(payment.payload.authorization.value), 'XUL');
    console.log('  Valid After:', new Date(payment.payload.authorization.validAfter * 1000).toISOString());
    console.log('  Valid Before:', new Date(payment.payload.authorization.validBefore * 1000).toISOString());
    console.log();

    // Example 3: Make payment request (simulated)
    console.log('📦 Example 3: Payment Request to Protected API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const apiEndpoint = 'https://api.example.com/premium';

    console.log('⚠️  Note: This is a simulation. In production:');
    console.log('  1. Replace with actual API endpoint');
    console.log('  2. Ensure endpoint supports X402 protocol');
    console.log('  3. Verify payment token is accepted\n');

    // Simulated request (would work with real X402-enabled API)
    console.log('Would make request to:', apiEndpoint);
    console.log('With payment amount:', ethers.formatEther(amount), 'XUL\n');

    // Example code for making real request:
    console.log('Example code for real implementation:');
    console.log(`
const response = await client.pay(
  '${apiEndpoint}',
  '${amount}'
);

if (response.status === 402) {
  console.log('Payment required - insufficient funds or wrong token');
} else if (response.ok) {
  const data = await response.json();
  console.log('Success!', data);
}
`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Examples completed successfully!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
