# 🔍 FiberAgent Complete Discovery Map

## All Discovery Points in One Table

| # | Discovery Point | URL | Type | Audience | Format | Purpose | Update Freq |
|---|---|---|---|---|---|---|---|
| **WEB PAGES** |
| 1 | Landing Page | `/` | Web Page | Everyone | HTML + SEO | Hero & value props | Daily |
| 2 | About | `/about` | Web Page | Humans | HTML | Company story | Monthly |
| 3 | Demo | `/demo` | Web Page | Humans & Agents | HTML + Interactive | Try it live | Daily |
| 4 | For Agents | `/agent` | Web Page | AI Agents | HTML + Forms | Register & earn | Weekly |
| 5 | For Users | `/user` | Web Page | End Users | HTML + Dashboard | User dashboard | Weekly |
| 6 | Statistics | `/stats` | Web Page | Everyone | HTML + Charts | Network metrics (real-time) | Real-time |
| 7 | Comparison | `/compare` | Web Page | Decision-makers | HTML | vs Rakuten/Honey | Weekly |
| 8 | Visual Demo | `/visual-demo` | Web Page | Humans | HTML + Animation | Animated walkthrough | Weekly |
| 9 | One-Pager | `/onepager` | Web Page | Investors | HTML | Quick fact sheet | Monthly |
| 10 | Capabilities | `/capabilities` | Web Page | Developers | HTML | Feature matrix | Weekly |
| 11 | Developers | `/developers` | Web Page | Developers | HTML | API docs & samples | Weekly |
| 12 | Getting Started | `/getting-started` | Web Page | New Users | HTML | Onboarding guide | Weekly |
| **SEARCH ENGINE & BOT DISCOVERY** |
| 13 | robots.txt | `/robots.txt` | Metadata | Search engines (Google, Bing) | Text | Crawl permissions & rate limits | Static |
| 14 | sitemap.xml | `/sitemap.xml` | Metadata | SEO crawlers | XML | Page index + priorities | Weekly |
| **LLM DISCOVERY** |
| 15 | llms.txt (short) | `/llms.txt` | Metadata | LLMs (ChatGPT, Claude, Perplexity) | Plain text | Quick intro (~300 lines) | Weekly |
| 16 | llms-full.txt | `/llms-full.txt` | Metadata | LLMs (detailed queries) | Plain text | Complete docs + FAQ (~1000 lines) | Weekly |
| **AGENT DISCOVERY** |
| 17 | Agent Card (standard) | `/.well-known/agent-card.json` | Metadata | Agent discovery protocols | JSON | Full agent spec + MCP + blockchain | Weekly |
| 18 | AI Plugin Config | `/.well-known/ai-plugin.json` | Metadata | ChatGPT plugins & similar | JSON | Plugin spec + OpenAPI ref | Weekly |
| 19 | Fiber Agent Card | `/FiberAgent-card.json` | Metadata | Humans & Machines | JSON | Personality + endpoints + wallet | Weekly |
| **API DOCUMENTATION** |
| 20 | OpenAPI Spec | `/api/openapi.json` | API Spec | Developers & API clients | JSON | Full REST API documentation | Weekly |
| 21 | Swagger UI | `/api/docs` | Web Interface | Developers | HTML + Interactive | Try API endpoints live | Weekly |
| 22 | MCP Endpoint | `/api/mcp` | Live API | AI Agents | JSON-RPC | Real-time tool availability | Real-time |
| **STRUCTURED DATA (Embedded in pages)** |
| 23 | JSON-LD Schemas | Every page `<head>` | Metadata | Search engines (Google, Bing) | JSON-LD | Rich snippets in SERPs | Per page |
| 24 | Organization Schema | Landing page | Metadata | Search engines | JSON-LD | Legal name, logo, contact | Static |
| 25 | Breadcrumb Schema | All pages | Metadata | Search engines | JSON-LD | Navigation hierarchy | Per page |
| **EXTERNAL POINTERS** |
| 26 | GitHub Repository | `https://github.com/fibershop/FiberAgent` | External | Developers & Everyone | HTML + Git | Full source code + docs | Real-time |
| 27 | Twitter/X | `https://x.com/fiber_shop` | External | General public | Social media | Updates & announcements | Real-time |
| 28 | ERC-8004 Registry | `https://www.8004scan.io/agents/monad/135` | External (Blockchain) | Blockchain explorers & Monad users | HTML | On-chain agent verification | Real-time |
| 29 | Email Contact | `support@fiber.shop` | External | Support seekers | Email | Customer support | Real-time |
| 30 | Fiber Main Site | `https://fiber.shop` | External | General public | HTML | Parent company | Real-time |

---

## 📊 Summary Stats

| Category | Count | Coverage |
|----------|-------|----------|
| **Web Pages** | 12 | All user-facing routes |
| **Search Engine Metadata** | 2 | robots.txt, sitemap.xml |
| **LLM Discovery** | 2 | llms.txt, llms-full.txt |
| **Agent/API Metadata** | 3 | agent-card.json, ai-plugin.json, FiberAgent-card.json |
| **API Documentation** | 3 | OpenAPI spec, Swagger UI, MCP endpoint |
| **Structured Data** | 3 | JSON-LD (org, breadcrumb, per-page) |
| **External Pointers** | 5 | GitHub, Twitter, ERC-8004, Email, Fiber.shop |
| **TOTAL DISCOVERY POINTS** | **30** | 100% coverage |

---

## 🎯 Discovery by Audience

| Audience | Primary Entry Points | Secondary | Tertiary |
|----------|---------------------|-----------|----------|
| **Search Engines** | robots.txt → sitemap.xml → pages | JSON-LD schemas | Structured data |
| **LLMs** | llms.txt → llms-full.txt | agent-card.json | Pages + docs |
| **AI Agents** | agent-card.json → MCP endpoint | OpenAPI spec | GitHub |
| **Developers** | `/developers` page → OpenAPI spec | GitHub README | Code examples |
| **Regular Users** | Landing page `/` → other pages | `/demo` page | `/getting-started` |
| **Investors** | `/onepager` → `/about` | Statistics page | GitHub |
| **Blockchain Explorers** | ERC-8004 registry | agent-card.json | FiberAgent-card.json |

---

## ✅ Discovery Completeness Checklist

- ✅ Search engines can crawl & index all public pages
- ✅ LLMs can discover purpose & capabilities
- ✅ Agents can find API specs & endpoints
- ✅ Developers have full documentation + working examples
- ✅ Blockchain verification available (ERC-8004)
- ✅ Social proof available (Twitter, GitHub, contact)
- ✅ Rich snippets enabled for search results
- ✅ MCP protocol supported for integration
- ✅ ChatGPT plugin compatible
- ✅ Multiple metadata formats for different crawlers

**FiberAgent is 100% discoverable across Web2, Web3, and agentic protocols.** 🚀
