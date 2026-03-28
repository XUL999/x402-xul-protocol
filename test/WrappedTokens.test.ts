import { expect } from "chai";
import { ethers } from "hardhat";
import { WUSDT, WUSDC, WBTC, WETH } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Wrapped Tokens", function () {
  let wusdt: WUSDT;
  let wusdc: WUSDC;
  let wbtc: WBTC;
  let weth: WETH;
  let owner: SignerWithAddress;
  let bridge: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, bridge, user] = await ethers.getSigners();

    // Deploy all wrapped tokens
    const WUSDTFactory = await ethers.getContractFactory("WUSDT");
    wusdt = await WUSDTFactory.deploy(owner.address);
    await wusdt.waitForDeployment();

    const WUSDCFactory = await ethers.getContractFactory("WUSDC");
    wusdc = await WUSDCFactory.deploy(owner.address);
    await wusdc.waitForDeployment();

    const WBTCFactory = await ethers.getContractFactory("WBTC");
    wbtc = await WBTCFactory.deploy(owner.address);
    await wbtc.waitForDeployment();

    const WETHFactory = await ethers.getContractFactory("WETH");
    weth = await WETHFactory.deploy(owner.address);
    await weth.waitForDeployment();
  });

  describe("WUSDT", function () {
    it("Should have correct name and symbol", async function () {
      expect(await wusdt.name()).to.equal("Wrapped USDT");
      expect(await wusdt.symbol()).to.equal("WUSDT");
    });

    it("Should have 6 decimals", async function () {
      expect(await wusdt.decimals()).to.equal(6);
    });

    it("Should allow owner to add bridge", async function () {
      await wusdt.addBridge(bridge.address);
      expect(await wusdt.bridges(bridge.address)).to.equal(true);
    });

    it("Should allow bridge to mint tokens", async function () {
      await wusdt.addBridge(bridge.address);
      await wusdt.connect(bridge).mint(user.address, ethers.parseUnits("100", 6));
      expect(await wusdt.balanceOf(user.address)).to.equal(ethers.parseUnits("100", 6));
    });

    it("Should allow bridge to burn tokens", async function () {
      await wusdt.addBridge(bridge.address);
      await wusdt.connect(bridge).mint(user.address, ethers.parseUnits("100", 6));
      await wusdt.connect(bridge).burn(user.address, ethers.parseUnits("50", 6));
      expect(await wusdt.balanceOf(user.address)).to.equal(ethers.parseUnits("50", 6));
    });

    it("Should not allow non-bridge to mint", async function () {
      await expect(
        wusdt.connect(user).mint(user.address, ethers.parseUnits("100", 6))
      ).to.be.revertedWith("Only bridge can mint");
    });
  });

  describe("WUSDC", function () {
    it("Should have correct name and symbol", async function () {
      expect(await wusdc.name()).to.equal("Wrapped USDC");
      expect(await wusdc.symbol()).to.equal("WUSDC");
    });

    it("Should have 6 decimals", async function () {
      expect(await wusdc.decimals()).to.equal(6);
    });

    it("Should allow bridge to mint tokens", async function () {
      await wusdc.addBridge(bridge.address);
      await wusdc.connect(bridge).mint(user.address, ethers.parseUnits("100", 6));
      expect(await wusdc.balanceOf(user.address)).to.equal(ethers.parseUnits("100", 6));
    });
  });

  describe("WBTC", function () {
    it("Should have correct name and symbol", async function () {
      expect(await wbtc.name()).to.equal("Wrapped BTC");
      expect(await wbtc.symbol()).to.equal("WBTC");
    });

    it("Should have 8 decimals", async function () {
      expect(await wbtc.decimals()).to.equal(8);
    });

    it("Should allow bridge to mint tokens", async function () {
      await wbtc.addBridge(bridge.address);
      await wbtc.connect(bridge).mint(user.address, ethers.parseUnits("1", 8));
      expect(await wbtc.balanceOf(user.address)).to.equal(ethers.parseUnits("1", 8));
    });
  });

  describe("WETH", function () {
    it("Should have correct name and symbol", async function () {
      expect(await weth.name()).to.equal("Wrapped ETH");
      expect(await weth.symbol()).to.equal("WETH");
    });

    it("Should have 18 decimals", async function () {
      expect(await weth.decimals()).to.equal(18);
    });

    it("Should allow bridge to mint tokens", async function () {
      await weth.addBridge(bridge.address);
      await weth.connect(bridge).mint(user.address, ethers.parseEther("1.0"));
      expect(await weth.balanceOf(user.address)).to.equal(ethers.parseEther("1.0"));
    });
  });

  describe("Bridge Management", function () {
    it("Should allow owner to remove bridge", async function () {
      await wusdt.addBridge(bridge.address);
      await wusdt.removeBridge(bridge.address);
      expect(await wusdt.bridges(bridge.address)).to.equal(false);
    });

    it("Should not allow non-owner to add bridge", async function () {
      await expect(
        wusdt.connect(user).addBridge(bridge.address)
      ).to.be.reverted;
    });
  });
});
