/**
 * X402 Client SDK for XUL Chain
 */

import { ethers } from 'ethers';
import { X402Config, PaymentPayload, PaymentResult, X402PaymentHeader } from './types';

export class X402Client {
  private config: X402Config;
  private signer?: ethers.Signer;
  private provider: ethers.JsonRpcProvider;

  constructor(config: X402Config, signer?: ethers.Signer) {
    this.config = {
      minPaymentAmount: '1000000000000000000',
      timeout: 30000,
      ...config,
    };
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    this.signer = signer;
  }

  /**
   * Set signer for signing payments
   */
  setSigner(signer: ethers.Signer): void {
    this.signer = signer;
  }

  /**
   * Create payment payload
   */
  async createPayment(
    to: string,
    amount: string,
    validForSeconds: number = 3600
  ): Promise<PaymentPayload> {
    if (!this.signer) {
      throw new Error('Signer not set. Call setSigner() first.');
    }

    const from = await this.signer.getAddress();
    const validAfter = Math.floor(Date.now() / 1000);
    const validBefore = validAfter + validForSeconds;
    const nonce = ethers.hexlify(ethers.randomBytes(32));

    const authorization = {
      from,
      to,
      value: amount,
      validAfter,
      validBefore,
      nonce,
    };

    // Create message to sign
    const messageHash = this.createMessageHash(authorization);
    const signature = await this.signer.signMessage(ethers.getBytes(messageHash));

    return {
      x402Version: 1,
      scheme: 'exact',
      network: this.config.chainId,
      asset: {
        address: this.config.paymentToken,
        chainId: this.config.chainId,
      },
      payload: {
        signature,
        authorization,
      },
    };
  }

  /**
   * Create message hash for signing
   */
  private createMessageHash(auth: {
    from: string;
    to: string;
    value: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
  }): string {
    return ethers.solidityPackedKeccak256(
      ['address', 'address', 'uint256', 'uint48', 'uint48', 'bytes32'],
      [auth.from, auth.to, auth.value, auth.validAfter, auth.validBefore, auth.nonce]
    );
  }

  /**
   * Generate payment headers for HTTP request
   */
  async generatePaymentHeaders(
    to: string,
    amount: string
  ): Promise<X402PaymentHeader> {
    const payment = await this.createPayment(to, amount);
    
    const paymentBase64 = Buffer.from(JSON.stringify(payment)).toString('base64');

    return {
      'X-Payment': paymentBase64,
      'X-Payment-Signature': payment.payload.signature,
      'X-Payment-From': payment.payload.authorization.from,
      'X-Payment-To': payment.payload.authorization.to,
      'X-Payment-Amount': payment.payload.authorization.value,
      'X-Payment-Chain': payment.network,
    };
  }

  /**
   * Make payment request
   */
  async pay(url: string, amount: string): Promise<Response> {
    const to = await this.extractRecipientFromUrl(url);
    const headers = await this.generatePaymentHeaders(to, amount);

    const response = await fetch(url, {
      method: 'GET',
      headers: headers as Record<string, string>,
    });

    return response;
  }

  /**
   * Check payment status
   */
  async checkPayment(paymentId: string): Promise<{ settled: boolean }> {
    // In production, query the blockchain or payment service
    return {
      settled: false,
    };
  }

  /**
   * Get account balance
   */
  async getBalance(address?: string): Promise<string> {
    const addr = address || (await this.signer?.getAddress());
    if (!addr) throw new Error('Address not provided and signer not set');

    const balance = await this.provider.getBalance(addr);
    return ethers.formatEther(balance);
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenAddress: string, walletAddress?: string): Promise<string> {
    const addr = walletAddress || (await this.signer?.getAddress());
    if (!addr) throw new Error('Address not provided and signer not set');

    const erc20Abi = ['function balanceOf(address) view returns (uint256)'];
    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
    
    const balance = await contract.balanceOf(addr);
    return ethers.formatEther(balance);
  }

  /**
   * Extract recipient address from URL
   */
  private async extractRecipientFromUrl(url: string): Promise<string> {
    // In production, fetch payment requirements from the server
    // For now, use configured payment token address
    return this.config.paymentToken;
  }
}
