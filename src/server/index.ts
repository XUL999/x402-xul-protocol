/**
 * X402 Server Implementation for XUL Chain
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import {
  X402Config,
  PaymentPayload,
  PaymentResult,
  VerificationResult,
  FacilitatorResponse,
} from './types';
import { verifyPayment, parsePaymentHeader } from './utils';

export class X402Server {
  private app: Express;
  private config: X402Config;
  private provider: ethers.JsonRpcProvider;

  constructor(config: X402Config) {
    this.config = {
      minPaymentAmount: '1000000000000000000', // Default: 1 token (18 decimals)
      timeout: 30000,
      ...config,
    };

    this.app = express();
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS support
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, X-Payment-Signature');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  /**
   * Use middleware for payment verification
   */
  use(path: string, ...handlers: express.RequestHandler[]): void {
    this.app.use(path, ...handlers);
  }

  /**
   * Verify payment from request headers
   */
  async verifyPaymentFromHeaders(req: Request): Promise<VerificationResult> {
    try {
      const paymentHeader = req.headers['x-payment'] as string;
      const signature = req.headers['x-payment-signature'] as string;

      if (!paymentHeader) {
        return {
          isValid: false,
          error: 'Missing X-Payment header',
        };
      }

      const payment = await parsePaymentHeader(paymentHeader, signature);
      const verification = await verifyPayment(payment, this.provider, this.config);

      return verification;
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  /**
   * Settle payment via facilitator
   */
  async settlePayment(payment: PaymentPayload): Promise<PaymentResult> {
    try {
      if (!this.config.facilitatorUrl) {
        throw new Error('Facilitator URL not configured');
      }

      const response = await fetch(`${this.config.facilitatorUrl}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: payment.payload,
          scheme: payment.scheme,
        }),
      });

      const result: FacilitatorResponse = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Settlement failed',
        };
      }

      return {
        success: true,
        transactionHash: result.transaction,
        amount: payment.payload.authorization.value,
        from: payment.payload.authorization.from,
        to: payment.payload.authorization.to,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Settlement failed',
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{ settled: boolean; transaction?: string }> {
    // In production, this would query the blockchain or a database
    // For now, return a placeholder
    return {
      settled: false,
    };
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens(): string[] {
    return [this.config.paymentToken];
  }

  /**
   * Get minimum payment amount
   */
  getMinPaymentAmount(): string {
    return this.config.minPaymentAmount || '1000000000000000000';
  }

  /**
   * Start the server
   */
  listen(port: number, callback?: () => void): void {
    this.app.listen(port, () => {
      console.log(`X402 Server running on port ${port}`);
      console.log(`Chain: ${this.config.chainId}`);
      console.log(`RPC: ${this.config.rpcUrl}`);
      console.log(`Payment Token: ${this.config.paymentToken}`);
      callback?.();
    });
  }

  /**
   * Get Express app instance
   */
  getApp(): Express {
    return this.app;
  }
}
