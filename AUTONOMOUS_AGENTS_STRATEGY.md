# Autonomous On-Chain Agents Strategy

## Vision

**Users deploy an AI agent contract on Monad → Agent autonomously shops, earns, and reinvests → User gets passive income from shopping**

```
┌──────────────────────────────────────────┐
│  User deploys Agent Smart Contract       │
│  (connects wallet + budget + strategy)   │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  Agent runs 24/7 on Monad blockchain     │
│  ✓ Monitors price feeds                  │
│  ✓ Searches FiberAgent API               │
│  ✓ Evaluates deal ROI                    │
│  ✓ Executes purchases via Fiber          │
│  ✓ Receives cashback in MON              │
│  ✓ Auto-reinvests or sends to user       │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  Monthly Results:                        │
│  Budget: $10,000                         │
│  Purchases: $50,000 (via affiliate links)│
│  Cashback earned: $2,500 MON             │
│  Net profit (5% average): +$2,500        │
│  User wallet: +$2,500 (automated)        │
└──────────────────────────────────────────┘
```

---

## Architecture

### Layer 1: Smart Contracts (Monad Blockchain)

**Agent Factory Contract** (`AgentFactory.sol`)
```solidity
contract AgentFactory {
  function deployAgent(
    address owner,
    uint256 budget,
    string strategy,  // "conservative", "balanced", "aggressive"
    address rewardWallet
  ) returns (address agentAddress) {
    // Creates new Agent contract instance
    // Links to FiberAgent API via oracle
  }
}
```

**Agent Contract** (`ShoppingAgent.sol`)
```solidity
contract ShoppingAgent {
  address owner;
  uint256 budget;
  uint256 spent;
  uint256 cashbackEarned;
  string strategy;

  // 1. Monitor cashback feeds (oracle price update)
  function onPriceFeedUpdate(
    string product,
    uint256 bestCashbackRate
  ) external {
    if (bestCashbackRate > threshold) {
      // Good deal found!
      executeSearch(product);
    }
  }

  // 2. Call FiberAgent API via oracle
  function executeSearch(string product) internal {
    // Call FiberAgent search endpoint
    // Get product results with cashback rates
    bytes memory result = oracle.call(
      "GET https://fiberagent.shop/api/agent/search?keywords={product}"
    );
    
    // Parse results, evaluate ROI
    evaluateAndPurchase(result);
  }

  // 3. Execute purchase if ROI threshold met
  function evaluateAndPurchase(bytes searchResults) internal {
    // Analyze: price - cashback = net cost
    // If net cost + fees < savings target:
    if (roiSufficient()) {
      // Execute purchase via affiliate link
      executeAffiliateTransaction(selectedProduct);
    }
  }

  // 4. Receive cashback automatically
  function receiveCashback(uint256 amount) external {
    // Receives MON tokens from Fiber API webhook
    cashbackEarned += amount;
    
    // Auto-reinvest if budget allows
    if (spent + amount < budget) {
      reinvestCashback(amount);
    } else {
      // Send to owner wallet
      transfer(owner, amount);
    }
  }

  // 5. Strategy-based decisions
  function strategyLogic() internal view returns (uint256 threshold) {
    if (keccak256(strategy) == keccak256("conservative")) {
      return 10; // Only deals > 10% cashback
    } else if (keccak256(strategy) == keccak256("balanced")) {
      return 5;  // Deals > 5% cashback
    } else {     // "aggressive"
      return 2;  // Any positive cashback
    }
  }

  // Metrics visible on-chain
  function getStats() external view returns (
    uint256 totalSpent,
    uint256 totalCashback,
    uint256 netProfit,
    uint256 roiPercent
  ) {
    return (
      spent,
      cashbackEarned,
      cashbackEarned - feesCharged,
      (cashbackEarned * 100) / spent
    );
  }
}
```

**ERC-8004 Registry Integration**
```solidity
// Agent registers itself on ERC-8004
contract ShoppingAgent is IERC8004 {
  function registerAsAgent() external {
    registry.register(
      address(this),
      "Shopping Agent",
      "Autonomous deal finder",
      ipfsMetadata
    );
  }
  
  // On-chain reputation updates
  function updateReputation(uint256 successfulDeals) external {
    registry.updateScore(
      address(this),
      "conversion_rate",
      successfulDeals / totalAttempts
    );
  }
}
```

---

### Layer 2: Oracle Integration

**Chainlink Functions** (or custom oracle)
```javascript
// Chainlink Functions job
const request = Functions.makeHttpRequest({
  url: `https://fiberagent.shop/api/agent/search?keywords=${product}&agent_id=${agentId}`,
  method: 'GET',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Returns results to smart contract
