import { expect } from "chai";
import { ethers } from "hardhat";
import { X402PaymentProcessor } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("X402PaymentProcessor", function () {
  let paymentProcessor: X402PaymentProcessor;
  let owner: SignerWithAddress;
  let payer: SignerWithAddress;
  let recipient: SignerWithAddress;
  let facilitator: SignerWithAddress;

  const testToken = "0x1234567890123456789012345678901234567890";

  beforeEach(async function () {
    [owner, payer, recipient, facilitator] = await ethers.getSigners();

    const X402PaymentProcessorFactory = await ethers.getContractFactory("X402PaymentProcessor");
    paymentProcessor = await X402PaymentProcessorFactory.deploy(owner.address);
    await paymentProcessor.waitForDeployment();

    // Add test token
    await paymentProcessor.addAcceptedToken(testToken);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await paymentProcessor.owner()).to.equal(owner.address);
    });

    it("Should not have any accepted tokens initially", async function () {
      expect(await paymentProcessor.acceptedTokens(testToken)).to.equal(true);
    });
  });

  describe("Token Management", function () {
    it("Should allow owner to add accepted token", async function () {
      const newToken = "0xABCDEF1234567890123456789012345678901234";
      await paymentProcessor.addAcceptedToken(newToken);
      expect(await paymentProcessor.acceptedTokens(newToken)).to.equal(true);
    });

    it("Should allow owner to remove accepted token", async function () {
      await paymentProcessor.removeAcceptedToken(testToken);
      expect(await paymentProcessor.acceptedTokens(testToken)).to.equal(false);
    });

    it("Should not allow non-owner to add token", async function () {
      const newToken = "0xABCDEF1234567890123456789012345678901234";
      await expect(
        paymentProcessor.connect(payer).addAcceptedToken(newToken)
      ).to.be.revertedWithCustomError(paymentProcessor, "OwnableUnauthorizedAccount");
    });
  });

  describe("Facilitator Management", function () {
    it("Should allow owner to authorize facilitator", async function () {
      await paymentProcessor.authorizeFacilitator(facilitator.address);
      expect(await paymentProcessor.authorizedFacilitators(facilitator.address)).to.equal(true);
    });

    it("Should allow owner to deauthorize facilitator", async function () {
      await paymentProcessor.authorizeFacilitator(facilitator.address);
      await paymentProcessor.deauthorizeFacilitator(facilitator.address);
      expect(await paymentProcessor.authorizedFacilitators(facilitator.address)).to.equal(false);
    });
  });

  describe("Payment Validation", function () {
    it("Should validate a correct payment", async function () {
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const validAfter = Math.floor(Date.now() / 1000) - 100;
      const validBefore = Math.floor(Date.now() / 1000) + 3600;
      const amount = ethers.parseEther("1.0");

      const auth = {
        from: payer.address,
        to: recipient.address,
        value: amount,
        validAfter,
        validBefore,
        nonce,
      };

      // Create message hash
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'address', 'uint256', 'uint48', 'uint48', 'bytes32'],
        [auth.from, auth.to, auth.value, auth.validAfter, auth.validBefore, auth.nonce]
      );

      // Sign the message
      const signature = await payer.signMessage(ethers.getBytes(messageHash));

      // Check if payment is valid
      const [isValid, reason] = await paymentProcessor.isPaymentValid(
        testToken,
        auth,
        signature
      );

      expect(isValid).to.equal(true);
      expect(reason).to.equal("Valid");
    });

    it("Should reject expired payment", async function () {
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const validAfter = Math.floor(Date.now() / 1000) - 7200;
      const validBefore = Math.floor(Date.now() / 1000) - 3600; // Expired
      const amount = ethers.parseEther("1.0");

      const auth = {
        from: payer.address,
        to: recipient.address,
        value: amount,
        validAfter,
        validBefore,
        nonce,
      };

      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'address', 'uint256', 'uint48', 'uint48', 'bytes32'],
        [auth.from, auth.to, auth.value, auth.validAfter, auth.validBefore, auth.nonce]
      );

      const signature = await payer.signMessage(ethers.getBytes(messageHash));

      const [isValid, reason] = await paymentProcessor.isPaymentValid(
        testToken,
        auth,
        signature
      );

      expect(isValid).to.equal(false);
      expect(reason).to.equal("Payment expired");
    });
  });
});
