# Skill Marketplace — Semantic Discovery

## The Vision

Users shouldn't need to know FiberAgent exists. They should just ask their agent:

> "Find me hiking boots with cashback rewards"

Agent should:
1. **Understand intent** — "user wants shopping + cashback"
2. **Search marketplace** — "what skills match shopping + cashback?"
3. **Find FiberAgent** — "FiberAgent has those keywords!"
4. **Ask permission** — "Should I install FiberAgent skill to help?"
5. **Install auto-magically** — Downloads + loads skill
6. **Use it** — Executes search with cashback

---

## How It Works

### Step 1: Agents Query ClawHub Marketplace

```javascript
// Agent analyzes user input
const userIntent = {
  wants: ['deals', 'shopping', 'cashback'],
  mentions: ['Monad', 'crypto'],
  context: 'ecommerce'
};

// Agent searches ClawHub marketplace
const matchingSkills = await agent.searchSkills({
  keywords: ['shopping', 'cashback', 'monad'],
  category: 'commerce'
});

// Returns:
[
  {
    name: 'fiberagent',
    version: '1.0.1',
    matchScore: 0.95,  // 95% match
    keywords: ['shopping', 'cashback', 'crypto', 'monad', 'deals'],
    description: 'Find products with crypto cashback across 50K+ merchants'
  },
  {
    name: 'amazon-skill',
    version: '1.0.0',
    matchScore: 0.60,  // 60% match (has shopping, not cashback)
    keywords: ['shopping', 'amazon', 'deals'],
    description: 'Search Amazon products'
  }
]
```

### Step 2: Agent Picks Best Match

```javascript
// FiberAgent wins (95% match vs 60%)
const bestSkill = matchingSkills[0]; // fiberagent

agent.askUser(`I found "${bestSkill.name}" - install it to help?`);
// User: "yes"
```

### Step 3: Agent Auto-Installs

```javascript
// Agent installs from ClawHub/npm
await agent.installSkill('fiberagent');

// Behind the scenes:
//   $ npm install fiberagent
//   OR
//   $ openclaw skill install fiberagent
//   OR download from ClawHub API

// Skill lands in:
//   ~/.openclaw/workspace/skills/fiberagent/
```

### Step 4: Agent Auto-Discovers (Filesystem)

```javascript
// Agent rescans skills directory
agent.discoverSkills();

// Finds FiberAgent (already there from install)
// Loads SKILL.md + package.json + index.js
// Registers it

agent.availableSkills.fiberagent // ✅ Now available!
```

### Step 5: Agent Uses It

```javascript
// Agent invokes the skill
const results = await agent.invokeTool('fiberagent:search_products', {
  agent_id: agent.id,
  keywords: 'hiking boots'
});

// Returns products with cashback
// Agent presents to user
```

---

## ClawHub Marketplace Structure

### Skills Registry

Each skill publishes metadata to ClawHub:

```json
{
  "name": "fiberagent",
  "version": "1.0.1",
  "description": "Find products with crypto cashback across 50,000+ merchants on Monad",
  "keywords": [
    "shopping",
    "cashback",
    "crypto",
    "monad",
    "erc-8004",
    "affiliate",
    "deals",
    "commerce",
    "agent-commerce"
  ],
  "category": "commerce",
  "author": "Laurent Salou",
  "repository": "https://github.com/openclawlaurent/FiberAgent",
  "installFrom": {
    "github": "openclawlaurent/FiberAgent#v1.0.1",
    "npm": "fiberagent@1.0.1",
    "clawhub": "fiberagent/1.0.1"
  },
  "tools": [
    {
      "name": "search_products",
      "description": "Search products with cashback rates"
    },
    {
      "name": "register_agent",
      "description": "Self-register for referral tracking"
    },
    {
      "name": "get_agent_stats",
      "description": "Get agent earnings and statistics"
    }
  ]
}
```

### Keyword Matching Algorithm

```javascript
function scoreSkillMatch(userKeywords, skillKeywords) {
  // Calculate Jaccard similarity between sets
  // How many keywords overlap?
  
  const userSet = new Set(userKeywords);
  const skillSet = new Set(skillKeywords);
  
  const intersection = new Set(
    [...userSet].filter(x => skillSet.has(x))
  );
  
  const union = new Set([...userSet, ...skillSet]);
  
  return intersection.size / union.size; // 0.0 to 1.0
}

// Example:
scoreSkillMatch(
  ['shopping', 'cashback', 'monad'],      // What user wants
  ['shopping', 'cashback', 'crypto', 'monad', 'deals']  // FiberAgent has
);
// Result: 0.75 (3 matches out of 4 unique words)
```