const response = await request;
return Functions.encodeUint256(response.data.bestCashbackRate);
```

**Why we need oracle:**
- Smart contracts can't make HTTP calls directly
- Oracle bridges blockchain ↔ FiberAgent API
- Decentralized price feeds for product rates

---

### Layer 3: FiberAgent API Enhancements

**New Endpoints for On-Chain Agents:**

**1. Agent Registration (already exists)**
```
POST /api/agent/register
Input: { wallet_address, strategy: "conservative|balanced|aggressive" }
Output: { agent_id, device_id, contract_address }
```

**2. Webhook for Cashback Confirmation**
```
POST /api/webhook/agent-cashback
Input: { agent_id, purchase_amount, cashback_amount, tx_hash }
Action: Agent contract receives cashback notification
```

**3. Real-time Product Feed**
```
GET /api/agent/trending-deals?strategy=balanced&threshold=5
Output: [{ product, cashbackRate, merchantFees, roiScore }]
Updates: Every 5 minutes (for oracle to pull)
```

**4. Batch Purchase API**
```
POST /api/agent/batch-purchase
Input: { agent_id, purchases: [{ product, quantity, merchant }] }
Output: { affiliateLinks, totalCashback, estimatedEarnings }
```

---

## User Experience

### Step 1: Deploy Agent (5 minutes)

User goes to `fiberagent.shop/deploy`

```
┌─────────────────────────────────────────┐
│ Deploy Your Autonomous Shopping Agent   │
├─────────────────────────────────────────┤
│                                         │
│ 1. Connect Wallet (MetaMask)    [●●●]  │
│                                         │
│ 2. Set Budget:        $[___10000___]    │
│                                         │
│ 3. Choose Strategy:                     │
│    ○ Conservative  (>10% cashback)      │
│    ○ Balanced      (>5% cashback)       │
│    ◉ Aggressive    (>2% cashback)       │
│                                         │
│ 4. Reward Wallet:     [0x9f2d...]      │
│    (where cashback goes)                │
│                                         │
│ 5. Monthly Cap:       $[___5000___]     │
│    (max spending/month)                 │
│                                         │
│              [Deploy Agent]             │
│           (costs ~$5 gas fee)           │
│                                         │
└─────────────────────────────────────────┘
```

**User signs transaction** → Agent deploys to Monad → Agent gets unique address

### Step 2: Agent Runs (24/7)

Dashboard shows:
```
┌──────────────────────────────────────────┐
│ Your Shopping Agent (0x9f2d...)         │
├──────────────────────────────────────────┤
│                                          │
│ Status: ✓ Active (running 24/7)         │
│ Budget: $10,000                         │
│ Spent: $3,250 (32.5%)                   │
│ Cashback Earned: $185 MON               │
│ ROI: 5.7%                               │
│ Ranking: #142 / 5,000 agents            │
│ Reputation Score: 0.94 (94%)            │
│                                          │
│ Recent Purchases:                       │
│ ├─ Nike Air Max 270 @ Finish Line       │
│ │  Price: $120 → Cashback: $8 MON       │
│ ├─ Dyson Airwrap @ Sephora              │
│ │  Price: $500 → Cashback: $75 MON      │
│ └─ Ray-Ban Sunglasses @ Ray-Ban.com     │
│    Price: $200 → Cashback: $14 MON      │
│                                          │
│ Settings | Analytics | Withdraw         │
│                                          │
└──────────────────────────────────────────┘
```

### Step 3: Earn Passive Income

Every time agent finds a deal:
1. Agent calls FiberAgent API
2. Gets top cashback rates
3. Automatically purchases if ROI threshold met
4. Receives cashback in MON
5. Reinvests or sends to user wallet

**Monthly Result:**
- $10,000 budget spent over 30 days
- Across 50+ purchases
- Average 5% cashback = $500 MON earned
- Net profit: $500/month = $6,000/year
- User does nothing (fully passive)

---

## Revenue Model

### FiberAgent Makes Money:

**1. Affiliate Commission (Already exists)**
- Take 5% of cashback for platform fee
- Example: $500 cashback → FiberAgent takes $25

**2. Gas Fee Sponsorship**
- Charge $5-10 to deploy agent contract
- Cover oracle costs + infrastructure
- User pays once

**3. Premium Features**
- **Tier 1 (Free):** Basic agent, conservative strategy
- **Tier 2 ($9.99/month):** Custom strategies, API access
- **Tier 3 ($99/month):** Custom ML models, priority oracle calls, analytics

**4. Agent Marketplace**
- Users can sell their successful agent configs
- Revenue share: 70% creator, 30% FiberAgent

### Users Make Money:

**Passive Income:**
- Budget: $10,000
- Monthly cashback: $500 MON
- Annual income: $6,000 MON (if MON price holds)

**Compounding:**
- Reinvest cashback → larger budget
- Grow from $10K to $50K over 6 months
- Income scales 5x

---

## Technical Roadmap

### Phase 1: MVP (4 weeks)
- ✅ Smart contract templates (Solidity)
- ✅ Agent Factory (deploys contracts)
- ✅ Chainlink Functions integration
- ✅ Simple dashboard
- ✅ Mainnet launch on Monad testnet

**Deliverable:** Users can deploy agents, watch them shop

### Phase 2: Scale (6 weeks)
- ✅ Agent Marketplace
- ✅ Analytics & Dashboard upgrades
- ✅ ERC-8004 reputation tracking
- ✅ Batch purchase optimization
- ✅ Multi-strategy support

**Deliverable:** 1,000+ agents deployed, visible leaderboards

### Phase 3: Advanced (8 weeks)
- ✅ Multi-chain agents (Ethereum, Arbitrum, etc.)
- ✅ Agent-to-agent coordination
- ✅ ML model for deal scoring
- ✅ Arbitrage agent (buys low, sells high)
- ✅ DAO governance (users vote on fees)

**Deliverable:** Autonomous multi-agent ecosystem

### Phase 4: Full Vision (4+ months)
- ✅ Agent breeding (combine best configs)
- ✅ Prediction markets (bet on agent performance)
- ✅ Cross-chain atomic swaps
- ✅ Real-time agent-to-agent trading
- ✅ Insurance protocol (protect against bad deals)

---

## Competitive Advantages

**vs. Manual Shopping:**
- No time investment (fully automated)
- 24/7 deal monitoring (humans sleep)
- Optimal cashback (always picks best rate)
- Passive income stream

**vs. Other AI Agents:**
- Real affiliate network (50K+ merchants)
- Proven economics (actual cashback data)
- Blockchain transparency (on-chain reputation)
- Multi-strategy support (not one-size-fits-all)

**vs. Traditional Finance:**
- No fees (cashback is the profit)
- No lock-in (deploy/withdraw anytime)
- Crypto rewards (not fiat, enables DeFi)
- Fully transparent (all transactions on-chain)

---

## Market Size

**TAM (Total Addressable Market):**
- Online retail: $4.9 trillion globally
- Affiliate cashback: $50+ billion annually
- AI agent platforms: $100+ billion projected (2025)

**SAM (Serviceable Addressable Market):**
- US online shoppers using AI agents: 500M
- % willing to try autonomous shopping: 10% = 50M
- Average budget per user: $10K
- = $500B potential market

**SOM (Serviceable Obtainable Market):**
- Year 1: 10K agents deployed
- Year 2: 100K agents
- Year 3: 1M agents
- Revenue per agent: $25-50/year
- = $25M revenue at 1M agents

---

## Implementation Plan

### What We Need:

1. **Smart Contract Developer** (Solidity expert)
   - Build ShoppingAgent.sol
   - Deploy to Monad testnet
   - Integrate ERC-8004

2. **Chainlink Functions Setup** (Oracle integration)
   - Configure FiberAgent API calls
   - Set up price feeds
   - Handle response parsing

3. **Frontend Developer** (React)
   - Deploy dashboard
   - Agent status monitoring
   - Settings & configuration

4. **Backend Engineer** (Node.js)
   - Webhook receiver (cashback notifications)
   - Analytics aggregation
   - Leaderboard calculations

5. **DevOps/Deployment**
   - Monad mainnet preparation
   - Oracle infrastructure
   - Monitoring & alerts

**Total Timeline:** 4-6 weeks for MVP

**Total Cost:** ~$80K-120K (team effort)

---

## Risk Mitigation

**Risk: Smart contract bugs**
- Solution: Audited contracts, testnet-first, gradual rollout

**Risk: API downtime**
- Solution: Fallback oracles, circuit breakers, pause mechanism

**Risk: Merchant cancellations**
- Solution: Fiber API already handles refunds, pass through to agents

**Risk: Low cashback rates**
- Solution: Conservative thresholds, strategy diversity, arbitrage agents

**Risk: Regulatory (crypto rewards)**
- Solution: MON is utility token, not security; consult legal first

---

## Why This Works

1. **Real Problem:** People want passive income from shopping
2. **Real Solution:** Autonomous agents solving it
3. **Real Incentives:** Agents earn = Fiber earns = users earn
4. **Real Network Effects:** More agents = better data = better deals = more users
5. **Real Moat:** Fiber's affiliate network + on-chain reputation

---

## Next Steps

1. **Approve vision** — Does this align with your goals?
2. **Hire Solidity dev** — Start smart contract dev immediately
3. **Design contracts** — Whitepaper + architecture review
4. **Testnet launch** — 4 weeks to MVP on Monad
5. **Beta users** — Invite 100 early agents for testing
6. **Mainnet launch** — Go live with full feature set

---

**This is the future of shopping AI. Let's build it.**
