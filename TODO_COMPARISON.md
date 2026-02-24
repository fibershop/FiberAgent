# TODO: Product Comparison Endpoint — Deferred from Session 2

**Status:** ⏳ Deferred for later implementation  
**Complexity:** Medium-High (dedupe + sorting logic)  
**Priority:** Nice-to-have (not critical path)

---

## Problem to Solve

User wants to compare the same product across different merchants to find:
- Lowest price
- Highest cashback rate
- Best value (lowest price after cashback)

**Example:**
```
User: "Compare Nike Air Force 1 across merchants"

Response:
1. Finish Line — $115 | 3.25% cashback ($3.74)
2. NIKE — $115 | 0.65% cashback ($0.75)
3. Foot Locker — $125 | 2.5% cashback ($3.13)
...shows savings vs best deal
```

---

## Implementation Challenges

1. **Product Deduplication**
   - Fiber search returns products from many merchants
   - Same product (e.g., "Nike Air Force 1") listed at multiple merchants
   - Need to identify "same product" across results
   - Problem: Different merchants may have slightly different titles/descriptions
   - Solution: Fuzzy matching on product name + brand?

2. **Sorting Strategy**
   - By cashback rate? (user wants money back)
   - By total cost after cashback? (lowest final price)
   - By price? (lowest sticker price)
   - Multiple sort options?

3. **Data Freshness**
   - Fiber search API returns current products
   - But prices/cashback may vary hourly
   - Is comparison accurate? Do we show timestamps?

4. **Edge Cases**
   - Product not available at multiple merchants
   - Price out of stock / unavailable
   - Cashback changes mid-session
   - Same merchant lists same product twice (different SKUs)

---

## Possible Approaches

### Approach A: Simple String Matching
```javascript
// Group by lowercase product title
const grouped = results.reduce((acc, product) => {
  const key = product.title.toLowerCase();
  if (!acc[key]) acc[key] = [];
  acc[key].push(product);
  return acc;
}, {});
```
**Pros:** Fast, simple  
**Cons:** Misses variations ("Air Force 1" vs "AF1" vs "Nike Air Force 1 '07")

### Approach B: Fuzzy Matching
```javascript
// Use library: fuse.js or leven distance
// Compare titles with similarity threshold (e.g., 80% match)
```
**Pros:** Handles variations  
**Cons:** Slower, needs fine-tuning, may over-match

### Approach C: AI-Powered (Future)
```javascript
// Call Claude/GPT to identify "same product"
// "Are these the same product?" → yes/no
```
**Pros:** Accurate  
**Cons:** Expensive (API calls), slow

### Approach D: User Confirms
```
User: "Compare Nike Air Force 1"
API returns groups of similar products
User selects which group = "this is the one I want to compare"
Show comparison for that group
```
**Pros:** Accurate, user-driven  
**Cons:** Adds friction (one more step)

---

## Recommendation for Future

**Start with Approach A (simple string matching):**
1. Group by lowercase product title
2. Sort by cashback rate (descending)
3. Show top 5 merchants for that product
4. If user needs better matching, upgrade to fuzzy matching

**Future: Approach B (fuzzy) if needed**
- Add fuse.js library
- Set similarity threshold (~85%)
- Test with real Fiber products

---

## Related Tasks

- **Task 3:** Rate limiting (critical for protecting API)
- **Task 4:** Analytics layer (show trending products that could benefit from comparison)
- **Session 3:** Product filtering/sorting (would complement comparison)

---

## When to Revisit

- After Task 3-4 complete (API protection + analytics)
- After seeing real usage patterns (which products do users compare?)
- After getting user feedback (what deduplication works best?)
- If Fiber exposes product categorization (could use that for matching)

---

**Store this strategy for Session 3 or later.** Continue with Task 3 now! 🚀
