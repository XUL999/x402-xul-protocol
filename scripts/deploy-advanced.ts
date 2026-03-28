import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('🚀 Deploying Advanced Contracts to XUL Chain');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Deployer:', deployer.address);
  console.log('💰 Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'XUL');
  console.log('');

  // XUL Token (Native) address
  const xulToken = '0x0000000000000000000000000000000000000000';

  // Deploy XULSmartWallet
  console.log('📦 Deploying XULSmartWallet...');
  const XULSmartWallet = await ethers.getContractFactory('XULSmartWallet');
  const wallet = await XULSmartWallet.deploy();
  await wallet.waitForDeployment();
  const walletAddress = await wallet.getAddress();
  console.log('✅ XULSmartWallet:', walletAddress);

  // Deploy XULAIAgentRegistry
  console.log('📦 Deploying XULAIAgentRegistry...');
  const XULAIAgentRegistry = await ethers.getContractFactory('XULAIAgentRegistry');
  const agentRegistry = await XULAIAgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log('✅ XULAIAgentRegistry:', agentRegistryAddress);

  // Deploy XULzkMLVerifier
  console.log('📦 Deploying XULzkMLVerifier...');
  const XULzkMLVerifier = await ethers.getContractFactory('XULzkMLVerifier');
  const zkML = await XULzkMLVerifier.deploy();
  await zkML.waitForDeployment();
  const zkMLAddress = await zkML.getAddress();
  console.log('✅ XULzkMLVerifier:', zkMLAddress);

  // Deploy XULDePIN
  console.log('📦 Deploying XULDePIN...');
  const XULDePIN = await ethers.getContractFactory('XULDePIN');
  const depin = await XULDePIN.deploy(xulToken);
  await depin.waitForDeployment();
  const depinAddress = await depin.getAddress();
  console.log('✅ XULDePIN:', depinAddress);

  // Summary
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 All contracts deployed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📋 Deployment Summary:');
  console.log('   XULSmartWallet:', walletAddress);
  console.log('   XULAIAgentRegistry:', agentRegistryAddress);
  console.log('   XULzkMLVerifier:', zkMLAddress);
  console.log('   XULDePIN:', depinAddress);

  // Write to file
  const fs = require('fs');
  const deploymentData = {
    network: 'XUL Chain',
    chainId: 12309,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      XULSmartWallet: walletAddress,
      XULAIAgentRegistry: agentRegistryAddress,
      XULzkMLVerifier: zkMLAddress,
      XULDePIN: depinAddress,
    }
  };

  fs.writeFileSync(
    './deployments-advanced.json',
    JSON.stringify(deploymentData, null, 2)
  );
  console.log('');
  console.log('✅ Deployment data saved to deployments-advanced.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
