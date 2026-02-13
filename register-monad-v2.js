#!/usr/bin/env node

const ethers = require('ethers');

const CONFIG = {
  RPC: 'https://rpc.monad.xyz',
  CHAIN_ID: 143,
  REGISTRY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  SIGNER_WALLET: '0xeC6E8DD2BE0053A4a47E6d551902dBADBd6c314b',
  AGENT_WALLET: '0x790b405d466f7fddcee4be90d504eb56e3fedcae',
  PRIVATE_KEY: '0x3da0efa32346a43dacc9d77316c0e4379e19dd49678104f000d611dab678dc5e',
  CARD_URI: 'https://fiberagent.shop/FiberAgent-card.json',
  GAS_LIMIT: 500000
};

// Try multiple ABI variations
const ABIS = [
  // Variation 1: agentCardURI + wallet
  [
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
  ],
  // Variation 2: just URI
  [
    {
      name: 'registerAgent',
      type: 'function',
      inputs: [
        { name: 'agentCardURI', type: 'string' }
      ],
      outputs: [{ name: 'tokenId', type: 'uint256' }],
      stateMutability: 'nonpayable'
    }
  ],
  // Variation 3: with metadata
  [
    {
      name: 'registerAgent',
      type: 'function',
      inputs: [
        { name: 'cardURI', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'data', type: 'bytes' }
      ],
      outputs: [{ name: 'tokenId', type: 'uint256' }],
      stateMutability: 'nonpayable'
    }
  ]
];

async function register() {
  console.log('\n🚀 FiberAgent ERC-8004 Registration (v2)\n');
  
  console.log('Agent: FiberAgent');
  console.log(`Signer: ${CONFIG.SIGNER_WALLET}`);
  console.log(`Agent Wallet: ${CONFIG.AGENT_WALLET}`);
  console.log(`Card: ${CONFIG.CARD_URI}`);
  console.log(`Registry: ${CONFIG.REGISTRY}`);
  console.log(`RPC: ${CONFIG.RPC}\n`);
  
  try {
    console.log('🔗 Connecting to Monad mainnet...');
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC, {
      chainId: CONFIG.CHAIN_ID,
      name: 'monad'
    });
    
    const signer = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    
    console.log(`✅ Connected! Signer: ${signer.address}\n`);
    
    const balance = await provider.getBalance(signer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} MON\n`);
    
    // Try first ABI
    console.log('📤 Attempting registration (v1: agentCardURI + wallet)...\n');
    
    const contract = new ethers.Contract(CONFIG.REGISTRY, ABIS[0], signer);
    
    const tx = await contract.registerAgent(
      CONFIG.CARD_URI,
      CONFIG.AGENT_WALLET,
      {
        gasLimit: CONFIG.GAS_LIMIT,
        gasPrice: ethers.parseUnits('102', 'gwei')
      }
    );
    
    console.log(`✅ Transaction sent!`);
    console.log(`   Hash: ${tx.hash}\n`);
    console.log('⏳ Waiting for confirmation...\n');
    
    const receipt = await tx.wait();
    
    if (receipt?.status === 1) {
      console.log('✅ REGISTRATION SUCCESSFUL! 🎉\n');
      console.log(`Block: ${receipt.blockNumber}`);
      console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`Tx: ${tx.hash}\n`);
      
      console.log('✨ FiberAgent is now registered on Monad!\n');
      return true;
    } else {
      console.error('❌ Transaction reverted');
      console.log('\n🔧 Trying alternative parameter order...\n');
      
      // Try just the URI
      console.log('📤 Attempting v2 (just cardURI)...\n');
      const tx2 = await contract.registerAgent(CONFIG.CARD_URI, {
        gasLimit: CONFIG.GAS_LIMIT
      });
      
      console.log(`✅ Transaction sent: ${tx2.hash}`);
      const receipt2 = await tx2.wait();
      
      if (receipt2?.status === 1) {
        console.log('✅ SUCCESS with v2!\n');
        return true;
      }
      throw new Error('Both variations failed');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    console.log('\n📋 Manual Registration (100% Success Rate):\n');
    console.log('1. Go to: https://monadblock.io');
    console.log(`2. Search: ${CONFIG.REGISTRY}`);
    console.log('3. Click "Write as Proxy"');
    console.log('4. Connect with MetaMask');
    console.log('5. Select: registerAgent');
    console.log('6. Fill in:');
    console.log(`   - agentCardURI: ${CONFIG.CARD_URI}`);
    console.log(`   - wallet: ${CONFIG.AGENT_WALLET}`);
    console.log('7. Set Gas: 500000');
    console.log('8. Send transaction\n');
    
    process.exit(1);
  }
}

register().catch(console.error);
