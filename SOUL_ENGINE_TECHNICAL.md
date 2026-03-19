# Soul Engine — Technical Architecture
## How Fiber Hosts Your Agent Soul in the Cloud

---

## THE CONCEPT

In OpenClaw, every agent has a `SOUL.md` — a file that defines who the agent is and what it knows about its human. Fiber applies the same idea to shopping: **every user gets a "shopping soul"** that stores their taste, sizes, budget, and values.

The difference: instead of running on a Mac Mini at home, it runs on Fiber's cloud. Same depth of personalization, zero setup.

---

## HOW IT WORKS (3 PHASES)

### Phase 1: Onboarding (First 2 minutes)

When a user signs up, they don't fill out a boring form. They have a short conversation:

```
Fiber: "Hey! I'm your shopping agent. Let me learn about you real quick.
        What's your style? (minimalist, streetwear, classic, trendy...)"

User:  "I like minimalist stuff, clean lines. Not flashy."

Fiber: "Got it. What about sizes?"

User:  "Shoes 10, shirts M, pants 32/32"

Fiber: "Budget per item?"

User:  "Usually $50-200, sometimes I'll splurge on shoes"

Fiber: "Any brands you love or hate?"

User:  "Love Nike and Patagonia. Not into luxury brands."

Fiber: "Last one — anything you care about? Sustainability, 
        made in USA, vegan, etc?"

User:  "Yeah, sustainable when possible"

Fiber: "Perfect. I know you now. Let's shop. 🛒"
```

**Behind the scenes:** An LLM extracts structured data from this conversation and creates the user's Soul Profile.

---

### Phase 2: The Soul Profile (Data Model)

Every user's soul is stored as structured JSON + vector embeddings:

```json
{
  "user_id": "usr_a1b2c3",
  "created_at": "2026-03-19T10:00:00Z",
  "updated_at": "2026-03-19T18:30:00Z",
  
  "soul": {
    "style": {
      "primary": "minimalist",
      "secondary": ["clean", "functional"],
      "avoid": ["flashy", "loud patterns", "luxury"]
    },
    
    "sizes": {
      "shoes": "10 US",
      "shirt": "M",
      "pants": "32/32",
      "jacket": "M"
    },
    
    "budget": {
      "default_range": [50, 200],
      "splurge_categories": ["shoes", "outerwear"],
      "splurge_max": 350,
      "currency": "USD"
    },
    
    "brands": {
      "love": ["Nike", "Patagonia", "Allbirds", "Everlane"],
      "neutral": [],
      "avoid": ["Gucci", "Louis Vuitton", "Supreme"]
    },
    
    "values": ["sustainable", "quality-over-quantity", "ethical-manufacturing"],
    
    "categories": {
      "interested": ["running shoes", "outdoor gear", "casual wear"],
      "not_interested": ["formal wear", "jewelry", "accessories"]
    },
    
    "color_preferences": {
      "love": ["black", "navy", "earth tones"],
      "avoid": ["neon", "pink"]
    }
  },
  
  "purchase_history": [
    {
      "date": "2026-03-15",
      "product": "Nike Pegasus 41",
      "price": 145,
      "merchant": "Nike",
      "category": "running shoes",
      "satisfaction": "loved",  // loved | liked | returned
      "notes": "Perfect fit, great cushioning"
    }
  ],
  
  "learned_preferences": [
    {
      "source": "conversation",
      "date": "2026-03-19",
      "insight": "Prefers road running shoes over trail",
      "confidence": 0.85
    },
    {
      "source": "purchase_pattern",
      "date": "2026-03-18",
      "insight": "Buys shoes every 3-4 months",
      "confidence": 0.70
    }
  ],
  
  "embedding": [0.023, -0.156, 0.891, ...]  // 1536-dim vector for similarity matching
}
```

---

### Phase 3: How It Personalizes Every Search

When a user says "find me running shoes":

