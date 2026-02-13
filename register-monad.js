#!/usr/bin/env node

const ethers = require('ethers');

const CONFIG = {
  RPC: 'https://rpc.monad.xyz',
  CHAIN_ID: 143,
  REGISTRY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  WALLET: '0x790b405d466f7fddcee4be90d504eb56e3fedcae',
  PRIVATE_KEY: '0x3da0efa32346a43dacc9d77316c0e4379e19dd49678104f000d611dab678dc5e',
  CARD_URI: 'https://fiberagent.shop/FiberAgent-card.json',
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
  console.log(`Registry: ${CONFIG.REGISTRY}`);
  console.log(`RPC: ${CONFIG.RPC}`);
  console.log(`Chain ID: ${CONFIG.CHAIN_ID}\n`);
  
  try {
    console.log('🔗 Connecting to Monad mainnet...');
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC, {
      chainId: CONFIG.CHAIN_ID,
      name: 'monad'
    });
    
    const signer = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    
    console.log(`✅ Connected!`);
    console.log(`📍 Signer: ${signer.address}\n`);
    
    // Check balance
    const balance = await provider.getBalance(signer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} MON\n`);
    
    if (balance < ethers.parseEther('0.1')) {
      console.error('❌ Insufficient balance for gas. Need at least 0.1 MON');
      process.exit(1);
    }
    
    // Send transaction
    console.log('📤 Sending registration transaction...');
    console.log(`   Card: ${CONFIG.CARD_URI}`);
    console.log(`   Wallet: ${CONFIG.WALLET}\n`);
    
    const contract = new ethers.Contract(CONFIG.REGISTRY, ABI, signer);
    
    const tx = await contract.registerAgent(CONFIG.CARD_URI, CONFIG.WALLET, {
      gasLimit: CONFIG.GAS_LIMIT
    });
    
    console.log(`✅ Transaction sent!`);
    console.log(`   Hash: ${tx.hash}\n`);
    console.log('⏳ Waiting for confirmation (30-60 seconds)...\n');
    
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction not confirmed');
    }
    
    console.log('✅ REGISTRATION SUCCESSFUL! 🎉\n');
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`Status: SUCCESS\n`);
    
    console.log('📌 Next Steps:');
    console.log(`1. Check transaction: https://monadblock.io/tx/${tx.hash}`);
    console.log(`2. Check agent card: ${CONFIG.CARD_URI}`);
    console.log(`3. Verify on 8004scan: https://8004scan.io/address/${CONFIG.REGISTRY}`);
    console.log(`4. Save token ID from receipt to .env: FIBERAGENT_TOKEN_ID=xxx\n`);
    
    console.log('✨ FiberAgent is now registered on Monad mainnet!');
    console.log('Judges can verify your identity and reputation on-chain.\n');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    
    console.log('\n📋 If automated registration fails, complete manually:\n');
    
    console.log('1. Open MetaMask → Add Monad Mainnet');
    console.log(`   RPC: ${CONFIG.RPC}`);
    console.log(`   Chain ID: ${CONFIG.CHAIN_ID}`);
    console.log(`   Currency: MON\n`);
    
    console.log('2. Visit: https://monadblock.io');
    console.log(`3. Search Registry: ${CONFIG.REGISTRY}\n`);
    
    console.log('4. Click "Write as Proxy"');
    console.log('5. Select: registerAgent');
    console.log('6. Fill parameters:');
    console.log(`   agentCardURI: ${CONFIG.CARD_URI}`);
    console.log(`   wallet: ${CONFIG.WALLET}\n`);
    
    console.log('7. Set Gas Limit: 300000');
    console.log('8. Send and confirm in MetaMask\n');
    
    process.exit(1);
  }
}

register().catch(console.error);
