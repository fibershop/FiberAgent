#!/usr/bin/env node

const ethers = require('ethers');

// Try multiple RPC endpoints
const RPC_ENDPOINTS = [
  'https://mainnet-rpc.monad.com',
  'https://monad-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.monad.network'
];

const CONFIG = {
  REGISTRY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  WALLET: '0x790b405d466f7fddcee4be90d504eb56e3fedcae',
  PRIVATE_KEY: '0x3da0efa32346a43dacc9d77316c0e4379e19dd49678104f000d611dab678dc5e',
  CARD_URI: 'https://openshop-ten.vercel.app/FiberAgent-card.json',
  GAS_LIMIT: 300000
};

const ABI = [
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

async function register() {
  console.log('\n🚀 FiberAgent ERC-8004 Registration');
  console.log('====================================\n');
  
  console.log('Agent: FiberAgent');
  console.log(`Wallet: ${CONFIG.WALLET}`);
  console.log(`Card: ${CONFIG.CARD_URI}`);
  console.log(`Registry: ${CONFIG.REGISTRY}\n`);
  
  let provider, lastError;
  
  // Try each RPC endpoint
  for (const rpc of RPC_ENDPOINTS) {
    try {
      console.log(`🔗 Trying RPC: ${rpc}`);
      provider = new ethers.JsonRpcProvider(rpc);
      
      // Quick connection test
      const signer = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
      const balance = await provider.getBalance(signer.address);
      
      console.log(`✅ Connected!`);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} MON\n`);
      
      // Proceed with registration
      console.log('📤 Sending registration transaction...');
      const contract = new ethers.Contract(CONFIG.REGISTRY, ABI, signer);
      
      const tx = await contract.registerAgent(CONFIG.CARD_URI, CONFIG.WALLET, {
        gasLimit: CONFIG.GAS_LIMIT
      });
      
      console.log(`✅ Transaction sent!`);
      console.log(`   Hash: ${tx.hash}\n`);
      console.log('⏳ Waiting for confirmation (this may take 30-60 seconds)...\n');
      
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction not confirmed');
      }
      
      console.log('✅ REGISTRATION SUCCESSFUL! 🎉\n');
      console.log(`Block: ${receipt.blockNumber}`);
      console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`Status: SUCCESS\n`);
      
      // Try to extract token ID from events
      console.log('📌 Next Steps:');
      console.log(`1. Check transaction: https://monadblock.io/tx/${tx.hash}`);
      console.log(`2. Verify your agent: https://8004scan.io/address/${CONFIG.REGISTRY}`);
      console.log(`3. Save token ID from receipt to .env: FIBERAGENT_TOKEN_ID=xxx`);
      console.log(`4. Reputation will auto-update from purchases\n`);
      
      console.log('✨ FiberAgent is now registered on Monad mainnet!');
      console.log('Judges can verify your identity and reputation on-chain.\n');
      
      return true;
      
    } catch (error) {
      lastError = error;
      console.log(`❌ Failed: ${error.message}\n`);
      continue;
    }
  }
  
  // If all RPC endpoints failed
  console.error('\n❌ Could not connect to Monad RPC endpoints');
  console.error('Reason:', lastError?.message);
  console.log('\n📋 Complete registration manually:\n');
  
  console.log('1. Open MetaMask → Switch to Monad Mainnet');
  console.log('2. Visit: https://monadblock.io');
  console.log('3. Enter Registry Address:');
  console.log(`   ${CONFIG.REGISTRY}\n`);
  
  console.log('4. Click "Write as Proxy" or "Write Contract"');
  console.log('5. Select: registerAgent');
  console.log('6. Fill parameters:');
  console.log(`   agentCardURI: ${CONFIG.CARD_URI}`);
  console.log(`   wallet: ${CONFIG.WALLET}\n`);
  
  console.log('7. Set Gas Limit: 300000');
  console.log('8. Click "Send Transaction"');
  console.log('9. Confirm in MetaMask\n');
  
  console.log('✅ All assets are ready. Manual registration takes 2 minutes.\n');
}

register().catch(console.error);