### ClawHub API Endpoint

```javascript
// Agent queries ClawHub
GET https://clawhub.com/api/v1/skills/search?q=shopping,cashback,monad

Response:
{
  "results": [
    {
      "name": "fiberagent",
      "matchScore": 0.95,
      "keywords": ["shopping", "cashback", "crypto", "monad", "deals"],
      "installFrom": {
        "npm": "fiberagent@1.0.1",
        "github": "openclawlaurent/FiberAgent#v1.0.1"
      }
    },
    ...
  ]
}
```

---

## Real Conversation Flow

### User Story: Natural Language Discovery

```
User: "I need hiking boots with cashback rewards"

Agent analyzes:
  ✅ Intent: commerce/shopping
  ✅ Keywords: hiking, boots, cashback, rewards
  ✅ Mentions: nothing about blockchain, but cashback suggests crypto

Agent thinks:
  "I need a shopping skill that handles cashback"
  
Agent queries ClawHub:
  GET /api/v1/skills/search?q=shopping,cashback

Agent gets results:
  1. fiberagent (score: 0.95) ← Best match!
     Keywords: shopping, cashback, crypto, monad, deals
  
  2. amazon-skill (score: 0.60)
     Keywords: shopping, amazon, deals

Agent asks user:
  "I found FiberAgent - a shopping skill with crypto cashback on Monad.
   Should I install it to help you find deals?"

User: "Yes!"

Agent installs:
  $ npm install fiberagent
  (Or downloads from ClawHub)

Agent discovers (filesystem scan):
  ✅ Found ~/.openclaw/workspace/skills/fiberagent/

Agent uses:
  await agent.invokeTool('fiberagent:search_products', {
    keywords: 'hiking boots'
  })

Agent responds:
  "Found 5 boots with cashback! Salomon Quest 4D saves you $5 
   (2% cashback). Columbia Ridge saves you $4.80 (4% cashback). 
   Which sounds better?"

User: "The Columbia one!"

Agent: "Perfect! I'll get you the link."
```

---

## Architecture

### Three-Layer Discovery

```
┌─ Layer 1: Semantic Discovery ──────────────────┐
│ User says: "hiking boots with cashback"        │
│ Agent understands intent + extracts keywords   │
│ Agent queries ClawHub marketplace              │
│ ClawHub returns matching skills                │
└────────────────────────────────────────────────┘
                      ↓
┌─ Layer 2: Installation ────────────────────────┐
│ Agent downloads matching skill from:           │
│   • ClawHub (official registry)                │
│   • npm (public registry)                      │
│   • GitHub (direct download)                   │
│ Installs to ~/.openclaw/workspace/skills/      │
└────────────────────────────────────────────────┘
                      ↓
┌─ Layer 3: Filesystem Discovery ───────────────┐
│ Agent scans ~/.openclaw/workspace/skills/      │
│ Finds newly installed FiberAgent               │
│ Reads SKILL.md + package.json + index.js       │
│ Registers tools                                │
│ Uses skill                                     │
└────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: ClawHub Skill Registry (Week 1-2)

**Goal:** Build searchable skill marketplace

```
ClawHub improvements:
  ✅ Skills have searchable keywords
  ✅ API endpoint for semantic search
  ✅ Auto-install integration with npm/GitHub
  ✅ Web UI to browse skills

FiberAgent:
  ✅ Register on ClawHub with keywords
  ✅ Make discoverable via search
```

**User experience:**
```bash
# Agent can discover skills
agent.searchSkills('shopping cashback monad')
# Returns: FiberAgent v1.0.1 (95% match)
```

### Phase 2: Agent Smart Selection (Week 2-3)

**Goal:** Agents automatically pick right skill

```
Agent improvements:
  ✅ Parse user intent (NLP)
  ✅ Extract relevant keywords
  ✅ Query ClawHub automatically
  ✅ Score matches
  ✅ Ask user for permission
  ✅ Install + use best match
```

**User experience:**
```
User: "Find hiking boots with cashback"
Agent: "Installing FiberAgent skill to help..."
[Agent auto-installs]
Agent: "Found 5 boots! Here's the best deal..."
```

### Phase 3: Silent Auto-Install (Week 3-4)

**Goal:** Agent installs skills without asking (optional)

```
Optional: Agent trusts ClawHub
  ✅ High-confidence matches auto-install
  ✅ User never asked (happens in background)
  ✅ Skill just "appears" when needed
  ✅ Agent uses it immediately
