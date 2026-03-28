/**
 * X402 Protocol Types
 */

export interface X402Config {
  chainId: string;
  rpcUrl: string;
  paymentToken: string;
  facilitatorUrl?: string;
  minPaymentAmount?: string;
  timeout?: number;
}

export interface PaymentPayload {
  x402Version: number;
  scheme: 'exact' | 'max';
  network: string;
  asset: {
    address: string;
    chainId: string;
  };
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: number;
      validBefore: number;
      nonce: string;
    };
  };
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  amount?: string;
  from?: string;
  to?: string;
  error?: string;
}

export interface VerificationResult {
  isValid: boolean;
  payment?: PaymentPayload;
  error?: string;
}

export interface FacilitatorResponse {
  success: boolean;
  transaction?: string;
  network?: string;
  error?: string;
}

export interface X402PaymentHeader {
  'X-Payment': string;
  'X-Payment-Signature': string;
  'X-Payment-From': string;
  'X-Payment-To': string;
  'X-Payment-Amount': string;
  'X-Payment-Chain': string;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerWindow?: number;
  windowMs?: number;
}

export interface X402Request extends Request {
  payment?: PaymentPayload;
  paymentVerified?: boolean;
  userAddress?: string;
}