```
STEP 1: Load Soul
─────────────────
Fiber loads the user's soul profile from database.

STEP 2: Enhance Query
─────────────────────
Raw query: "running shoes"
Enhanced query: "minimalist running shoes, road running, 
                size 10, $50-200, brands: Nike/Allbirds preferred,
                sustainable materials preferred, 
                avoid flashy colors"

STEP 3: Search All Merchants
────────────────────────────
Fiber API searches 50,000+ merchants with enhanced query.
Returns 50+ raw results.

STEP 4: Score & Rank (Soul Scoring)
────────────────────────────────────
Each product gets a "soul score" (0-100):

  Nike Pegasus 41 ($145, Nike, minimal design, recycled materials)
  → Style match: 95   (minimalist ✓)
  → Brand match: 100  (Nike = loved brand)
  → Budget match: 100 ($145 in $50-200 range)
  → Values match: 90  (recycled materials ✓)
  → History match: 80 (bought Pegasus before, loved it)
  → SOUL SCORE: 93

  Hoka Clifton 9 ($140, REI, maximalist cushion, standard materials)
  → Style match: 60   (maximalist ≠ minimalist)
  → Brand match: 50   (neutral brand)
  → Budget match: 100 ($140 in range)
  → Values match: 40  (no sustainability info)
  → History match: 30 (never bought Hoka)
  → SOUL SCORE: 56

STEP 5: Return Top Results
──────────────────────────
Return top 6, sorted by soul score.
User sees: "Based on your style and preferences, 
            here are your best matches..."
```

---

## TECHNICAL STACK

```
┌─────────────────────────────────────────────┐
│                 USER LAYER                   │
│  Chat UI / Agent API / MCP Protocol          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              SOUL ENGINE                     │
│                                              │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ Profile      │  │ Preference         │   │
│  │ Manager      │  │ Extractor (LLM)    │   │
│  │              │  │                    │   │
│  │ CRUD ops on  │  │ Extracts structured│   │
│  │ soul profiles│  │ data from natural  │   │
│  │              │  │ language           │   │
│  └──────────────┘  └────────────────────┘   │
│                                              │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ Soul Scorer  │  │ Learning Engine    │   │
│  │              │  │                    │   │
│  │ Scores       │  │ Updates soul from  │   │
│  │ products     │  │ purchases, returns,│   │
│  │ against soul │  │ conversations      │   │
│  └──────────────┘  └────────────────────┘   │
│                                              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              DATA LAYER                      │
│                                              │
│  PostgreSQL          Redis          Pinecone │
│  (soul profiles,     (session       (vector  │
│   purchase history)   cache)        embeddings│
│                                    for taste │
│                                    matching) │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           COMMERCE LAYER                     │
│                                              │
│  Fiber API → 50,000+ merchants               │
│  Shopify Stores → Direct scraping            │
│  Price comparison → Real-time                │
│  Cashback calculation → Affiliate network    │
└─────────────────────────────────────────────┘
```

---

## THE BRIDGE: CLOUD ↔ LOCAL AGENTS

This is the key technical insight:

### Scenario A: User has NO personal agent (99% of users today)
```
User → Fiber Cloud → Soul stored on Fiber servers
                   → Fiber acts as their agent
                   → Full personalization in the cloud
```

### Scenario B: User runs OpenClaw (or any local agent)
```
User → OpenClaw (local) → Has its own SOUL.md
                         → Calls Fiber Commerce API
                         → Sends relevant preferences with query
                         → Fiber returns personalized results
                         → Soul stays LOCAL (privacy)
```

### Scenario C: Sync between cloud and local
```
User starts on Fiber Cloud (easy onboarding)
         ↓
Later installs OpenClaw at home
         ↓
Exports soul from Fiber → imports to OpenClaw
         ↓
Now agent runs locally with full history
         ↓
Still uses Fiber API for merchant search
```

### The Standard Format

Soul profiles use a standard format (like vCard for contacts):

```yaml
# fiber-soul-v1.yaml
version: "1.0"
type: "shopping-soul"

identity:
  style: [minimalist, functional]
  values: [sustainable, quality]

body:
  shoe_size: "10 US"
  shirt_size: "M"
  pants_size: "32/32"

preferences:
  budget_range: [50, 200]
  favorite_brands: [Nike, Patagonia]
  avoided_brands: [Gucci]
  favorite_categories: [running shoes, outdoor gear]
  color_preferences: [black, navy, earth tones]

history:
  total_purchases: 12
  average_satisfaction: 4.2
  return_rate: 0.08
  
# This file can be:
# - Stored on Fiber cloud (default)
# - Exported to local agent (OpenClaw)
# - Imported from another agent
# - Synced bidirectionally
```

