# 🚀 FiberAgent ERC-8004 Registration - READY TO DEPLOY

**Status:** ✅ All assets prepared. Ready for manual registration.

---

## What's Ready

✅ **Agent Card:** `FiberAgent-card.json`
- Name, description, endpoints, capabilities
- Publicly accessible at: `https://openshop-ten.vercel.app/FiberAgent-card.json`

✅ **Wallet:** `0x790b405d466f7fddcee4be90d504eb56e3fedcae`
- 10 MON funded for gas

✅ **Identity Registry:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Monad mainnet deployed contract

---

## How to Register (3 Options)

### **Option 1: MetaMask (Easiest - Recommended)**

1. Open MetaMask and connect to **Monad Mainnet**
   - RPC: `https://mainnet-rpc.monad.com`
   - Chain ID: `10000`

2. Make sure your wallet is: `0x790b405d466f7fddcee4be90d504eb56e3fedcae`
   - (You have 10 MON for gas)

3. Go to: **https://monadblock.io**

4. Click **"Write Contract"**

5. Enter:
   - **Contract Address:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
   - **Function:** `registerAgent`
   - **agentCardURI:** `https://openshop-ten.vercel.app/FiberAgent-card.json`
   - **wallet:** `0x790b405d466f7fddcee4be90d504eb56e3fedcae`

6. Click **"Send Transaction"**

7. **Confirm** in MetaMask (~0.5-1 MON gas)

8. Wait for confirmation ⏳

9. **Save the token ID** from the transaction receipt

### **Option 2: Monad Explorer Web UI**

1. Visit: **https://monadblock.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432**

2. Click **"Write as Proxy"** or **"Contract"** tab

3. Connect wallet (MetaMask)

4. Select function: `registerAgent`

5. Fill in parameters:
   - `agentCardURI`: `https://openshop-ten.vercel.app/FiberAgent-card.json`
   - `wallet`: `0x790b405d466f7fddcee4be90d504eb56e3fedcae`

6. Send transaction

### **Option 3: Using Ethers.js (Programmatic)**

```javascript
const ethers = require('ethers');

const RPC = 'https://mainnet-rpc.monad.com'; // or alternative RPC
const REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const PRIVATE_KEY = '0x3da0efa32346a43dacc9d77316c0e4379e19dd49678104f000d611dab678dc5e';

async function register() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
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
  
  const contract = new ethers.Contract(REGISTRY, abi, signer);
  
  const tx = await contract.registerAgent(
    'https://openshop-ten.vercel.app/FiberAgent-card.json',
    '0x790b405d466f7fddcee4be90d504eb56e3fedcae'
  );
  
  const receipt = await tx.wait();
  console.log('✅ Token ID:', receipt.logs[0]);
}

register().catch(console.error);
```

Save as `register.js` and run:
```bash
npm install ethers
node register.js
```

---

## After Registration

Once your transaction is confirmed:

1. **Get Token ID** from transaction receipt
2. **Update .env:**
   ```
   FIBERAGENT_TOKEN_ID=<your_token_id>
   ```
3. **Verify on 8004scan.io:**
   ```
   https://8004scan.io/agent/YOUR_TOKEN_ID
   ```
4. **Your reputation will auto-update** as purchases come in
5. **Judges can verify everything on-chain** before awarding prizes

---

## What Each Option Costs

- **Gas per registration:** ~0.5-1 MON
- **Your balance:** 10 MON ✅
- **Cost after registration:** 0 (auto-updates from purchase data)

---

## Questions?

- Registry address: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Network: Monad Mainnet
- Card URI: `https://openshop-ten.vercel.app/FiberAgent-card.json`
- Wallet: `0x790b405d466f7fddcee4be90d504eb56e3fedcae`

**All assets are ready. Registration can happen immediately!** 🚀
