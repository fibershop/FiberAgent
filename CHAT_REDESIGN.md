# FiberAgent Chat Redesign — Daydream-Style Product Discovery

**Status:** IN PROGRESS (Sub-agent working on components)
**Timeline:** ~6 hours (parallel work)
**Scope:** `/chat` page only

---

## Design Goals

Match https://daydream.ing UI pattern for product discovery:
- **Product cards** with large images, prices, availability
- **Interactive filter chips** for refinement
- **Guided browsing** with trending recommendations
- **Conversational refinement** — chat naturally to filter
- **Best deal highlighting** across multiple sources

---

## Architecture

### 1. Frontend Components (React)

#### ProductCard.js
```
┌─────────────────────────────┐
│         Image               │
├─────────────────────────────┤
│ Product Title               │
│ Price | Cashback            │
│ ⭐ More like this            │
│ 🔖 Save | 🔗 Shop Now       │
└─────────────────────────────┘
```

Features:
- Image with fallback to merchant favicon
- Price display (show savings vs other sources)
- Cashback rate + estimated earnings
- "More like this" → Refine similar
- Save to bookmarks → localStorage
- Shop links with tracking

#### FilterChips.js
```
[Under $200] [Running] [Air Max] [Casual] [Nike] [New Arrival]
```

Features:
- Dynamic generation from product metadata
- Toggle active state
- Show count (e.g., "Nike (42)")
- Clicking sends chat refinement automatically

#### ProductGrid.js
```
Shows 2-4 products per message
Responsive grid layout
Smooth animations (Framer Motion)
```

---

### 2. Backend Enhancements

#### `/api/chat.js`

**New request body:**
```json
{
  "message": "Nike shoes",
  "filters": {
    "price_min": 0,
    "price_max": 200,
    "category": "Running",
    "brand": "Nike"
  },
  "conversationHistory": []
}
```

**New response format:**
```json
{
  "success": true,
  "response": "I found 12 Nike running shoes under $200...",
  "products": [
    {
      "id": "nike_run_001",
      "title": "Nike Run Defy",
      "price": 65,
      "image_url": "...",
      "merchant": "Nike",
      "cashback_rate": 0.05,
      "sources": [
        { "site": "Nike", "price": 65, "affiliate_link": "..." },
        { "site": "Amazon", "price": 68, "affiliate_link": "..." },
        { "site": "ASOS", "price": 70, "affiliate_link": "..." }
      ],
      "best_deal": "Nike - $65",
      "tags": ["Running", "Air Max", "Under $200", "New Arrival"]
    }
  ],
  "available_filters": [
    { "type": "price_range", "value": "Under $100", "count": 24 },
    { "type": "price_range", "value": "$100-$200", "count": 8 },
    { "type": "style", "value": "Running", "count": 18 },
    { "type": "style", "value": "Casual", "count": 14 }
  ],
  "trending": {
    "category": "Sneakers",
    "trend": "On Pinterest: #NikeRunning trending ↑28% this week",
    "hashtags": ["#NikeRunning", "#RunDefy", "#SneakerStyle"]
  }
}
```

#### Key Features

1. **Multi-source search:**
   - Fiber API (primary)
   - Google Shopping (fallback)
   - Direct merchant websites (Nike, Adidas, etc.)
   - Compare prices automatically

2. **Best deal detection:**
   - Lowest price wins
   - Factor in cashback (price - cashback = effective cost)
   - Show savings compared to other sources

3. **Dynamic filters:**
   - Extract from product data
   - Show count per filter
   - Auto-update as results change

4. **Trending integration:**
   - Fetch Pinterest trending categories
   - Show hashtags related to search
   - Guide user with "Trending: XYZ"

5. **Smart refinement:**
   - User clicks filter chip → Auto-sends refined message
   - Claude responds with filtered results
   - Products update in real-time

---

## Implementation Plan

### Phase 1: Components (Sub-agent)
- [ ] ProductCard.js — Product display
- [ ] FilterChips.js — Dynamic filter UI
- [ ] ProductGrid.js — Grid layout
- [ ] Styling (CSS modules)

### Phase 2: API Enhancement
- [ ] Multi-source search logic
- [ ] Price comparison algorithm
- [ ] Filter extraction
- [ ] Pinterest trending API integration
- [ ] Response formatting

### Phase 3: ChatPage Integration
- [ ] Render ProductCard components
- [ ] Display FilterChips
- [ ] Handle filter clicks → refinement
- [ ] Bookmarks localStorage
- [ ] Trending display

### Phase 4: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization
- [ ] Mobile responsiveness

---

## Data Flow

```
User types: "Nike shoes under $200"
    ↓
ChatPage.handleSendMessage()
    ↓
/api/chat.js receives:
  - message: "Nike shoes under $200"
  - filters: { price_max: 200, brand: "Nike" }
    ↓
Search logic:
  1. Extract keywords: "Nike shoes"
  2. Query Fiber API
  3. Query Google Shopping API (if available)
  4. Compare prices
  5. Detect best deals
  6. Extract dynamic filters
  7. Fetch Pinterest trends
    ↓
Claude responds with:
  "Here are the top Nike shoes under $200..."
    ↓
Response includes:
  - 4-6 product cards
  - Available filters (Running, Casual, etc.)
  - Trending info
    ↓
ChatPage renders:
  - Product cards
  - Filter chips (clickable)
  - Trending sidebar
    ↓
User clicks filter: "Running"
    ↓
Auto-sends: "Show me running shoes"
    ↓
Loop repeats with refined results
```

---

## API Integration Needed

1. **Google Shopping API** (optional, for price comparison)
   - Requires API key + billing
   - Alternative: Scrape public data

2. **Pinterest API** (for trending)
   - Get trending categories
   - Extract hashtags
   - Public data (no auth required)

3. **Merchant APIs** (Nike, Adidas, etc.)
   - Affiliate links for direct access
   - Already integrated via Fiber

---

## Success Criteria

✅ Product cards display like Daydream design
✅ Filter chips are dynamic + interactive
✅ Chat refines results when filters clicked
✅ Shows best prices across sources
✅ Pinterest trending displays
✅ Mobile responsive
✅ All code committed + deployed to Vercel

---

## Notes

- No database changes needed (stateless)
- Fiber API is source of truth for cashback
- Online search is enhancement (fallback if no Fiber results)
- Filter state resets per conversation (no persistence)
