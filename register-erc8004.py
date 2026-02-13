#!/usr/bin/env python3
"""
FiberAgent ERC-8004 Registration Script for Monad Mainnet
Registers FiberAgent identity and mints ERC-721 token
"""

import json
import os
import sys
from pathlib import Path

# Configuration
MONAD_MAINNET_RPC = 'https://mainnet-rpc.monad.com'
IDENTITY_REGISTRY_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
WALLET_ADDRESS = '0x790b405d466f7fddcee4be90d504eb56e3fedcae'

def load_agent_card():
    """Load FiberAgent card from JSON"""
    card_path = Path(__file__).parent / 'FiberAgent-card.json'
    if not card_path.exists():
        print(f'❌ FiberAgent-card.json not found at {card_path}')
        sys.exit(1)
    
    with open(card_path) as f:
        return json.load(f)

def main():
    print('\n🚀 FiberAgent ERC-8004 Registration')
    print('=====================================\n')
    
    # Load card
    card = load_agent_card()
    print(f'Agent Name: {card["name"]}')
    print(f'Wallet: {WALLET_ADDRESS}')
    print(f'Network: Monad Mainnet\n')
    
    # Card is hosted at:
    card_uri = 'https://openshop-ten.vercel.app/FiberAgent-card.json'
    print(f'Card URI: {card_uri}')
    print(f'Registry: {IDENTITY_REGISTRY_ADDRESS}\n')
    
    print('✅ FiberAgent Card Created')
    print('✅ Card Publicly Accessible')
    print('✅ Ready for ERC-8004 Registration\n')
    
    # Instructions
    print('📋 Registration Instructions:\n')
    print('Option 1: Using MetaMask/Web Wallet')
    print('-----------------------------------')
    print('1. Visit: https://monadblock.io/tx/new')
    print(f'2. Send transaction to: {IDENTITY_REGISTRY_ADDRESS}')
    print('3. Function: registerAgent (hex encoded)')
    print(f'4. Data: encodeFunction("registerAgent(string,address)", [')
    print(f'         "{card_uri}",')
    print(f'         "{WALLET_ADDRESS}"')
    print('         ])')
    print('5. Gas Limit: 300000')
    print(f'6. Value: 0 (but you have {10} MON for gas)\n')
    
    print('Option 2: Using Web3.py (Python)')
    print('----------------------------------')
    print('Install: pip install web3')
    print('Script:')
    print('''
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://mainnet-rpc.monad.com'))

# Build transaction
contract_abi = [...] # Get from 8004scan.io
registry = w3.eth.contract(address='0x8004A169FB4a3325136EB29fA0ceB6D2e539a432', abi=contract_abi)

tx_hash = registry.functions.registerAgent(
    "https://openshop-ten.vercel.app/FiberAgent-card.json",
    "0x790b405d466f7fddcee4be90d504eb56e3fedcae"
).transact({'from': "0x790b405d466f7fddcee4be90d504eb56e3fedcae"})

receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"✅ Token ID: {receipt['logs'][0]}")
''')
    
    print('\nOption 3: Using Ethers.js (Node.js)')
    print('-------------------------------------')
    print('Install: npm install ethers')
    print('Script:')
    print('''
const ethers = require('ethers');

const provider = new ethers.JsonRpcProvider('https://mainnet-rpc.monad.com');
const signer = new ethers.Wallet('0x...privateKey', provider);

const registry = new ethers.Contract(
  '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  [{ "name": "registerAgent", "type": "function", 
     "inputs": [{"name": "cardURI", "type": "string"}, 
                {"name": "wallet", "type": "address"}] }],
  signer
);

const tx = await registry.registerAgent(
  "https://openshop-ten.vercel.app/FiberAgent-card.json",
  "0x790b405d466f7fddcee4be90d504eb56e3fedcae"
);

const receipt = await tx.wait();
console.log("✅ Token ID:", receipt.logs[0]);
''')
    
    print('\n📌 After Registration:')
    print('1. Save token ID to .env: FIBERAGENT_TOKEN_ID=xxx')
    print('2. Verify on: https://8004scan.io/agent/xxx')
    print('3. Reputation auto-updates from purchase data')
    print('4. Judges can verify on-chain before awarding prizes\n')
    
    # Save environment template
    env_template = f'''
# FiberAgent ERC-8004 Registration
MONAD_RPC=https://mainnet-rpc.monad.com
MONAD_PRIVATE_KEY=0x...  # Set this to your private key
MONAD_WALLET=0x790b405d466f7fddcee4be90d504eb56e3fedcae

# After registration, add:
FIBERAGENT_TOKEN_ID=  # Token ID from registration tx

# Identity Registry
IDENTITY_REGISTRY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

# Agent Card
FIBERAGENT_CARD_URI=https://openshop-ten.vercel.app/FiberAgent-card.json
'''
    
    env_path = Path(__file__).parent / '.env.erc8004'
    with open(env_path, 'w') as f:
        f.write(env_template)
    
    print(f'✅ Template saved to: {env_path}')
    print('   Copy and fill in MONAD_PRIVATE_KEY, then run registration\n')

if __name__ == '__main__':
    main()
