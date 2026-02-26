# Stateless Architecture: Wallet Address Required Every Search

## The Problem

When Laurent tested the sunglasses search, Claude called `search_by_intent` **without** the `wallet_address` parameter.

Why? Because Claude assumed the wallet from the first search would be "remembered."

**It wasn't.**

## Root Cause: Vercel Serverless

FiberAgent MCP runs on Vercel's serverless functions. Here's how it works:

```
Request 1 (First search):
  → Fresh Node process spawns
  → agents = {} (empty object created)
  → Wallet provided → Registered → agents['wallet_abc'] = { agent_id, device_id, ... }
  → Response sent
  → Process dies ☠️

Request 2 (Second search):
  → Fresh Node process spawns (different instance)
  → agents = {} (NEW empty object, previous one is gone)
  → Claude doesn't pass wallet_address (expects it to be "remembered")
  → We check agents object, find nothing
  → Error: "Wallet address required"
```

**No persistent session storage. No memory between requests.**

## The Solution: Make Wallet REQUIRED

We updated all search tools to **require** `wallet_address` as a parameter:

```javascript
// OLD: optional, assumed to be remembered
wallet_address: z.string().optional()

// NEW: required, must be provided every time
wallet_address: z.string().describe('Your blockchain wallet (0x...). REQUIRED every search — the system is stateless.')
```

Now Claude **must** pass it with every search:

```
Search 1:
  Claude: search_products(keywords: "shoes", wallet_address: "0x1234...")
  → Works ✅

Search 2:
  Claude: search_by_intent(intent: "sunglasses...", wallet_address: "0x1234...")
  → Works ✅
```

## How Claude Handles This

Claude should:
1. Ask user for wallet **once**
2. Store it in conversation context
3. Include it in **every** search tool call

Example conversation:

```
You: "Find Nike shoes"
Claude: "What's your wallet? (e.g., 0x1234...)"
You: "0x9f2d..."

[Claude stores "0x9f2d" in memory]

You: "Now find sunglasses with highest cashback"
Claude: [Automatically includes wallet in tool call]
  → search_by_intent(
      intent: "Sporty athletic sunglasses between $50 and $150, highest cashback",
      wallet_address: "0x9f2d...",
      preferences: [...]
    )
```

## Architectural Trade-offs

### Why Not Persistent Storage?

**Option 1: Persistent Session Storage (Redis/DynamoDB)**
- ✅ Claude doesn't need to pass wallet every time
- ❌ Costs money (Redis, database)
- ❌ Complex infrastructure
- ❌ Additional latency

**Option 2: Stateless (Current)**
- ✅ Zero infrastructure costs
- ✅ Fast (no database calls)
- ✅ Infinitely scalable
- ❌ Wallet must be passed every request
- ❌ Claude needs to remember it

**We chose Option 2** because:
1. FiberAgent is free/open-source
2. Claude can easily remember wallet in conversation
3. Stateless scales infinitely
4. No operational overhead

### For Production (Future)

If we want seamless wallet persistence, we could:

```javascript
// Option A: Redis (cheapest persistent option)
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_URL);
cache.set(`wallet:${conversationId}`, walletAddress, 'EX', 3600); // 1 hour TTL

// Option B: Cosmic (Vercel's serverless database)
const cosmos = require('@azure/cosmos');
cosmos.put(`conversations/${conversationId}`, { wallet: walletAddress });

// Option C: Ask user to bring their own wallet (Metamask, Coinbase, etc.)
// No storage needed — user controls it
```

## Testing the Fix

**After the fix, this should work:**

```
You: "Find sporty athletic sunglasses between $50-150, best cashback"

Claude: "What's your wallet?"

You: "0x9f2d..."

Claude: [Automatically includes 0x9f2d in search_by_intent call]
→ Results table with sunglasses

You: "Find running shoes"

Claude: [Still remembers 0x9f2d, includes it automatically]
→ Results table with shoes
```

## What Changed

**Files Modified:**
- `/api/mcp.js`

**Changes:**
1. `search_products`: wallet_address is now **required** (not optional)
2. `search_by_intent`: wallet_address is now **required** (not optional)
3. `compare_cashback`: wallet_address is now **required** (not optional)
4. All three tools now check: `if (!wallet_address) → reject immediately`
5. Tool descriptions updated with note: "REQUIRED every search — the system is stateless"

**No Changes:**
- Frontend code
- Fiber API calls
- Output format
- Fallback catalog

## Key Insight

**This is actually a feature, not a bug.**

By requiring wallet_address in every search, we:
1. **Never lose the wallet address** (can't forget it between requests)
2. **Keep the system stateless** (no database needed)
3. **Maintain privacy** (no session storage to hack)
4. **Ensure scalability** (infinite parallel requests)
5. **Keep costs low** (zero database infrastructure)

Claude just needs to remember the wallet address in conversation and include it in every call. That's it.

## Deployment

✅ Commit: `21c0f86` - CRITICAL FIX: Make wallet_address REQUIRED in all search tools
✅ Pushed to GitHub
✅ Vercel auto-deploying...

**Next test:** Try the sunglasses search again with wallet_address explicitly provided.
