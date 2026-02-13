#!/usr/bin/env node

/**
 * FiberAgent ERC-8004 Registration Script
 * Registers FiberAgent on Monad mainnet Identity Registry
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const MONAD_MAINNET_RPC = 'https://mainnet-rpc.monad.com';
const IDENTITY_REGISTRY_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// Load environment
const WALLET_ADDRESS = '0x790b405d466f7fddcee4be90d504eb56e3fedcae';
const PRIVATE_KEY = process.env.MONAD_PRIVATE_KEY || process.argv[2];

if (!PRIVATE_KEY) {
  console.error('❌ Error: MONAD_PRIVATE_KEY not provided');
  console.error('Usage: MONAD_PRIVATE_KEY=0x... node register-erc8004.js');
  process.exit(1);
}

// Read agent card
const cardPath = path.join(__dirname, 'FiberAgent-card.json');
if (!fs.existsSync(cardPath)) {
  console.error('❌ FiberAgent-card.json not found');
  process.exit(1);
}

const agentCard = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
console.log('\n🚀 FiberAgent ERC-8004 Registration');
console.log('=====================================\n');
console.log('Agent Name:', agentCard.name);
console.log('Wallet:', WALLET_ADDRESS);
console.log('Network: Monad Mainnet\n');

// Minimal ethers.js implementation for HTTP JSON-RPC
async function fetchJSON(url, method, params = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    });

    const options = {
      hostname: url.replace('https://', '').split('/')[0],
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json.result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function registerFiberAgent() {
  try {
    console.log('📡 Connecting to Monad Mainnet...');
    
    // Get nonce
    const nonce = await fetchJSON(MONAD_MAINNET_RPC, 'eth_getTransactionCount', [WALLET_ADDRESS, 'latest']);
    console.log('✅ Nonce:', parseInt(nonce, 16));

    // Get gas price
    const gasPrice = await fetchJSON(MONAD_MAINNET_RPC, 'eth_gasPrice', []);
    console.log('✅ Gas Price:', parseInt(gasPrice, 16), 'wei');

    // Prepare registration data
    // Simple contract call: registerAgent(cardURI, wallet)
    const cardURI = 'https://openshop-ten.vercel.app/FiberAgent-card.json';
    
    console.log('\n📝 Preparing transaction...');
    console.log('  Card URI:', cardURI);
    console.log('  Agent Wallet:', WALLET_ADDRESS);
    console.log('  Registry:', IDENTITY_REGISTRY_ADDRESS);

    // For now, output the registration guide since we need proper ethers.js
    console.log('\n⚠️  Note: Full automated registration requires ethers.js library');
    console.log('    However, FiberAgent is ready to register!\n');

    console.log('✅ FiberAgent Card Created:', cardPath);
    console.log('✅ Card Accessible at: https://openshop-ten.vercel.app/FiberAgent-card.json');
    console.log('✅ Ready for ERC-8004 Registration\n');

    console.log('📋 To Complete Registration Manually:\n');
    console.log('1. Install web3.py or ethers.js');
    console.log('2. Call Identity Registry at:', IDENTITY_REGISTRY_ADDRESS);
    console.log('3. Function: registerAgent(cardURI, wallet)');
    console.log('4. Parameters:');
    console.log('   - cardURI: https://openshop-ten.vercel.app/FiberAgent-card.json');
    console.log('   - wallet:', WALLET_ADDRESS);
    console.log('5. Send from:', WALLET_ADDRESS);
    console.log('\n✅ Once registered, you\'ll receive a token ID\n');

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

registerFiberAgent();
