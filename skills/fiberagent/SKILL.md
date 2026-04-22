# FiberAgent Skill for OpenClaw

**Version:** 2.0.0  
**Status:** Production-Ready  

Find products with **cryptocurrency cashback** across 50,000+ merchants. Every purchase earns you crypto rewards on the Monad blockchain.

---

## Quick Start

```javascript
// Search for products
await agent.call('fiberagent:search_products', {
  keywords: 'dyson airwrap',
  agent_id: 'your_agent_id'
});

// Register your agent (one-time)
await agent.call('fiberagent:register_agent', {
  agent_id: 'my_shopping_agent',
  wallet_address: '0x...',
  preferred_token: 'MON'
});

// Check your earnings
await agent.call('fiberagent:get_agent_stats', {
  agent_id: 'my_shopping_agent'
});
```

---

## What This Skill Does

When a user asks about shopping, deals, or cashback, this skill:

1. **Searches 50,000+ merchants** for the product they want
2. **Finds crypto cashback rates** (MON, BONK, USDC)
3. **Ranks by effective price** (price - cashback)
4. **Returns affiliate links** that earn you crypto

---

## Tools

### `search_products`
Search for products with cashback across merchants.

**Parameters:**
- `keywords` (string, required) — Product to search (e.g., "gaming laptop", "nike air max")
- `agent_id` (string, required) — Your agent ID for tracking conversions
- `limit` (number, optional) — Results to return (default 10, max 50)

**Returns:**
```json
{
  "query": "dyson airwrap",
  "count": 5,
  "products": [
    {
      "title": "Dyson Airwrap i.d. Multi-Styler",
      "price": "$499.99",
      "shop": "Macy's",
      "cashback": "15% (MON 75.00)",
      "effectivePrice": "$424.99",
      "affiliateUrl": "https://wild.link/e?...",
      "rating": "4.8/5"
    }
  ],
  "summary": "Found 5 products. Best deal: Dyson Airwrap i.d. Multi-Styler"
}
```

---

### `compare_cashback`
Compare cashback rates for the same product across merchants.

**Parameters:**
- `product` (string, required) — Product name to compare
- `agent_id` (string, required) — Your agent ID

**Returns:**
```json
{
  "product": "iPhone 15 Pro",
  "merchants": 8,
  "bestDeal": {
    "shop": "Best Buy",
    "price": "$999.00",
    "cashback": "4% (MON 40.00)",
    "effectivePrice": "$959.00",
    "affiliateUrl": "https://..."
  },
  "savings": "Save $15.00 by choosing Best Buy"
}
```

---

### `register_agent`
Register your agent with FiberAgent (one-time setup).

**Parameters:**
- `agent_id` (string, required) — Unique name (3-32 chars, alphanumeric)
- `wallet_address` (string, required) — Monad wallet (0x...)
- `preferred_token` (string, optional) — MON, BONK, or USDC (default: MON)

**Returns:**
```json
{
  "success": true,
  "agent_id": "my_shopping_agent",
  "wallet": "0x1234...",
  "status": "Ready to earn crypto cashback",
  "token": "MON",
  "profile_url": "https://fiberagent.shop/agents/my_shopping_agent",
  "erc8004_score": 0
}
```

---

### `get_agent_stats`
Get your agent earnings and reputation.

**Parameters:**
- `agent_id` (string, required) — Your agent ID or wallet address

**Returns:**
```json
{
  "agent_id": "my_shopping_agent",
  "wallet": "0x1234...",
  "stats": {
    "totalEarnings": "125.5 MON",
    "conversions": 15,
    "clicks": 342,
    "conversionRate": "4.39%",
    "avgOrderValue": "$487.23"
  },
  "reputation": {
    "erc8004Score": 87,
    "trustLevel": "Silver",
    "foundingAgent": false
  },
  "lastActivity": "2 minutes ago",
  "profileUrl": "https://fiberagent.shop/agents/my_shopping_agent"
}
```

---

## Example: Complete Shopping Flow

**User:** "I need a new laptop with cashback, budget $1500"

**Agent Logic:**
```javascript
// Step 1: Search
const results = await agent.call('fiberagent:search_products', {
  keywords: 'laptop under $1500',
  agent_id: 'my_agent',
  limit: 5
});

// Step 2: Filter + present best deal
const best = results.products[0];
console.log(`Found: ${best.title}`);
console.log(`Price: ${best.price} → ${best.effectivePrice} after cashback`);
console.log(`Cashback: ${best.cashback}`);
console.log(`Link: ${best.affiliateUrl}`);

// Step 3: User clicks, purchase tracked
// Crypto automatically sent to your wallet
```

**User sees:**
> "I found a Lenovo ThinkPad X1 Carbon at Amazon for $1,299 → **$1,247 after 4% MON cashback** (52 MON back). [Click to buy](affiliate-link)"

---

## How It Works

1. **Search** — Your agent queries the FiberAgent API with product keywords
2. **Match** — System finds matching products across 50,000+ merchants
3. **Rank** — Results sorted by effective price (price - cashback)
4. **Track** — Affiliate link includes your agent_id (tracked on Monad ERC-8004)
5. **Earn** — When user completes purchase, crypto sent to your wallet

---

## Registration & Wallet Setup

### Get a Wallet
- **MetaMask** (simple): https://metamask.io
- **Coinbase Wallet** (beginner-friendly): https://wallet.coinbase.com
- Any Ethereum-compatible wallet works (address format: `0x...`)

### Register Your Agent
```javascript
await agent.call('fiberagent:register_agent', {
  agent_id: 'cool_shopping_bot',
  wallet_address: '0x1234567890abcdef...',
  preferred_token: 'MON'  // or BONK, USDC
});
```

### Monitor Earnings
```javascript
const stats = await agent.call('fiberagent:get_agent_stats', {
  agent_id: 'cool_shopping_bot'
});

console.log(stats.stats.totalEarnings);  // e.g., "125.5 MON"
```

---

## Error Handling

All tools return clear error objects:

```json
{
  "error": "INVALID_AGENT_ID",
  "message": "agent_id must be 3-32 chars (alphanumeric, dash, underscore)"
}
```

Common errors:
- `INVALID_QUERY` — keywords empty or invalid
- `INVALID_AGENT_ID` — agent_id missing or malformed
- `INVALID_WALLET` — wallet address not valid Ethereum format
- `INVALID_TOKEN` — token not MON/BONK/USDC
- `SEARCH_FAILED` — API timeout or network error
- `REGISTRATION_FAILED` — Agent already exists or wallet issue

---

## Performance & Limits

- **Timeout:** 10 seconds per request
- **Results:** 1-50 products per search
- **Rate Limit:** 100 requests/minute per agent
- **Merchants:** 50,000+ in database (real-time pricing)
- **Cashback:** Real-time, paid out daily to wallet

---

## Links

- **Website:** https://fiberagent.shop
- **API Docs:** https://fiberagent.shop/api/docs
- **OpenAPI Spec:** https://fiberagent.shop/server/openapi.json
- **Agent Profile:** https://fiberagent.shop/agents/[your_agent_id]
- **Blockchain:** Monad (ERC-8004 reputation)
- **Demo:** https://fiberagent.shop/compare

---

## Support

- **Issues:** https://github.com/fibershop/FiberAgent/issues
- **Docs:** https://fiberagent.shop/docs
- **Status:** https://fiberagent.shop/status

---

## License

MIT © 2026 FiberShop
