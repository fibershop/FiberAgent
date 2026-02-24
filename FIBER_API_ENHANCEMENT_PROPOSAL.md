# Fiber API Enhancement Proposal

**To:** Fiber API Team  
**From:** FiberAgent  
**Date:** Feb 24, 2026  
**Subject:** Include Color & Logo Metadata in Stats Endpoints

---

## Current State

We're hardcoding token colors and logo mappings in our frontend because Fiber API doesn't include them:

```javascript
// FiberAgent frontend hardcoding (not ideal)
const logoMap = {
  'BONK': bonkLogo,
  'MON': monadLogo,
  'SOL': solanaLogo,
  // ... etc
};

const colorMap = {
  'Electronics': '#00D1FF',
  'Fashion': '#E5FF00',
  'Footwear': '#FF4500',
  // ... etc
};
```

This works, but:
- ❌ Requires frontend to maintain hardcoded mappings
- ❌ If a new token is added to Fiber, frontend doesn't know its color/logo
- ❌ If colors change on Fiber side, frontend is out of sync
- ❌ Not scalable (every client needs to hardcode the same mappings)

---

## Proposed Enhancement

### Endpoint 1: Enhanced Cashback Token Ranking

**Current Response:**
```json
{
  "cashback_token_ranking": [
    {
      "rank": 1,
      "token_id": "46ccaa65-f829-4a8c-a806-be96636dfc38",
      "symbol": "BONK",
      "name": "Bonk",
      "network": "Solana",
      "selected_by": 749
    }
  ]
}
```

**Proposed Response (Add Color + Logo):**
```json
{
  "cashback_token_ranking": [
    {
      "rank": 1,
      "token_id": "46ccaa65-f829-4a8c-a806-be96636dfc38",
      "symbol": "BONK",
      "name": "Bonk",
      "network": "Solana",
      "selected_by": 749,
      "color": "#FFA500",
      "logo_url": "https://api.fiber.shop/assets/tokens/bonk.png"
    }
  ]
}
```

---

### Endpoint 2: Enhanced Trending Verticals

**Current Response:**
```json
{
  "trending_verticals": [
    {
      "vertical": "Electronics",
      "sales_count": 94,
      "purchase_value_usd": 14100
    }
  ]
}
```

**Proposed Response (Add Color):**
```json
{
  "trending_verticals": [
    {
      "vertical": "Electronics",
      "sales_count": 94,
      "purchase_value_usd": 14100,
      "color": "#00D1FF"
    }
  ]
}
```

---

### Endpoint 3: Enhanced Top Performing Brands (Optional)

**Current Response:**
```json
{
  "top_performing_brands": [
    {
      "merchant": "Nike",
      "sales_count": 37,
      "purchase_value_usd": 5550
    }
  ]
}
```

**Proposed Response (Add Logo + Color):**
```json
{
  "top_performing_brands": [
    {
      "merchant": "Nike",
      "sales_count": 37,
      "purchase_value_usd": 5550,
      "logo_url": "https://api.fiber.shop/assets/merchants/nike.png",
      "color": "#000000"
    }
  ]
}
```

---

## Benefits

### For Fiber
- ✅ Single source of truth for metadata
- ✅ All clients get consistent styling
- ✅ Easy to update colors/logos without client changes
- ✅ Better API design (metadata with data)

### For FiberAgent (& other clients)
- ✅ No hardcoded mappings needed
- ✅ Automatic support for new tokens
- ✅ Always in sync with Fiber's source of truth
- ✅ Cleaner code, fewer maintenance headaches
- ✅ Professional API integration

---

## Implementation (FiberAgent side)

Once Fiber provides this data, our code becomes trivial:

```javascript
// Before (hardcoded):
const enrichCashbackTokens = (tokens) => {
  const logoMap = { 'BONK': bonkLogo, ... };
  const colorMap = { 'Electronics': '#00D1FF', ... };
  // 100+ lines of mapping code
};

// After (use API data directly):
const enrichCashbackTokens = (tokens) => {
  // Tokens already have color + logo_url from Fiber API
  return tokens; // Done!
};
```

---

## Rollout Plan

### Phase 1: Optional Enhancement
- Add fields as **optional** in Fiber API response
- FiberAgent checks for their presence
- If present, use them; if not, fall back to hardcoded mappings
- **Zero breaking changes**

### Phase 2: Migrate Clients
- Update FiberAgent & other clients to use new fields
- Remove hardcoded mappings

### Phase 3: Deprecate
- After 3+ months, make fields required
- Gradually deprecate old mappings

---

## Data Sources

For Fiber engineers:

### Token Colors & Logos
- Use Coingecko API: https://api.coingecko.com/api/v3/coins/{id}
- Or maintain internal token registry with colors
- Store in: `tokens` table with `color`, `logo_url` columns

### Category Colors
- Maintain mapping: `categories` table with `color` column
- Existing categories: Electronics, Fashion, Footwear, Home & Garden, Beauty, Sports, etc.

### Merchant Logos
- Could pull from merchant database
- Optional (nice-to-have)

---

## Example SQL Schema

```sql
-- tokens table (add columns)
ALTER TABLE tokens ADD COLUMN color VARCHAR(7); -- hex color
ALTER TABLE tokens ADD COLUMN logo_url VARCHAR(255);

-- categories table (add column)
ALTER TABLE categories ADD COLUMN color VARCHAR(7);

-- merchants table (add column - optional)
ALTER TABLE merchants ADD COLUMN logo_url VARCHAR(255);
```

---

## Timeline

- **Phase 1 (Optional):** Can implement in next sprint
- **Phase 2 (Migration):** 1-2 sprints for ecosystem migration
- **Phase 3 (Deprecation):** After 3 months

---

## Questions?

This would make the Fiber API more professional and reduce maintenance burden across all clients. Happy to discuss implementation details!

**Contact:** FiberAgent Team

---

## Appendix: Current Hardcoded Mappings

### Token Colors
- BONK: #FFA500 (Orange)
- MON: #7E3AF2 (Purple)
- SOL: #14F195 (Green)
- USDC: #00D1FF (Cyan)
- PENGU: #FF69B4 (Pink)
- VALOR: #FF4500 (Orange-Red)
- AOL: #0000FF (Blue)
- CHOG: #FFD700 (Gold)
- MF: #E5FF00 (Yellow-Green)

### Category Colors
- Electronics: #00D1FF (Cyan)
- Fashion: #E5FF00 (Yellow-Green)
- Footwear: #FF4500 (Orange-Red)
- Home & Garden: #14F195 (Green)
- Beauty: #FF69B4 (Pink)
- Sports & Outdoors: #7E3AF2 (Purple)
- Toys & Games: #FF4500 (Orange-Red)
- Clothing & Apparel: #E5FF00 (Yellow-Green)
- Health & Beauty: #FF69B4 (Pink)

---

**This proposal aims to improve API design & reduce frontend maintenance.**
