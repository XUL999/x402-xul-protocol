/**
 * X402 Payment Middleware for Express/Koa
 */

import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { X402Config, X402Request } from '../types';
import { verifyPayment, parsePaymentHeader } from '../utils';

/**
 * Create X402 payment middleware
 */
export function createPaymentMiddleware(config: X402Config) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentHeader = req.headers['x-payment'] as string;
      const signature = req.headers['x-payment-signature'] as string;

      // No payment header - require payment
      if (!paymentHeader) {
        return res.status(402).json({
          error: 'Payment Required',
          message: 'This endpoint requires payment via X402 protocol',
          x402: {
            version: 1,
            accepts: [{
              paymentType: 'transfer',
              asset: {
                chainId: config.chainId,
                address: config.paymentToken,
              },
              amount: config.minPaymentAmount || '1000000000000000000',
            }],
          },
        });
      }

      // Parse and verify payment
      const payment = await parsePaymentHeader(paymentHeader, signature);
      const verification = await verifyPayment(payment, provider, config);

      if (!verification.isValid) {
        return res.status(400).json({
          error: 'Invalid Payment',
          message: verification.error,
        });
      }

      // Attach payment info to request
      (req as X402Request).payment = payment;
      (req as X402Request).paymentVerified = true;
      (req as X402Request).userAddress = payment.payload.authorization.from;

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Payment Verification Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Default X402 middleware
 */
export const x402Middleware = createPaymentMiddleware({
  chainId: 'xul-mainnet',
  rpcUrl: 'https://rpc.xul.chain',
  paymentToken: '0x0000000000000000000000000000000000000000', // Replace with actual token
});
