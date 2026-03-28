/**
 * X402 Protocol Example Server for XUL Chain
 */

import { X402Server, x402Middleware, createPaymentMiddleware } from './index';

// Configuration for XUL Chain
const config = {
  chainId: process.env.XUL_CHAIN_ID || '12309',
  rpcUrl: process.env.XUL_RPC_URL || 'https://pro.rswl.ai',
  paymentToken: process.env.PAYMENT_TOKEN || '0x0000000000000000000000000000000000000000',
  minPaymentAmount: process.env.MIN_PAYMENT_AMOUNT || '1000000000000000000',
  facilitatorUrl: process.env.FACILITATOR_URL,
};

// Create server
const server = new X402Server(config);

// Custom payment middleware for specific routes
const paymentMiddleware = createPaymentMiddleware(config);

// Public endpoint - no payment required
server.use('/api/public', (req, res) => {
  res.json({
    message: 'This is a public endpoint',
    chain: config.chainId,
    timestamp: new Date().toISOString(),
  });
});

// Protected endpoint - requires payment
server.use('/api/premium', paymentMiddleware, (req: any, res) => {
  res.json({
    message: 'This is premium content!',
    payment: {
      from: req.userAddress,
      verified: req.paymentVerified,
    },
    data: {
      analytics: 'Premium analytics data...',
      insights: 'Premium insights...',
    },
  });
});

// Get payment info
server.use('/api/payment-info', (req, res) => {
  res.json({
    acceptedTokens: server.getSupportedTokens(),
    minAmount: server.getMinPaymentAmount(),
    chainId: config.chainId,
  });
});

// Health check
server.use('/health', (req, res) => {
  res.json({ status: 'ok', chain: config.chainId });
});

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║          X402 Protocol Server for XUL Chain           ║
╠═══════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}            ║
║  Chain ID: ${config.chainId.padEnd(42)}║
║  RPC URL: ${config.rpcUrl.padEnd(42)}║
║  Payment Token: ${config.paymentToken.padEnd(37)}║
║                                                       ║
║  Endpoints:                                           ║
║  - GET /health (public)                               ║
║  - GET /api/public (public)                           ║
║  - GET /api/premium (requires payment)                 ║
║  - GET /api/payment-info (public)                      ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { server };
