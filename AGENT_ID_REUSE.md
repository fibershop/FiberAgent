# Agent ID Reuse: Eliminate Re-Registration (Commit ace3ebe)

## Problem Solved

Previously, Claude had to provide `wallet_address` on **every search**, causing a fresh registration each time:

```
Search 1: search_products(keywords: "shoes", wallet_address: "0x1234...")
          → Registers new agent_id
          → Returns results

Search 2: search_products(keywords: "socks", wallet_address: "0x1234...")  
          → Registers ANOTHER new agent_id (wasteful!)
          → Returns results
```

**Result:** Multiple agents registered for the same wallet (inefficient).

## Solution: Agent ID Reuse

Now Claude captures the `agent_id` from the first response and reuses it:

```
Search 1: search_products(keywords: "shoes", wallet_address: "0x1234...")
          → Response includes: "✅ Your Agent ID: claude-abc123"
          → Registers once, returns results

Search 2: search_products(keywords: "socks", agent_id: "claude-abc123")
          → NO registration (uses existing agent_id)
          → Instant results
```

**Result:** One agent per wallet, clean workflow.

---

## How It Works

### Tool Signatures (Updated)

```javascript
// OLD: Only wallet, always re-register
search_products(keywords, wallet_address)

// NEW: Prefer agent_id, fall back to wallet
search_products(keywords, agent_id?, wallet_address?)
search_by_intent(intent, agent_id?, wallet_address?)
compare_cashback(product_query, agent_id?, wallet_address?)
```

### Priority Logic

**If `agent_id` provided:**
- Use it directly (no registration, fastest)

**If only `wallet_address` provided:**
- Register and get `agent_id` (slower, but still works)

**If neither provided:**
- Error: "Need agent_id or wallet address"

---

## User Flow

### First Search
```
You: "Find Nike shoes"
Claude: "What's your wallet?"
You: "0x9f2d..."

Claude: search_products(keywords: "Nike shoes", wallet_address: "0x9f2d...")
Server: Registers → returns results + agent_id

Response:
  [Results table]
  
  ✅ Your Agent ID: claude-xyz789
  (Save this — use it for next search to skip registration!)
```

### Subsequent Searches (Same Conversation)
```
You: "Find Adidas running shoes"

Claude: [Remembers agent_id from previous response]
        search_products(keywords: "Adidas running shoes", agent_id: "claude-xyz789")
        
Server: [No registration needed]
        → Searches directly
        → Returns results instantly

Response:
  [Results table]
  (No agent_id notice this time—Claude already has it)
```

### Next Conversation (New Session)
```
You: "Find winter coats"

Claude: [No agent_id in history, asks for wallet again]
        "What's your wallet?"
        
You: "0x9f2d..."

Claude: search_products(keywords: "winter coats", wallet_address: "0x9f2d...")
        → Registers → returns results

[Cycle repeats]
```

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Searches per wallet** | Multiple agents | One agent |
| **Registration overhead** | Every search | Once per conversation |
| **Subsequent search speed** | Slow (re-register) | Fast (skip registration) |
| **Claude's job** | Pass wallet every time | Pass agent_id, skip registration |
| **Cleanliness** | Messy (multiple agents) | Clean (one agent) |

---

## Implementation Details

### Response Format (When Newly Registered)

```
## 🛍️ Search Results: "Nike shoes"

[Products table]

---
Source: 🔗 Fiber API Live
Earnings tracked to agent: claude-xyz789

✅ Your Agent ID: `claude-xyz789`
(Save this — use it for next search to skip registration!)

⬆️ Click 🛒 links above to earn cashback!
```

### Response Format (Using Existing Agent ID)

```
## 🛍️ Search Results: "Adidas shoes"

[Products table]

---
Source: 🔗 Fiber API Live
Earnings tracked to agent: claude-xyz789

⬆️ Click 🛒 links above to earn cashback!
```

Note: No agent_id callout when using existing agent.

---

## Technical Architecture

### Stateless Yet Efficient

**Previous architecture:**
- Stateless ✅ (no persistence between requests)
- Required wallet every time (inefficient)

**New architecture:**
- Stateless ✅ (no persistence between requests)
- Claude stores agent_id in conversation (efficient)
- Only first search incurs registration cost

**Key insight:** Claude's conversation memory **is** the persistent storage. We use it!

---

## What Changed

**File:** `/api/mcp.js`

**Changes:**
1. All three search tools now accept `agent_id` (optional)
2. If `agent_id` provided: use directly (no Fiber API call to register)
3. If only `wallet_address`: register and return `agent_id`
4. Tool descriptions updated to explain agent_id-first pattern
5. Response includes prominent agent_id callout when newly registered

**Updated tools:**
- `search_products` → accepts `agent_id`
- `search_by_intent` → accepts `agent_id`
- `compare_cashback` → accepts `agent_id`
- OpenAPI schemas updated

---

## Testing the Feature

**After Vercel deploys (~30 sec):**

1. **First search:**
   ```
   You: "Find Nike shoes"
   Claude: [asks for wallet]
   You: "0x9f2d..."
   ```
   Expected: Agent ID returned (e.g., `claude-abc123`)

2. **Second search (save the agent_id first):**
   ```
   You: "Now find Adidas shoes"
   Claude: [Uses agent_id from previous response, no wallet prompt]
   ```
   Expected: Results instantly (no registration re-prompt)

3. **Verify:**
   - Response should show different agent_id callout behavior
   - First search: Shows agent_id prominently
   - Second search: No callout (assumes Claude has it)

---

## Backward Compatibility

**All old patterns still work:**
- `search_products(keywords, wallet_address)` ✅ (just slower)
- `search_by_intent(intent, wallet_address)` ✅ (just slower)
- `compare_cashback(product_query, wallet_address)` ✅ (just slower)

Claude will naturally adopt the agent_id pattern because:
1. It's returned in responses (Claude sees it)
2. It results in faster searches (incentive to reuse)
3. It's in the tool descriptions (Claude learns it)

---

## Future Possibilities

If we add persistence (e.g., Redis), we could:

```javascript
// Option 1: Store agent_id → wallet mapping
const agentToWallet = { 'claude-abc123': '0x9f2d...' }

// Option 2: Allow Claude to look up agent by wallet
search_products(keywords, wallet: "0x9f2d...")
→ Check cache → find agent_id → skip registration

// Option 3: Persistent agent profiles
User creates account → gets permanent agent_id → can use across chats
```

But for now, stateless + Claude's conversation memory = perfect balance. ✨

---

## Commit

**Hash:** `ace3ebe`
**Title:** IMPROVEMENT: Accept agent_id for reuse, avoid re-registration on every search
**Deployed:** ✅ To Vercel (auto-deploy in progress)

---

**Result:** Cleaner, faster, more efficient searches without sacrificing simplicity. 🚀
