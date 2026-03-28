/**
 * X402 Protocol Utility Functions
 */

import { ethers } from 'ethers';
import { PaymentPayload, X402Config, VerificationResult } from '../types';

/**
 * Parse payment header from base64 encoded string
 */
export async function parsePaymentHeader(
  paymentHeader: string,
  signature: string
): Promise<PaymentPayload> {
  try {
    // Decode base64 payment
    const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
    const payment: PaymentPayload = JSON.parse(decoded);

    // Verify signature matches
    if (payment.payload.signature !== signature) {
      throw new Error('Signature mismatch');
    }

    return payment;
  } catch (error) {
    throw new Error(`Failed to parse payment header: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify payment validity
 */
export async function verifyPayment(
  payment: PaymentPayload,
  provider: ethers.JsonRpcProvider,
  config: X402Config
): Promise<VerificationResult> {
  try {
    // Check version
    if (payment.x402Version !== 1) {
      return { isValid: false, error: 'Unsupported X402 version' };
    }

    // Check network
    if (payment.network !== config.chainId) {
      return { isValid: false, error: `Wrong network. Expected ${config.chainId}, got ${payment.network}` };
    }

    // Check asset
    if (payment.asset.address.toLowerCase() !== config.paymentToken.toLowerCase()) {
      return { isValid: false, error: 'Invalid payment token' };
    }

    // Check amount
    const minAmount = BigInt(config.minPaymentAmount || '1000000000000000000');
    const paymentAmount = BigInt(payment.payload.authorization.value);

    if (paymentAmount < minAmount) {
      return { isValid: false, error: `Payment amount too low. Minimum: ${minAmount.toString()}` };
    }

    // Check timing
    const now = Math.floor(Date.now() / 1000);
    const { validAfter, validBefore } = payment.payload.authorization;

    if (now < validAfter) {
      return { isValid: false, error: 'Payment not yet valid' };
    }

    if (now > validBefore) {
      return { isValid: false, error: 'Payment expired' };
    }

    // Verify signature
    const isValidSig = await verifySignature(payment);
    if (!isValidSig) {
      return { isValid: false, error: 'Invalid signature' };
    }

    // Check if nonce has been used (would need on-chain verification in production)
    // const nonceUsed = await checkNonceUsed(payment.payload.authorization.nonce, provider);
    // if (nonceUsed) {
    //   return { isValid: false, error: 'Payment nonce already used' };
    // }

    return { isValid: true, payment };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify payment signature
 */
export async function verifySignature(payment: PaymentPayload): Promise<boolean> {
  try {
    const { authorization, signature } = payment.payload;

    // Recreate message hash
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'address', 'uint256', 'uint48', 'uint48', 'bytes32'],
      [
        authorization.from,
        authorization.to,
        authorization.value,
        authorization.validAfter,
        authorization.validBefore,
        authorization.nonce,
      ]
    );

    // Recover signer address
    const recoveredAddress = ethers.verifyMessage(
      ethers.getBytes(messageHash),
      signature
    );

    // Check if recovered address matches from address
    return recoveredAddress.toLowerCase() === authorization.from.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Format payment for display
 */
export function formatPayment(payment: PaymentPayload): string {
  const amount = ethers.formatEther(payment.payload.authorization.value);
  const from = payment.payload.authorization.from;
  const to = payment.payload.authorization.to;
  
  return `${amount} tokens from ${from.slice(0, 8)}... to ${to.slice(0, 8)}...`;
}

/**
 * Calculate payment hash (for tracking)
 */
export function calculatePaymentHash(payment: PaymentPayload): string {
  const data = JSON.stringify({
    from: payment.payload.authorization.from,
    to: payment.payload.authorization.to,
    value: payment.payload.authorization.value,
    nonce: payment.payload.authorization.nonce,
  });
  
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

/**
 * Check if address is valid
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Convert amount to wei
 */
export function toWei(amount: string): string {
  return ethers.parseEther(amount).toString();
}

/**
 * Convert amount from wei
 */
export function fromWei(wei: string): string {
  return ethers.formatEther(BigInt(wei));
}
