import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('🌐 Deploying XULTranslator to XUL Chain');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Deployer:', deployer.address);

  // XUL Token address (native)
  const xulToken = '0x0000000000000000000000000000000000000000';

  // Deploy XULTranslator
  console.log('📦 Deploying XULTranslator...');
  const XULTranslator = await ethers.getContractFactory('XULTranslator');
  const translator = await XULTranslator.deploy(xulToken);
  await translator.waitForDeployment();
  const translatorAddress = await translator.getAddress();
  console.log('✅ XULTranslator:', translatorAddress);

  // Add deployer as AI verifier
  console.log('🔧 Configuring AI verifier...');
  await translator.addAIVerifier(deployer.address);
  console.log('✅ AI verifier added');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 XULTranslator deployed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Contract Address:', translatorAddress);
  console.log('');
  console.log('🌐 Supported Languages:');
  console.log('   - 中文 (ZH)');
  console.log('   - English (EN)');
  console.log('   - 日本語 (JA)');
  console.log('   - 한국어 (KO)');
  console.log('   - Français (FR)');
  console.log('   - Deutsch (DE)');
  console.log('   - Español (ES)');
  console.log('   - Русский (RU)');
  console.log('   - العربية (AR)');
  console.log('   - Português (PT)');
  console.log('   - Italiano (IT)');
  console.log('   - Tiếng Việt (VI)');
  console.log('   - ไทย (TH)');
  console.log('   - Bahasa Indonesia (ID)');
  console.log('   - Bahasa Melayu (MS)');

  // Write to file
  const fs = require('fs');
  const deploymentData = JSON.parse(fs.readFileSync('./deployments-advanced.json', 'utf8'));
  deploymentData.contracts.XULTranslator = translatorAddress;
  fs.writeFileSync('./deployments-advanced.json', JSON.stringify(deploymentData, null, 2));
  console.log('');
  console.log('✅ Updated deployments-advanced.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