```

**User experience:**
```
User: "Find hiking boots with cashback"
Agent: "Found 5 boots! Here's the best deal..."
[FiberAgent was installed invisibly in background]
```

---

## Keywords for FiberAgent

To make FiberAgent discoverable, register these keywords on ClawHub:

```json
{
  "keywords": [
    "shopping",
    "cashback",
    "deals",
    "monad",
    "crypto",
    "erc-8004",
    "agent-commerce",
    "affiliate",
    "products",
    "merchants",
    "rewards",
    "commissions",
    "commerce",
    "ecommerce",
    "wildfire",
    "fiber",
    "buyers",
    "shopping assistant"
  ]
}
```

### Why These Keywords?

| Keyword | Why It Matters |
|---------|---|
| shopping | Core use case |
| cashback | Core differentiator |
| deals | User searching for deals |
| monad | Blockchain mention (Monad mainnet) |
| crypto | Blockchain mention (crypto rewards) |
| erc-8004 | On-chain reputation |
| agent-commerce | Agent + commerce |
| affiliate | Monetization mechanism |
| merchant | Data source |
| rewards | User benefit |
| commission | Agent benefit |

---

## Benefits of Semantic Discovery

### For Users
✅ **No knowledge required** — Just ask what you want  
✅ **Auto-install** — Skill appears when needed  
✅ **Best matches first** — Agent picks ideal skill  
✅ **No friction** — Works automatically

### For Developers
✅ **Organic discoverability** — Keywords do the marketing  
✅ **Network effect** — As more agents use it, more data  
✅ **No manual registration** — Just keywords in package.json  
✅ **Viral potential** — Agents sharing with agents

### For Platform (OpenClaw)
✅ **Skill marketplace thrives** — Searchable registry  
✅ **Better UX** — Users get right skills automatically  
✅ **Decentralized** — No approval needed (keywords do filtering)  
✅ **Scalable** — Works with thousands of skills

---

## Example: Alice Discovers FiberAgent Naturally

```
Alice to her agent:
  "I'm shopping for a laptop. Can you find me the best deal 
   with crypto cashback on Monad? I'm interested in that web3 stuff."

Agent analyzes:
  Keywords extracted: laptop, shopping, deal, crypto, cashback, monad, web3
  Intent: commerce + blockchain rewards

Agent queries ClawHub:
  GET /api/v1/skills/search?q=shopping,cashback,crypto,monad

Agent gets matches:
  1. fiberagent (98% match!)
     Keywords match: shopping ✓, cashback ✓, crypto ✓, monad ✓
     
  2. amazon-skill (40% match)
     Keywords match: shopping ✓
     
  3. stripe-payments (20% match)
     Keywords match: payment (not quite...)

Agent asks Alice:
  "I found FiberAgent - a shopping skill with crypto cashback on Monad!
   Perfect for what you asked. Should I install it?"

Alice: "Yes, install it!"

Agent installs:
  npm install fiberagent

Agent discovers:
  Scans skills/ directory
  Finds fiberagent/
  Loads it

Agent searches:
  await invokeTool('fiberagent:search_products', {
    keywords: 'laptop'
  })

Agent responds:
  "Found 8 laptops with cashback!
   
   🥇 Best deal: Dell XPS 13 Plus
      $999.99 → $869.99 effective (13% cashback = $130)
      
   💰 Budget: ASUS VivoBook
      $599.99 → $539.99 effective (6.7% cashback = $60)
      
   Which interests you?"

Alice: "The Dell! How much crypto do I get?"

Agent: "13% cashback = $130 in MON tokens sent to your wallet 
       when the purchase is confirmed!"

Alice: "Awesome! Let's do it."
```

---

## Summary

**The Problem:** Users don't know FiberAgent exists.

**The Solution:** Three-layer discovery architecture:

1. **Semantic Layer** — User says what they want, agent understands
2. **Marketplace Layer** — Agent searches ClawHub by keywords
3. **Filesystem Layer** — Agent installs skill, then discovers it locally

**Result:** Skills discovered and installed automatically based on what users ask for.

**For FiberAgent:** Register with keywords like `shopping`, `cashback`, `monad`, `crypto`, `deals` and agents will find it organically when users ask for that combination.

This is how **viral skill adoption** happens — not through marketing, but through natural language and semantic matching.

