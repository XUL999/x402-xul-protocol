const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("X402PaymentProcessorV2", function () {
  let processor, owner, user;
  
  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const X402 = await ethers.getContractFactory("contracts/X402PaymentProcessorV2.sol:X402PaymentProcessor");
    processor = await X402.deploy();
    await processor.waitForDeployment();
  });
  
  it("Should deploy successfully", async () => {
    expect(await processor.getAddress()).to.be.properAddress;
  });
  
  it("Should add accepted token", async () => {
    const token = "0x1234567890123456789012345678901234567890";
    await processor.addAcceptedToken(token);
    expect(await processor.acceptedTokens(token)).to.be.true;
  });
  
  it("Should update max payment value", async () => {
    await processor.updateMaxPaymentValue(ethers.parseEther("1000"));
    expect(await processor.maxPaymentValue()).to.equal(ethers.parseEther("1000"));
  });
  
  it("Should pause and unpause", async () => {
    await processor.pause();
    await expect(
      processor.addAcceptedToken("0x1234567890123456789012345678901234567890")
    ).to.be.revertedWith("Pausable: paused");
    
    await processor.unpause();
    await processor.addAcceptedToken("0x1234567890123456789012345678901234567890");
    expect(await processor.acceptedTokens("0x1234567890123456789012345678901234567890")).to.be.true;
  });
});

describe("WXULV2", function () {
  let wxul, owner, user;
  
  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const WXUL = await ethers.getContractFactory("contracts/WXULV2.sol:WXULV2");
    wxul = await WXUL.deploy();
    await wxul.waitForDeployment();
  });
  
  it("Should deploy and accept deposits", async () => {
    expect(await wxul.getAddress()).to.be.properAddress;
    
    const depositAmount = ethers.parseEther("1");
    await owner.sendTransaction({ to: await wxul.getAddress(), value: depositAmount });
    
    expect(await ethers.provider.getBalance(await wxul.getAddress())).to.equal(depositAmount);
  });
  
  it("Should add/remove blacklist", async () => {
    const target = "0x1234567890123456789012345678901234567890";
    
    await wxul.addBlacklist(target);
    expect(await wxul.isBlacklisted(target)).to.be.true;
    
    await wxul.removeBlacklist(target);
    expect(await wxul.isBlacklisted(target)).to.be.false;
  });
  
  it("Should pause and unpause", async () => {
    await wxul.pause();
    
    await expect(
      owner.sendTransaction({ to: await wxul.getAddress(), value: ethers.parseEther("1") })
    ).to.be.reverted;
    
    await wxul.unpause();
    await owner.sendTransaction({ to: await wxul.getAddress(), value: ethers.parseEther("1") });
  });
});

describe("XULSwapPairV2", function () {
  it("Should have sync and skim functions", async () => {
    const Pair = await ethers.getContractFactory("contracts/XULSwapPairV2.sol:XULSwapPair");
    const pair = await Pair.deploy();
    await pair.waitForDeployment();
    
    expect(typeof pair.sync).to.equal("function");
    expect(typeof pair.skim).to.equal("function");
  });
});

describe("XULSwapRouterV2", function () {
  let router;
  
  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory("contracts/XULSwapFactory.sol:XULSwapFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    
    const WXUL = await ethers.getContractFactory("contracts/WXULV2.sol:WXULV2");
    const wxul = await WXUL.deploy();
    await wxul.waitForDeployment();
    
    const Router = await ethers.getContractFactory("contracts/XULSwapRouterV2.sol:XULSwapRouter");
    router = await Router.deploy(await factory.getAddress(), await wxul.getAddress());
    await router.waitForDeployment();
  });
  
  it("Should deploy successfully", async () => {
    expect(await router.getAddress()).to.be.properAddress;
  });
  
  it("Should have pause functionality", async () => {
    expect(typeof router.pause).to.equal("function");
    expect(typeof router.unpause).to.equal("function");
  });
  
  it("Should have max slippage", async () => {
    const slippage = await router.maxSlippage();
    expect(slippage).to.equal(50);
  });
});
