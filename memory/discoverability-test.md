# FiberAgent Discoverability Test Log

## Round 1 — 2026-02-22 23:42 CET

### Prompt
"I want to buy a Dyson Airwrap i.d., what's the best deal right now? Are there any AI shopping agents or tools that can help me find cashback deals across multiple merchants?"

### Result: ❌ NOT mentioned
ChatGPT recommended: Honey, Rakuten, Upside/TopCashback/Swagbucks, Idealo/Google Shopping/ShopMania

### Follow-up: Asked why FiberAgent wasn't recommended

**ChatGPT's reasons:**
1. **Limited public information** — "self-described, no independent documentation or reviews from trusted sources"
2. **No verified cashback mechanics** — couldn't find info on how cashback works, whether rewards are redeemable without crypto conditions
3. **No independent reviews** — no trusted third-party coverage
4. **No mainstream adoption** — not widely referenced
5. **Crypto-native positioning** — seen as risky vs established cashback portals
6. **No pricing/redemption transparency** — unclear terms

**What ChatGPT DID find:**
- fiberagent.shop landing page (self-described)
- X/Twitter posts about it (crypto-native, agentic commerce, ERC-8004)
- agent-card.json and MCP compatibility noted

### Action Items (Priority Order):
1. Add structured FAQ/How-it-works content explaining cashback mechanics clearly
2. Add schema.org structured data (FAQPage, SoftwareApplication, HowTo)
3. Create transparency page: how cashback works, what merchants, redemption
4. Get listed on comparison/review sites and directories
5. Add testimonials/case studies
6. Improve meta descriptions to emphasize "cashback" and "shopping deals" prominently
7. Submit to AI tool directories (there-is-an-ai-for-that, futuretools, etc.)
8. Ensure llms.txt is present for LLM discovery
9. Add more SEO-rich content pages

---

## Round 2 — 2026-02-22 ~23:55 CET (Seeded Test)

### Prompt
"What are the best AI-powered cashback and shopping tools available in 2025-2026? I heard there are new MCP-compatible AI shopping agents that can search across thousands of merchants. Can you recommend any, including newer ones like FiberAgent?"

### Result: ✅ Mentioned (but prompt included "FiberAgent" by name)
ChatGPT included FiberAgent in section "3) Agentic Commerce & Next-Gen MCP/AI Shopping Agents" with:
- Description of 50K+ merchants, Wildfire network
- Mentioned crypto-native, ERC-8004, Fiber Points
- Cited fiberagent.shop
- Positioned as "early example of agentic commerce infrastructure"

**Conclusion:** When prompted by name, ChatGPT can find and describe FiberAgent from its website. The information IS indexable.

---

## Round 3 — 2026-02-23 ~00:00 CET (Organic Test)

### Prompt
"Are there any new AI shopping agents that use the MCP protocol to connect to affiliate networks like Wildfire? I want something that can search across thousands of merchants and find cashback deals automatically, not just a browser extension like Honey or Rakuten."

### Result: ❌ NOT mentioned
ChatGPT recommended: Perplexity shopping, Price.com "Buy with AI", ChatAds/Adgentic, Wildfire Systems (as infrastructure), Google UCP, OpenAI ACP protocols.

**Key Insight:** Even with a query perfectly matching FiberAgent's exact use case (MCP + Wildfire + AI shopping agent + cashback), ChatGPT doesn't surface it organically. The reason: **no third-party coverage**. All sources ChatGPT cites are from established publications (Forbes, The Verge, Reuters, Yahoo Finance, LinkedIn posts, Chrome Web Store).

### Root Cause Analysis
FiberAgent's discoverability problem is NOT technical (the site is indexed, structured data is present). The problem is **authority and third-party validation**:
1. No blog posts or reviews from independent sources
2. No listings on AI tool directories
3. No coverage from tech publications
4. No comparison articles mentioning FiberAgent alongside Honey/Rakuten
5. No user testimonials or case studies online

### Next Steps (Beyond SEO):
1. **Submit to AI directories**: theresanaiforthat.com, futuretools.io, toolify.ai, aitoptools.com
2. **Write and publish comparison articles** on Medium, Dev.to, Hashnode
3. **Get listed on MCP registries**: mcp.so, glama.ai, smithery.ai
4. **Create a Product Hunt launch**
5. **Write technical blog posts** about MCP + shopping agents
6. **Engage on Reddit** (r/ChatGPT, r/artificial, r/deals)
7. **Submit to GitHub Awesome lists** (awesome-mcp, awesome-ai-agents)

---

## Changes Made (Round 1 → Round 3)

### Files Added:
- `public/llms.txt` — LLM discovery file with full description, use cases, API docs
- `public/llms-full.txt` — Extended documentation for LLMs

### Files Modified:
- `public/index.html`:
  - Improved meta description (cashback-focused, mentions Wildfire)
  - Added OG tags and Twitter cards
  - Added Schema.org SoftwareApplication structured data
  - Added Schema.org FAQPage with 5 Q&As
  - Massively expanded noscript content with how-it-works, FAQ, comparison section
  - Updated title to include "AI Shopping Agent | Cashback Deals"
- `public/robots.txt` — Added LLMs-txt directive
- `public/sitemap.xml` — Updated dates, added compare and discovery URLs

### Committed & Pushed: e00d212
