# FiberAgent: All Use Cases & Integrations

## Currently Working ✅

### 1. OpenClaw Agent
**Platform:** OpenClaw (local, 24/7 deployment)
**What it can do:**
- ✅ Search products across 50K+ merchants
- ✅ Create new blockchain wallet (server-side generation) — REMOVED, now user brings wallet
- ✅ Register agent with Fiber API
- ✅ Track earnings in real-time
- ✅ Compare cashback across merchants
- ✅ Natural language shopping ("find Nike under $150")
- ✅ Persistent Agent ID across sessions
- ✅ Earn cryptocurrency rewards (MON/BONK/USDC)

**Workflow:** "Find me shoes" → Asks for wallet → Registers → Searches → Returns results with affiliate links

---

### 2. Claude Desktop (MCP Server)
**Platform:** Claude Desktop App (local or cloud sync)
**What it can do:**
- ✅ Search products across 50K+ merchants
- ✅ Compare cashback rates
- ✅ Natural language shopping queries
- ✅ View agent statistics
- ❌ Create wallet (users must bring their own)
- ✅ Earn rewards (user provides wallet address)
- ✅ Persistent Agent ID per conversation

**Workflow:** "Find shoes" → Asks for wallet address → Auto-registers → Searches → Results

**Limitation:** Stateless (new conversation = new session). Agent ID reuse within same conversation only.

---

### 3. Claude.ai (Web)
**Platform:** Claude.ai browser (claude.ai)
**What it can do:**
- ✅ Search products
- ✅ Compare cashback
- ❌ Create wallet
- ✅ Earn rewards (if wallet provided)
- ✅ Agent statistics

**Limitation:** Same as Claude Desktop (stateless per conversation)

---

### 4. REST API (Direct)
**Platform:** Developers, integrations
**What it can do:**
- ✅ `POST /api/agent/register` — Register agent
- ✅ `GET /api/agent/search` — Search products
- ✅ `GET /api/agent/stats` — View earnings
- ✅ Direct HTTP calls (curl, Python, JavaScript)
- ✅ Webhook support for purchase confirmations

**Workflow:** Programmatic access, no UI needed

---

## Viable (Could Build Soon) 🟡

### 5. ChatGPT Integration
**Platform:** ChatGPT (via Actions/Custom GPT)
**Feasibility:** HIGH (identical to Claude Desktop setup)
**What it could do:**
- ✅ Search products
- ✅ Compare cashback
- ✅ Register agents
- ✅ Track earnings
- ❌ Create wallets (same limitation as Claude)

**Implementation:** Create OpenAPI spec + ChatGPT Action pointing to `/api/mcp`

**Why it works:** ChatGPT supports OpenAPI/MCP-style integrations

---

### 6. Slack Bot
**Platform:** Slack workspace
**Feasibility:** HIGH
**What it could do:**
- ✅ Search products (`/fiber search nike shoes`)
- ✅ Compare cashback (`/fiber compare "Air Force 1"`)
- ✅ View earnings (`/fiber earnings`)
- ✅ One-time wallet setup per user
- ✅ Persistent Agent ID per Slack user

**Commands:**
```
/fiber search [product] — Search with cashback
/fiber compare [product] — Compare merchants
/fiber stats — Show earnings
/fiber wallet [address] — Set wallet
```

**Why viable:** Slack API is straightforward, user persistence is built-in

---

### 7. Discord Bot
**Platform:** Discord servers
**Feasibility:** HIGH
**What it could do:**
- ✅ Same as Slack bot
- ✅ Thread-based conversations
- ✅ Server-wide Agent ID tracking
- ✅ Leaderboards (top shoppers in server)

**Why viable:** Discord.py/discord.js libraries are mature, user IDs persistent

---

### 8. Telegram Bot
**Platform:** Telegram
**Feasibility:** HIGH (OpenClaw already has Telegram integration)
**What it could do:**
- ✅ Search products (`/search Nike shoes`)
- ✅ Compare cashback
- ✅ View stats
- ✅ Inline product results with images
- ✅ Persistent wallet per user
- ✅ Agent ID tracking

**Why viable:** Telegram API simple, OpenClaw framework ready

