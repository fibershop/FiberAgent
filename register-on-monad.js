#!/usr/bin/env node

/**
 * FiberAgent ERC-8004 Registration - Execute Transaction
 * Sends registration transaction to Monad mainnet
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 FiberAgent ERC-8004 Registration\n');

const config = {
  rpc: 'https://mainnet-rpc.monad.com',
  registryAddress: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  wallet: '0x790b405d466f7fddcee4be90d504eb56e3fedcae',
  cardURI: 'https://openshop-ten.vercel.app/FiberAgent-card.json'
};

// Check if we need ethers.js
console.log('📋 Setup Instructions:');
console.log('======================\n');

console.log('1️⃣  Install Dependencies:');
console.log('   npm install ethers dotenv\n');

console.log('2️⃣  Create .env file with:');
console.log('   MONAD_PRIVATE_KEY=<your_private_key_here>\n');

console.log('3️⃣  Run Script:');
console.log('   node register-on-monad.js\n');

console.log('📝 Registration Details:');
console.log('------------------------');
console.log(`Wallet:    ${config.wallet}`);
console.log(`Registry:  ${config.registryAddress}`);
console.log(`Card URI:  ${config.cardURI}`);
console.log(`Network:   Monad Mainnet (${config.rpc})\n`);

// Try to load ethers
try {
  const ethers = require('ethers');
  console.log('✅ ethers.js found!\n');
  
  // Load private key
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create it with MONAD_PRIVATE_KEY=0x...');
    process.exit(1);
  }
  
  const env = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});
  
  const privateKey = env.MONAD_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ MONAD_PRIVATE_KEY not found in .env');
    process.exit(1);
  }
  
  // Send transaction
  (async () => {
    try {
      console.log('🔗 Connecting to Monad mainnet...');
      const provider = new ethers.JsonRpcProvider(config.rpc);
      const signer = new ethers.Wallet(privateKey, provider);
      
      console.log('✅ Signer:', signer.address);
      
      // Check balance
      const balance = await provider.getBalance(signer.address);
      console.log('💰 Balance:', ethers.formatEther(balance), 'MON\n');
      
      if (balance < ethers.parseEther('0.1')) {
        console.error('❌ Insufficient balance for gas. You need at least 0.1 MON');
        process.exit(1);
      }
      
      // Contract ABI (minimal - just registerAgent function)
      const abi = [
        {
          name: 'registerAgent',
          type: 'function',
          inputs: [
            { name: 'agentCardURI', type: 'string' },
            { name: 'wallet', type: 'address' }
          ],
          outputs: [{ name: 'tokenId', type: 'uint256' }],
          stateMutability: 'nonpayable'
        }
      ];
      
      const contract = new ethers.Contract(config.registryAddress, abi, signer);
      
      console.log('📤 Sending registration transaction...');
      console.log(`   Card URI: ${config.cardURI}`);
      console.log(`   Wallet: ${config.wallet}\n`);
      
      const tx = await contract.registerAgent(config.cardURI, config.wallet);
      console.log('✅ Transaction sent!');
      console.log(`   Hash: ${tx.hash}\n`);
      
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed!');
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`   Status: ${receipt.status === 1 ? '✅ Success' : '❌ Failed'}\n`);
      
      // Parse token ID from events
      if (receipt.logs.length > 0) {
        const event = receipt.logs[0];
        console.log('📌 Token ID (from logs): Check 8004scan.io\n');
      }
      
      console.log('🎉 FiberAgent Registered Successfully!\n');
      console.log('Next Steps:');
      console.log('1. Verify on: https://8004scan.io/address/' + config.registryAddress);
      console.log('2. Check transaction: https://monadblock.io/tx/' + tx.hash);
      console.log('3. Save token ID to .env: FIBERAGENT_TOKEN_ID=xxx\n');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.reason) console.error('   Reason:', error.reason);
      process.exit(1);
    }
  })();
  
} catch (e) {
  console.log('⚠️  ethers.js not installed. Install to auto-send:\n');
  console.log('  npm install ethers dotenv\n');
  
  console.log('Or complete registration manually:\n');
  
  console.log('Option A: MetaMask / Web3 Wallet');
  console.log('1. Open: https://monadblock.io');
  console.log('2. Send to: ' + config.registryAddress);
  console.log('3. Function: registerAgent');
  console.log('4. Parameters:');
  console.log(`   - agentCardURI: "${config.cardURI}"`);
  console.log(`   - wallet: "${config.wallet}"`);
  console.log('5. Gas: 300000');
  console.log('6. Send with 10 MON from your wallet\n');
  
  console.log('Option B: Copy & Paste into Remix IDE');
  console.log('1. Visit: https://remix.ethereum.org');
  console.log('2. Create file: registerFiberAgent.js');
  console.log('3. Paste:');
  console.log(`
const registryAddress = "${config.registryAddress}";
const cardURI = "${config.cardURI}";
const wallet = "${config.wallet}";

// Call via web3.js or ethers.js in browser
web3.eth.sendTransaction({
  to: registryAddress,
  from: wallet,
  data: web3.eth.abi.encodeFunctionCall(
    { name: 'registerAgent', type: 'function',
      inputs: [{name: 'agentCardURI', type: 'string'}, 
               {name: 'wallet', type: 'address'}] },
    [cardURI, wallet]
  ),
  gas: 300000
});
`);
}
