# FiberAgent Chat Redesign — Daydream-Style Product Discovery

**Status:** PHASE 2 COMPLETE ✅ (API enhancements done, awaiting frontend integration)
**Timeline:** Phase 2 completed 2026-03-18 17:30 GMT+1
**Scope:** `/chat` page only

## Phase 2 Status: ✅ COMPLETE
- [x] Enhanced `/api/chat.js` with multi-source search
- [x] Smart Pinterest trending detection
- [x] Best deal highlighting with effective price sorting
- [x] Per-conversation filter state management
- [x] Helper functions (searchFiber, searchShopify, calculateEffectivePrice, etc.)
- [x] Tests & examples file
- [x] Claude integration updates

---

## Phase 2 Implementation Summary

### What Was Built
**Enhanced `/api/chat.js`** with full multi-source product discovery:

1. **Multi-Source Search**
   - Fiber API (primary source)
   - Shopify store searches (free method using mock data + direct APIs)
   - Deduplication by title + merchant
   - Up to 10 results per source

2. **Smart Product Ranking**
   - Calculates effective price: `price - (price * cashback_rate)`
   - Sorts by effective price (best deal first)
   - Highlights best deal prominently in response

3. **Pinterest Trending (Smart Detection)**
   - Only fetches for vague queries (1-2 words, generic)
   - Skips for specific queries (brand names, model numbers, price mentions)
   - Returns trending category + hashtags + Pinterest link

4. **Per-Conversation Filter State**
   - Extracts filters from natural language
   - Price range detection (`under $200`, `$100-500`)
   - Brand detection (Nike, Adidas, Apple, etc.)
   - Category detection (Running, Gaming, Formal, etc.)
   - Maintains state across conversation
   - Reset on user request ("clear filters")

5. **Best Deal Response Format**
   ```json
   {
     "best_deal": {
       "price": 65,
       "merchant": "Nike",
       "cashback_rate": 0.05,
       "cashback_amount": 3.25,
       "effective_price": 61.75,
       "savings_note": "Best price + highest cashback"
     }
   }
   ```

### Helper Functions Implemented
- `searchProducts(keywords, filters)` — Multi-source search orchestrator
- `searchFiber(keywords, filters)` — Query Fiber API
- `searchShopify(keywords, filters)` — Query Shopify stores (free method)
- `deduplicateProducts(products)` — Remove duplicates
- `calculateEffectivePrice(price, cashbackRate)` — Real cost calculation
- `shouldFetchTrending(query)` — Smart vague query detection
- `fetchPinterestTrending(query)` — Get trending info
- `updateFilterState(message, currentFilters)` — Natural language filter extraction
- `sortByEffectivePrice(products)` — Best deal ranking
- `buildSystemPrompt()` — Enhanced Claude instructions

### Test Coverage
See `/api/__tests__/chat-phase2.test.js` for:
- 6 comprehensive test scenarios
- Examples showing trending detection logic
- Multi-source price comparison
- Filter state management across conversation
- Response format examples
- Helper function test cases

### Next Steps (Phase 3: Frontend Integration)
- [ ] Render ProductCard components from response
- [ ] Display FilterChips dynamically
- [ ] Handle filter clicks → auto-refine message
- [ ] Bookmarks localStorage
- [ ] Trending display sidebar
- [ ] Loading states & error handling
- [ ] Mobile responsiveness

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

### Phase 1: Components ✅ DONE
- [x] ProductCard.js — Product display
- [x] FilterChips.js — Dynamic filter UI
- [x] ProductGrid.js — Grid layout
- [x] Styling (CSS modules)
- [x] API updated with filter support

### Phase 2: API Enhancement ✅ COMPLETE
- [x] Multi-source search logic (Fiber + Shopify)
- [x] Price comparison algorithm (effective price)
- [x] Best deal detection + sorting
- [x] Smart Pinterest trending (vague query detection)
- [x] Per-conversation filter state (natural language extraction)
- [x] Response formatting (products + filters + trending)
- [x] Helper functions + test coverage

### Phase 2b: ChatPage Integration 🔄 IN PROGRESS
- [ ] Import ProductCard, FilterChips
- [ ] Render products + filters
- [ ] Handle filter clicks → auto-refine
- [ ] CompareModal component
- [ ] Bookmarks localStorage persistence
- [ ] Error handling + friendly messages
- [ ] Loading states + skeletons
- [ ] Mobile responsiveness

### Phase 3: Testing & Polish 📋 PENDING
- [ ] End-to-end flow testing
- [ ] Performance optimization
- [ ] Screenshot validation vs Daydream design
- [ ] Production deployment to Vercel

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
