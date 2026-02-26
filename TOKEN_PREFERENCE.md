# Token Preference Feature (Commit 10ef154)

## What's New

Users can now **choose their reward token** when setting up their wallet. Instead of always getting paid in MON, they can opt for BONK or USDC.

---

## User Flow

### Setup (First Search)

```
You: "Find Nike shoes"

Claude: "🔐 Wallet & Token Setup

What's your wallet address (0x...)?

Optional: What's your preferred reward token?
- MON (default, recommended)
- BONK (community token)
- USDC (stablecoin)

If you don't specify, MON will be used."

You: "0x9f2d... MON"
```

Claude passes:
```javascript
search_products(
  keywords: "Nike shoes",
  wallet_address: "0x9f2d...",
  preferred_token: "MON"
)
```

### Result

```
✅ Your Agent ID: claude-xyz789
Reward Token: MON
(Earnings will be paid in MON)
```

---

## Token Options

| Token | Use Case | Notes |
|-------|----------|-------|
| **MON** | Default | Native Monad token, ecosystem alignment |
| **BONK** | Community | Popular community token, liquidity available |
| **USDC** | Stablecoin | Stable value, no price volatility |

---

## How It Works

### Registration

When Claude registers with a preferred token:

```javascript
// Before
fetch('https://api.fiber.shop/v1/agent/register', {
  body: {
    agent_id: 'claude-xyz',
    wallet_address: '0x9f2d...'
  }
})

// After  
fetch('https://api.fiber.shop/v1/agent/register', {
  body: {
    agent_id: 'claude-xyz',
    wallet_address: '0x9f2d...',
    preferred_token: 'BONK'  // ← New field
  }
})
```

### Earnings Payout

**Before:** All earnings → MON only

**After:** 
- MON selected → Earnings paid in MON
- BONK selected → Earnings paid in BONK
- USDC selected → Earnings paid in USDC

---

## Technical Details

### Tool Signatures

All three search tools now accept `preferred_token`:

```javascript
search_products(keywords, agent_id?, wallet_address?, preferred_token?)
search_by_intent(intent, agent_id?, wallet_address?, preferred_token?)
compare_cashback(product_query, agent_id?, wallet_address?, preferred_token?)
```

### Parameter Details

```
preferred_token: enum ['MON', 'BONK', 'USDC']
  - Optional
  - Defaults to 'MON' if not provided
  - Only used during initial registration
  - Passed to Fiber API as-is
```

### Updated Prompts

**Old:**
```
What's your wallet address?
```

**New:**
```
What's your wallet address (0x...)?

Optional: What's your preferred reward token?
- MON (default, recommended)
- BONK (community token)
- USDC (stablecoin)

If you don't specify, MON will be used.
```

---

## Backward Compatibility

✅ **Fully backward compatible**

- If user doesn't provide `preferred_token` → defaults to MON
- Old searches without this parameter still work
- Existing agents continue earning in their original token

---

## Examples

### Example 1: Default (MON)

```
You: "Find running shoes"
Claude: [asks for wallet]
You: "0x1234..."

→ Registered with MON (default)
→ All earnings in MON
```

### Example 2: Choose BONK

```
You: "Find running shoes"
Claude: [asks for wallet and token]
You: "0x1234... BONK"

→ Registered with BONK
→ All earnings in BONK
```

### Example 3: Choose USDC (Stablecoin)

```
You: "Find Nike shoes"
Claude: [asks for wallet and token]
You: "0x5678... USDC"

→ Registered with USDC
→ All earnings in USDC (stable value)
```

---

## Why This Matters

### For Users
- **Choice** → Pick the token that makes sense for your situation
- **Stability** → USDC for predictable value
- **Community** → BONK if you're part of that ecosystem
- **Default** → MON is still the recommendation

### For FiberAgent
- **Flexibility** → Supports multiple token ecosystems
- **User Retention** → Users stay if they prefer their chosen token
- **Future-Ready** → Easy to add more tokens later

---

## Adding More Tokens (Future)

When we want to support additional tokens, just:

1. Update enum in tool schemas:
   ```javascript
   preferred_token: z.enum(['MON', 'BONK', 'USDC', 'SOL', 'ETH'])
   ```

2. Update prompts:
   ```
   - MON (default)
   - BONK
   - USDC
   - SOL (Solana)
   - ETH (Ethereum)
   ```

3. Fiber API handles the rest (if it supports them)

---

## Commit Details

**Hash:** `10ef154`
**Title:** ADD FEATURE: Token preference selection (MON, BONK, USDC)

**Files Changed:**
- `/api/mcp.js`
  - Added `preferred_token` parameter to all search tools
  - Updated wallet setup prompts
  - Updated tool schemas
  - Pass token to Fiber API during registration

**Deployment:**
- ✅ Pushed to GitHub
- ✅ Vercel auto-deploying (~30 sec)

---

## Testing

**After Vercel deploys (~30 sec):**

1. **Test with MON (default):**
   ```
   You: "Find Nike shoes"
   Claude: [Asks for wallet, show token options]
   You: "0x1234..."
   → Should register with MON
   ```

2. **Test with BONK:**
   ```
   You: "Find Adidas shoes"
   Claude: [Asks for wallet]
   You: "0x1234... BONK"
   → Should register with BONK
   ```

3. **Test with USDC:**
   ```
   You: "Find winter coats"
   Claude: [Asks for wallet]
   You: "0x1234... USDC"
   → Should register with USDC
   ```

---

**Status:** ✅ Live and ready for testing!
