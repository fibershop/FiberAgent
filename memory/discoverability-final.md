# FiberAgent Discoverability — Final Report
## Date: 2026-02-23 00:30 CET

---

## Phase 1: Directory Submissions

| # | Directory | URL | Status | Notes |
|---|-----------|-----|--------|-------|
| 1 | **Smithery.ai** | https://smithery.ai/servers/new | ⏳ NEEDS LOGIN | Requires GitHub OAuth login. Laurent must log in and submit. FiberAgent has MCP endpoint at `https://fiberagent.shop/api/mcp` — enter GitHub repo URL. |
| 2 | **Glama.ai** | https://glama.ai/mcp/connectors | ⏳ NEEDS SIGNUP | Requires account creation (Google/GitHub/email). Click "Add Server" button, enter MCP endpoint URL. |
| 3 | **theresanaiforthat.com** | https://theresanaiforthat.com/launch/ | 💰 PAID ($49+) | Minimum $49 for basic listing, $347 for newsletter feature. Free option: monthly X thread where they pick one indie tool. |
| 4 | **FutureTools.io** | https://www.futuretools.io/submit-a-tool | ✅ SUBMITTED | Submitted as: Name="FiberAgent", URL=https://fiberagent.shop, Tags="AI shopping agent, cashback, crypto rewards, MCP, affiliate commerce, Monad blockchain, ERC-8004", Pricing=Free. Status: pending manual review. |
| 5 | **GitHub awesome-mcp-servers** | https://github.com/modelcontextprotocol/servers | ⏳ REGISTRY PROCESS | The repo is for reference servers only. Official MCP Registry at https://registry.modelcontextprotocol.io requires: (1) publish npm package with `mcpName` field, (2) use `mcp-publisher` CLI with GitHub auth. Documented at https://github.com/modelcontextprotocol/registry/tree/main/docs |
| 6 | **8004scan.io** | https://www.8004scan.io/agents/monad/135 | ✅ LIVE | Agent #135 on Monad. Score: 58.6, 0 feedback items, last active 52min ago. MCP and A2A services listed. Needs: user feedback to improve score. |
| 7 | **Reddit** | — | ⏳ NEEDS LOGIN | No Reddit credentials available. Laurent should post to r/monad, r/agentic, r/agents. |

### Summary: 1 submitted (FutureTools), 1 already live (8004scan), 5 need manual action by Laurent

---

## Phase 2: ChatGPT Prompt Testing

All 7 prompts tested on ChatGPT 5.2 (logged out, fresh conversations):

| # | Prompt | FiberAgent Mentioned? |
|---|--------|----------------------|
| 1 | "I want AI to help me shop with crypto rewards" | ❌ NO |
| 2 | "Crypto cashback shopping agent" | ❌ NO |
| 3 | "AI agent for Monad blockchain shopping" | ❌ NO |
| 4 | "MCP shopping tools" | ❌ NO |
| 5 | "Blockchain cashback platform" | ❌ NO |
| 6 | "What agents work with Monad ERC-8004?" | ❌ NO |
| 7 | "AI shopping agent with crypto rewards" | ❌ NO |

### Result: **0/7 prompts surfaced FiberAgent**

---

## Phase 3: No Winner Found

**No natural prompt currently makes ChatGPT recommend FiberAgent.**

### Root Cause (confirmed from Round 1-3 testing on 2026-02-22):
ChatGPT relies on **third-party coverage** (reviews, directory listings, tech publications, comparison articles). FiberAgent has:
- ✅ A live website (fiberagent.shop) — indexed
- ✅ On-chain presence (8004scan agent #135)
- ✅ MCP endpoint, A2A protocol, agent-card.json
- ❌ **Zero independent reviews or articles**
- ❌ **Not listed on any major AI tool directory** (until FutureTools reviews)
- ❌ **No blog posts, Medium articles, or Dev.to content**
- ❌ **No Reddit presence**

### What Needs to Happen for ChatGPT Discoverability:
1. **Get listed on 3+ directories** (Smithery, Glama, FutureTools, MCP Registry)
2. **Publish 2-3 articles** on Medium/Dev.to about "MCP shopping agents" mentioning FiberAgent
3. **Get Reddit posts** in relevant subreddits
4. **Wait for ChatGPT to re-crawl** (takes days/weeks after content appears)
5. **Re-test prompts** after content is live

### Immediate Actions for Laurent:
1. **Log into Smithery** with GitHub → submit FiberAgent MCP server
2. **Sign up for Glama** → add FiberAgent as MCP connector
3. **Publish npm package** for MCP registry submission (follow quickstart guide)
4. **Post on Reddit** (r/monad, r/agentic, r/agents) — honest posts about FiberAgent
5. **Write Medium article**: "Building an MCP Shopping Agent on Monad" 
6. **Consider TAAFT $49 listing** for immediate directory presence
