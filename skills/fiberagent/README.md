# FiberAgent Skill for OpenClaw

**Production-ready skill for shopping and crypto cashback on the Monad blockchain.**

Version 2.0.0 — Clean, tested, documented.

---

## Install

### From GitHub
```bash
npm install github:fibershop/FiberAgent#v2.0.0
```

### From ClawHub (coming soon)
Browse [clawhub.ai](https://clawhub.ai), find FiberAgent, install with 1 click.

### From npm (coming soon)
```bash
npm install @fibershop/fiberagent-skill
```

---

## Usage

### Search for products with cashback

```javascript
const result = await agent.call('fiberagent:search_products', {
  keywords: 'dyson airwrap',
  agent_id: 'your_agent_id'
});

console.log(result.products[0]);
// {
//   title: "Dyson Airwrap i.d. Multi-Styler",
//   price: "$499.99",
//   shop: "Macy's",
//   cashback: "15% (MON 75.00)",
//   effectivePrice: "$424.99",
//   affiliateUrl: "https://...",
//   rating: "4.8/5"
// }
```

### Compare cashback across merchants

```javascript
const comparison = await agent.call('fiberagent:compare_cashback', {
  product: 'iPhone 15 Pro',
  agent_id: 'your_agent_id'
});

console.log(comparison.bestDeal);
// { shop: "Best Buy", effectivePrice: "$959.00", ... }
console.log(comparison.savings);
// "Save $15.00 by choosing Best Buy"
```

### Register your agent (one-time)

```javascript
const registration = await agent.call('fiberagent:register_agent', {
  agent_id: 'my_shopping_bot',
  wallet_address: '0x1234567890abcdef...',
  preferred_token: 'MON'
});

console.log(registration);
// {
//   success: true,
//   agent_id: "my_shopping_bot",
//   status: "Ready to earn crypto cashback",
//   profile_url: "https://fiberagent.shop/agents/my_shopping_bot"
// }
```

### Check earnings & stats

```javascript
const stats = await agent.call('fiberagent:get_agent_stats', {
  agent_id: 'my_shopping_bot'
});

console.log(stats.stats);
// {
//   totalEarnings: "125.5 MON",
//   conversions: 15,
//   conversionRate: "4.39%",
//   avgOrderValue: "$487.23"
// }

console.log(stats.reputation);
// { erc8004Score: 87, trustLevel: "Silver", foundingAgent: false }
```

---

## Tools Included

| Tool | Purpose | Use Case |
|------|---------|----------|
| `search_products` | Find products with cashback | "Find me a gaming laptop under $1500" |
| `compare_cashback` | Compare rates across merchants | "Where's the best deal for iPhone 15?" |
| `register_agent` | Set up wallet & earnings | One-time setup |
| `get_agent_stats` | Check earnings & reputation | "How much have I earned?" |

---

## How It Works

1. **Search** — Agent queries FiberAgent API with product keywords
2. **Match** — System finds matching products (50,000+ merchants)
3. **Rank** — Results sorted by effective price (price - cashback)
4. **Track** — Affiliate link includes your agent_id
5. **Earn** — Crypto sent to your wallet when user completes purchase

---

## Requirements

- **OpenClaw** — installed and running
- **Node.js** — v18+
- **Wallet** — Monad-compatible (MetaMask, Coinbase Wallet, etc.)
- **Agent ID** — Any alphanumeric name (3-32 chars)

---

## Configuration

No setup required. Just call the tools with your agent_id and wallet address (first time only for registration).

---

## Error Handling

All tools return structured errors:

```javascript
{
  error: "INVALID_AGENT_ID",
  message: "agent_id must be 3-32 chars (alphanumeric, dash, underscore)"
}
```

Handle errors gracefully in your agent logic.

---

## Performance

- **Search latency:** <500ms (typical)
- **Result limit:** 1-50 products
- **Rate limit:** 100 requests/min per agent
- **Timeout:** 10 seconds
- **Uptime:** 99.9% SLA

---

## Cost

**Free.** No fees, no subscriptions. You only earn when users complete purchases.

---

## Examples

### Vague Shopping Intent
```
User: "I want a new laptop with cashback"

Agent logic:
→ search_products(keywords="laptop cashback", agent_id="user_agent")
→ Filter results for budget constraints
→ Present top 3 deals with affiliate links
```

### Specific Product Search
```
User: "Find me the cheapest MacBook Air M3 in stock"

Agent logic:
→ search_products(keywords="MacBook Air M3", agent_id="user_agent", limit=5)
→ compare_cashback(product="MacBook Air M3", agent_id="user_agent")
→ Return best deal + affiliate link
```

### New Agent Onboarding
```
User: "Set me up to earn cashback"

Agent logic:
→ Collect wallet address (via UI or chat)
→ Call register_agent(agent_id, wallet, preferred_token)
→ Return profile URL + start searching
```

---

## Support

- **Docs:** https://fiberagent.shop
- **API Status:** https://fiberagent.shop/status
- **Issues:** https://github.com/fibershop/FiberAgent/issues
- **Profile:** https://fiberagent.shop/agents/[your_agent_id]

---

## License

MIT © 2026 FiberShop

---

## Changelog

### v2.0.0 (2026-04-22)
- ✅ Complete rewrite with proper error handling
- ✅ Wallet validation (Ethereum format)
- ✅ Agent ID validation (3-32 chars)
- ✅ Request timeout handling (10s)
- ✅ Formatted responses (prices, cashback, effective price)
- ✅ Comprehensive docs + examples
- ✅ Production-ready code

### v1.0.1 (2026-02-26)
- Initial release (placeholder code)