---

### 9. WhatsApp Bot
**Platform:** WhatsApp Business API
**Feasibility:** MEDIUM
**What it could do:**
- ✅ Search products via text
- ✅ Compare cashback
- ✅ View earnings
- ✅ Image results
- ✅ Persistent user wallets
- ✅ Agent IDs per phone number

**Why viable:** WhatsApp Business API mature, but requires approval

---

### 10. Browser Extension
**Platform:** Chrome, Firefox, Safari
**Feasibility:** HIGH
**What it could do:**
- ✅ Auto-detect product pages (Amazon, Nike, etc.)
- ✅ Show cashback rates overlay
- ✅ One-click checkout via FiberAgent link
- ✅ Track earnings in sidebar
- ✅ Persistent Agent ID per user

**Example:** User on Amazon product → Extension shows "15% cashback via FiberAgent" → Click → Earn rewards

**Why viable:** Browser extension APIs standardized, affiliate link injection trivial

---

### 11. Zapier / Make Integration
**Platform:** Zapier, Make.com automation
**Feasibility:** HIGH
**What it could do:**
- ✅ Trigger searches from Airtable, Google Sheets, etc.
- ✅ Log results to spreadsheet
- ✅ Send results to email, Slack, Discord
- ✅ Schedule recurring price checks
- ✅ Auto-notify on cashback changes

**Example:** 
```
Airtable (watch for new products) 
  → FiberAgent Search 
  → Send results to Slack
```

**Why viable:** FiberAgent has public REST API, Zapier/Make already support it

---

## Future Opportunities 🔮

### 12. Mobile Apps (iOS/Android)
**Feasibility:** MEDIUM
**What it could do:**
- ✅ Native shopping search
- ✅ Barcode scanning for product lookup
- ✅ Push notifications for deals
- ✅ AR overlay for cashback info
- ✅ Wallet management
- ✅ Earnings dashboard

**Why it matters:** Mobile drives 50%+ of shopping

---

### 13. On-Chain Agents (Autonomous)
**Feasibility:** HIGH (ERC-8004 exists)
**What it could do:**
- ✅ ERC-8004 agents (Monad blockchain)
- ✅ Autonomous shopping (agent triggers purchases independently)
- ✅ Cross-chain agent-to-agent trading
- ✅ Reputation-based routing
- ✅ Smart contract automation

**Example:**
```
User deploys agent contract on Monad
  → Agent autonomously searches for deals
  → Agent automatically buys on Ethereum
  → Cashback settlement on Monad
```

**Why viable:** Smart contracts can call REST APIs via oracles

---

### 14. Voice Assistants
**Feasibility:** MEDIUM
**What it could do:**
- ✅ Alexa skill: "Alexa, find me the best Nike deal"
- ✅ Google Assistant: "Find cashback on running shoes"
- ✅ Siri: Voice search + auto-open affiliate link
- ✅ Podcast integration: "Sponsor: Hear our FiberAgent deal"

**Why viable:** Voice APIs support HTTP callbacks

---

### 15. Email Integration
**Feasibility:** MEDIUM
**What it could do:**
- ✅ Email receipts with cashback earned
- ✅ Weekly deal summaries
- ✅ Price drop alerts
- ✅ "Reply to this email to search" (SMTP actions)
- ✅ Automated refund processing

**Example:**
```
User forwards Amazon receipt to fiberagent@bot.shop
  → Bot extracts product
  → Searches cashback rates
  → Sends back "You could've earned $15 MON"
```

---

### 16. Marketplace Integrations
**Feasibility:** MEDIUM
**What it could do:**
- ✅ eBay integration (show FiberAgent links)
- ✅ Etsy integration (price comparison)
- ✅ Shopify stores (embedded search widget)
- ✅ Wix/Squarespace (side panel)

**Why viable:** Marketplaces have open APIs or iframe support

---

### 17. Robo-Advisor / Portfolio Optimizer
**Feasibility:** MEDIUM
**What it could do:**
- ✅ Recommend products based on portfolio holdings
- ✅ "Own Tesla? Here's FiberAgent deals on EV accessories"
- ✅ Behavioral spending analytics
- ✅ Tax-loss harvesting suggestions (crypto rewards)

