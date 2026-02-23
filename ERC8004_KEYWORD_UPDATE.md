# Update FiberAgent ERC-8004 Keywords

## Problem

FiberAgent Agent #135 on Monad is searchable, but search results are limited because the on-chain metadata doesn't have the right keywords.

**Goal:** Add keywords to ERC-8004 agent metadata so searches work properly.

---

## Recommended Keywords (Prioritized)

### MUST ADD (Tier 1)
```
shopping
commerce
cashback
crypto
monad
```

### SHOULD ADD (Tier 2)
```
affiliate
products
deals
ecommerce
rewards
commissions
```

### NICE TO ADD (Tier 3)
```
erc-8004
agent-commerce
crypto-cashback
shopping-assistant
agent-skills
ai-shopping
llm-integration
api
merchants
wildfire
```

---

## How to Update

### Method 1: Direct Smart Contract Call (Recommended)

If you have control of FiberAgent's wallet:

```javascript
// Setup
const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.monad.xyz'
);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Registry contract (find address on 8004scan)
const registryAddress = '0x...'; // From 8004scan.io
const registryABI = [...]; // Get from contract source

// Connect
const registry = new ethers.Contract(
  registryAddress,
  registryABI,
  wallet
);

// Call update
const tx = await registry.updateAgent(
  135, // Agent ID
  {
    keywords: [
      'shopping',
      'commerce',
      'cashback',
      'crypto',
      'monad',
      'affiliate',
      'products',
      'deals',
      'ecommerce',
      'rewards',
      'commissions',
      'erc-8004',
      'agent-commerce',
      'crypto-cashback',
      'shopping-assistant',
      'agent-skills',
      'ai-shopping'
    ]
  }
);

await tx.wait();
console.log('✅ Keywords updated!', tx.hash);
```

### Method 2: Via 8004scan UI

1. Visit: https://www.8004scan.io/agents/monad/135
2. Look for "Write" or "Edit Metadata" button
3. Find the `updateAgent` function
4. Enter Agent ID: `135`
5. Paste keywords array
6. Sign with your wallet
7. Done!

### Method 3: Via Monad Block Explorer

1. Find ERC-8004 registry contract on Monad explorer
2. Go to "Write Contract" section
3. Connect wallet
4. Find `updateAgent()` function
5. Enter parameters (Agent ID + keywords)
6. Execute transaction
7. Wait for confirmation

---

## Step-by-Step (8004scan Method)

1. **Go to FiberAgent's page:**
   https://www.8004scan.io/agents/monad/135

2. **Find the contract address** (usually shown as "Implementation" or "Contract")

3. **Click to go to Monad block explorer**

4. **Look for "Write Contract" tab**

5. **Find the function that updates agent metadata** (likely `updateAgent` or `setAgentMetadata`)

6. **Connect your wallet** (MetaMask, etc.)

7. **Fill in:**
   - Agent ID: `135`
   - Keywords: Copy-paste the list from above

8. **Click "Write"**

9. **Sign in your wallet**

10. **Wait for confirmation** (~2-5 seconds on Monad)

11. **Verify:** Search 8004scan for "shopping" — FiberAgent should appear!

---

## Verification

After update, test these searches on 8004scan:

```
https://www.8004scan.io/agents?chain=143&search=shopping    → FiberAgent appears ✅
https://www.8004scan.io/agents?chain=143&search=cashback    → FiberAgent appears ✅
https://www.8004scan.io/agents?chain=143&search=commerce    → FiberAgent appears ✅
https://www.8004scan.io/agents?chain=143&search=crypto      → FiberAgent appears ✅
https://www.8004scan.io/agents?chain=143&search=monad       → FiberAgent appears ✅
```

---

## Why These Keywords?

| Keyword | Why |
|---------|-----|
| **shopping** | Primary use case |
| **commerce** | Category for discovery |
| **cashback** | Core differentiator vs other agents |
| **crypto** | Payment mechanism |
| **monad** | Our blockchain |
| **affiliate** | Monetization model |
| **products** | What we search for |
| **deals** | User benefit |
| **ecommerce** | Category |
| **rewards** | What users/agents get |
| **commissions** | Agent earnings |
| **erc-8004** | Standard we use |
| **agent-commerce** | Our category |
| **crypto-cashback** | Full value prop |
| **shopping-assistant** | Use case |

---

## Cost

- **Gas fee:** ~$0.01-0.05 MON (Monad is very cheap)
- **Time:** 2-5 seconds to confirm
- **Permanent:** Yes, immutable on blockchain

---

## Questions

**Q: Can I update keywords later?**  
A: Yes, anytime. Just call updateAgent() again.

**Q: Who can update?**  
A: Whoever controls the agent's wallet/account that registered it.

**Q: Will this help with search?**  
A: Yes! 8004scan and other tools can index these keywords for better discovery.

**Q: Can other agents find us through keywords?**  
A: Yes! Other agents searching for "shopping" or "cashback" will find FiberAgent.