---

## PRIVACY & SECURITY

### Encryption
- Soul data encrypted at rest (AES-256-GCM)
- Encrypted in transit (TLS 1.3)
- User holds encryption key (optional: end-to-end encrypted)

### Data Ownership
- User owns 100% of their soul data
- Can export anytime (JSON, YAML, or standard format)
- Can delete anytime (hard delete, not soft)
- GDPR/CCPA compliant by design

### What Merchants See
Merchants NEVER see the soul. They see:
- "A qualified buyer is interested in running shoes"
- "Budget: $100-200"
- That's it. No personal data leaks.

### What Fiber Sees
- Encrypted soul profile (can decrypt for personalization)
- Purchase history (for improving recommendations)
- We NEVER sell this data
- Revenue comes from affiliate commissions, not data sales

---

## HOW THE SOUL GETS SMARTER

### 1. Explicit Feedback
```
After purchase → "How did you like the Nike Pegasus?"
User: "Love them, best running shoes I've had"
→ Soul updated: increase Nike affinity, running shoes preference
```

### 2. Implicit Signals
```
User searches for "sustainable sneakers" 3 times
→ Soul updated: increase sustainability value weight

User always clicks products under $150
→ Soul updated: narrow budget range to $80-150

User returns a "bold pattern" shirt
→ Soul updated: decrease pattern preference, increase minimalist
```

### 3. Conversation Mining
```
User: "I'm training for a marathon, need better shoes"
→ Soul updated: add "marathon training" to context
→ Future searches weighted toward performance running shoes

User: "My wife loves Allbirds"
→ NOT added to user's soul (about wife, not user)
→ But stored as gift-giving context
```

### 4. Time Decay
```
Preferences from 2 years ago → weight: 0.3
Preferences from 6 months ago → weight: 0.7
Preferences from last month → weight: 1.0

Old preferences fade unless reinforced.
Like human memory.
```

---

## COMPETITIVE ADVANTAGE

### Why This Is Hard to Copy

1. **Cold start problem**: You need purchase history to personalize. 
   We solve it with conversational onboarding (2 min → useful profile).

2. **Feedback loop**: More purchases → better soul → better recommendations 
   → more purchases. Flywheel that compounds over time.

3. **Standard format**: If we define the soul standard, everyone builds 
   around our format. Like how Stripe defined payment APIs.

4. **Multi-agent compatibility**: Works with OpenClaw, Claude, GPT, 
   Llama, etc. Not locked to one AI provider.

---

## INVESTOR TALKING POINTS

When investors ask "How does the soul engine work?":

**30-second version:**
"When you sign up, you have a 2-minute conversation with Fiber — your style, sizes, budget, values. We store that as an encrypted profile. Every time you search, we use that profile to score and rank products specifically for you. It gets smarter with every purchase. Think of it as your shopping DNA."

**Technical follow-up:**
"Under the hood, it's a structured JSON profile plus vector embeddings. The LLM extracts preferences from natural conversation, the scoring engine weights products against your profile, and a learning engine updates preferences from purchase behavior. All encrypted, user-owned, exportable."

**The bridge pitch:**
"Today, 99% of people don't run AI agents. So we host their soul in the cloud — same personalization, zero setup. Tomorrow, when they run their own agents, those agents use our API and can even import their soul profile. We own both sides of the transition."

---

## IMPLEMENTATION TIMELINE

| Phase | Timeline | What |
|-------|----------|------|
| **v1** | Month 1-2 | Basic profile (form + conversation) |
| **v2** | Month 3-4 | Soul scoring + purchase learning |
| **v3** | Month 5-6 | Vector embeddings + similarity matching |
| **v4** | Month 7-8 | Export/import + OpenClaw sync |
| **v5** | Month 9-12 | Advanced learning + time decay |

**v1 is simple.** Even a basic profile with sizes + brands + budget dramatically improves search results. We iterate from there.

---

*This is the core IP of Fiber. The soul engine is what makes "agentic commerce" actually work.*