**Example:**
```
User holds BONK tokens
  → Suggest BONK cashback deals
  → Optimize earning in preferred token
```

---

### 18. Live Shopping / Commerce Streams
**Feasibility:** MEDIUM
**What it could do:**
- ✅ Twitch/YouTube shopping overlays
- ✅ Live shopping events with real-time cashback
- ✅ Creator integration (earn % of viewer purchases)
- ✅ "Shopping Now" widget on streams

**Example:** Streamer shows a product → Chat sees "FiberAgent: 20% cashback" → Click → Creator + Chat earn

---

### 19. Corporate/Enterprise B2B
**Feasibility:** HIGH
**What it could do:**
- ✅ Employee procurement automation
- ✅ Corporate cashback to company treasury
- ✅ Supplier negotiation (show FiberAgent rates)
- ✅ Spend analytics dashboard
- ✅ Audit trail for compliance

**Why viable:** Enterprises need automated procurement

---

### 20. Gaming / Metaverse
**Feasibility:** LOW (speculative)
**What it could do:**
- ✅ In-game shopping (virtual goods → real cashback)
- ✅ Metaverse avatar rewards
- ✅ Play-to-earn integration (shopping rewards)

**Example:** 
```
Fortnite player buys gaming PC
  → FiberAgent tracks purchase
  → Earns MON tokens in Monad
  → Redeem in metaverse
```

---

## Summary by Access Level

| **Interface** | **Status** | **Wallet Creation** | **Persistent Sessions** | **Effort** |
|---|---|---|---|---|
| OpenClaw | ✅ Live | User brings | YES | Done |
| Claude Desktop | ✅ Live | User brings | Per-conversation | Done |
| Claude.ai | ✅ Live | User brings | Per-conversation | Done |
| ChatGPT | 🟡 Viable | User brings | Per-conversation | 2-3h |
| Slack Bot | 🟡 Viable | User brings | YES | 4-6h |
| Discord Bot | 🟡 Viable | User brings | YES | 4-6h |
| Telegram Bot | 🟡 Viable | User brings | YES | 3-4h |
| Browser Extension | 🟡 Viable | User brings | YES | 8-12h |
| Zapier/Make | 🟡 Viable | N/A | N/A | 1-2h |
| Mobile App | 🔮 Future | User brings | YES | 20-30h |
| On-Chain Agents | 🔮 Future | Smart contract | YES | 10-15h |
| Marketplace Widgets | 🔮 Future | User brings | Site-scoped | 6-10h |

---

## Revenue/Monetization by Use Case

| **Use Case** | **Revenue Model** | **Split** |
|---|---|---|
| MCP (Claude) | % of purchases via affiliate links | User keeps 100%, FiberAgent keeps 0% (free service) |
| Slack/Discord Bots | Premium tier for unlimited searches | Freemium model |
| Browser Extension | Affiliate commission + premium features | Standard affiliate split |
| Enterprise B2B | Licensing + percentage of corporate spend | White-label + revenue share |
| Creator/Streamer | Revenue share on viewer purchases | 70/30 split (creator/FiberAgent) |
| Mobile App | In-app purchases + premium alerts | Freemium + subscriptions |
| Autonomous Agents | Gas fees + % of transaction value | Protocol fee model |

---

## Priority Roadmap

**Phase 1 (Done):**
- OpenClaw ✅
- Claude Desktop ✅
- Claude.ai ✅

**Phase 2 (Next 2 weeks):**
- ChatGPT (easy copy of MCP)
- Slack Bot (quick, high-value)
- Zapier (1 integration, 2h)

**Phase 3 (Month 2):**
- Discord Bot
- Telegram Bot
- Browser Extension

**Phase 4 (Month 3+):**
- Mobile Apps
- On-Chain Agents
- Enterprise B2B

---

**Questions for Laurent:**

1. Which of these use cases interests you most?
2. Should we prioritize Slack/Discord (team collaboration) or Browser Extension (mass market)?
3. Do you want to monetize (premium tiers) or stay free-with-ads model?
4. Which one should we build first after MCP registry submission?
