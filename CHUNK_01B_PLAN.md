# Chunk 1B — Execution Plan

**Branch:** `v1.2-chunk-01b-remaining-bugs` (off 1A tip)
**Status:** Plan only, no code commits yet
**Picks up from:** [`CHUNK_01A_HANDOFF.md`](./CHUNK_01A_HANDOFF.md), [`BUG_AUDIT.md`](./BUG_AUDIT.md)

A fresh session can read this file + the bug audit and execute without re-deriving any context. Each commit below is an independent slice with its own verification step. After all commits land, write `CHUNK_01B_HANDOFF.md`, push the branch, open PR #2.

## Goal

Finish the bug-fix slice of Chunk 1: complete in-memory `agents` map removal across all 4 remaining tool handlers (in both the manual JSON-RPC and SDK code paths in `mcp.js`), correct the registration request body, add proper wallet validation, harden error handling, and polish.

## Why this is split from 1A

1A shipped the smallest valuable subset (env hygiene, dev wrapper, `PRODUCTS` undefined, `get_agent_stats` URL + parse). Surveying the rest revealed the in-memory map sprawls across 8 writes, ~6 reads, and 2 wallet-lookup early-return blocks in two parallel handler implementations — a bigger surgery than 1A's scope justified. Splitting kept 1A reviewable and small.

## Code structure reminder

`fiber-shop-landing/api/mcp.js` has two complete tool-handler implementations:
- **Manual JSON-RPC handler:** lines ~146–908. Hit when client doesn't send proper SSE Accept headers, or as a fallback path. Uses raw `res.json(...)` returns.
- **SDK handler:** lines ~909–1322. Uses `server.tool(...)` registrations against the `@modelcontextprotocol/sdk`. Primary path for proper MCP clients.

Both must be kept in sync until Chunk 3 extracts shared logic into `core/`. Each commit below changes BOTH paths for the same tool.

## Per-commit plan

### Commit 1B-1 — `search_products` handler refactor

**Files:** `fiber-shop-landing/api/mcp.js`

**Manual path (`case 'search_products':`, ~lines 367–494):**
- Line ~373–375: delete the "last-registered" fallback. Replace `let agent_id = args?.agent_id || Object.values(agents).sort(...)...` with `let agent_id = args?.agent_id;`
- Line 412: drop the `agent_id: \`claude-${rand}\`` field from the register body (let backend generate). Backend dedupes by wallet anyway; we observed `is_new: false` round-trip behavior.
- Lines 434–441: delete the entire `const localKey = ...; agents[localKey] = {...};` block. Keep `agent_id = fiberResponse.agent_id;`.
- Lines 471–474: in the wallet-fallback `catch`, replace the `Object.values(agents).find(...)` lookup with `agentWallet = '(wallet on file)';` since we no longer keep local copy.

**SDK path (`server.tool('search_products', ...)`, ~lines 922–983):**
- Line 942: drop the `agent_id: \`claude-${rand}\`` field from the register body.
- Lines 954–961: delete the `const localKey = ...; agents[localKey] = {...};` block. Keep `finalAgentId = fiberResponse.agent_id;`.

**Verify:**
```bash
# Restart dev server, then:
curl -s -X POST http://localhost:3001/api/mcp -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_products","arguments":{"keywords":"running shoes","wallet_address":"3gKwrMeS43Jp3JuUuj51BPPymXVQwkKVYA39YmkRgHJ9","preferred_token":"USDC","max_results":3}}}'
```
Expect: results returned, no errors, response includes the agent_id from backend (not `claude-${rand}`).

### Commit 1B-2 — `search_by_intent` handler refactor

**Manual path (~lines 495–635):**
- Lines 512–514: same "last-registered" fallback removal as 1B-1.
- The body in lines ~547 (need to verify): drop the random `claude-` agent_id field.
- Lines 573–580: delete the `const localKey = ...; agents[localKey] = {...};` block.
- Lines 608–611: replace local-map fallback in catch with default string.

**SDK path (~lines 986–1086):**
- Line ~1023: drop random `claude-` agent_id field.
- Lines ~1033–1041 (the agents[localKey] write): delete.

**Verify:** intent query returns results without crashing.

### Commit 1B-3 — `register_agent` handler refactor + body fix (closes bug #5, #9, #13 partial, new agent_name bug)

**Manual path (`case 'register_agent':`, ~lines 636–716):**
- Lines 648–661: delete the "Already registered locally" early return (depends on the now-empty map).
- Lines 668–671: rewrite request body. Currently:
  ```js
  body: JSON.stringify({
    agent_id: agent_name,         // bug: sends agent_name as agent_id
    wallet_address: wallet_address // bug #9: missing preferred_token
  })
  ```
  Should be:
  ```js
  body: JSON.stringify({
    wallet_address,
    preferred_token: defaultTokenForWallet(wallet_address, args?.preferred_token),
    ...(agent_name ? { agent_name } : {})
  })
  ```
- Lines 686–697: delete the `const localAgentId = ...; agents[localAgentId] = {...};` block.

**SDK path (`server.tool('register_agent', ...)`, ~lines 1088–1141):**
- Lines 1099–1102: delete the "Already registered" early return.
- Lines ~1106–1112: same body fix as manual path.
- Lines 1124–1134: delete the `agents[localKey] = {...}` block.

**New helper to add (top of file, near line ~140):**
```js
function defaultTokenForWallet(wallet, userPref) {
  if (userPref) return userPref;
  // EVM wallet → MON (Monad-EVM default)
  if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) return 'MON';
  // Solana base58 wallet → USDC (works on Solana, neutral default)
  return 'USDC';
}
```

**Verify:** register Niko's Solana wallet — confirm `preferred_token: USDC` is sent, and backend stores `agent_name` correctly (compare round-trip with raw curl as in 1A).

### Commit 1B-4 — `compare_cashback` handler refactor + await fix (closes bug #4 final, #12)

**Manual path (`case 'compare_cashback':`, ~lines 789–908):**
- Lines 794–800: delete "last-registered" fallback.
- Line ~840 register body: drop random `claude-` agent_id.
- Lines ~841–848: delete `agents[localKey] = {...}` write.
- **Bug #12 fix:** verify that the registration `await fetch(...)` chain completes before any downstream `searchViaBackend(...)` call uses `agent_id`. If not, restructure with explicit `await`.

**SDK path (`server.tool('compare_cashback', ...)`, ~lines 1201–1280):**
- Line ~1231: drop random `claude-` agent_id.
- Lines ~1244–1250: delete `agents[localKey] = {...}` write.

**Verify:** compare query returns multi-merchant results, no `undefined` agent_id in any response.

### Commit 1B-5 — Final cleanup: delete `const agents = {}`, update header comment

**Files:** `fiber-shop-landing/api/mcp.js`

- Line 142: delete `const agents = {};` entirely. After 1B-1 through 1B-4 there should be zero references left. Verify with `grep -n "agents\\[\\|agents\\b" fiber-shop-landing/api/mcp.js | grep -v FALLBACK_PRODUCTS` — should return only comments/strings, no live code references.
- Update the header doc comment around line 8: change `Stateless mode: no session tracking (Vercel serverless)` from aspirational to accurate. Drop the in-memory note in `// In-memory store (session-scoped, per MCP client)` (was around line 139–141).

**Verify:** file still parses (`node -c fiber-shop-landing/api/mcp.js`), dev server still starts cleanly.

### Commit 1B-6 — Wallet validation + case-aware normalization (closes #11, #13)

**New helpers (top of file):**
```js
function isEvmWallet(w) { return /^0x[a-fA-F0-9]{40}$/.test(w); }
function isSolanaWallet(w) {
  // Base58: 32-44 chars, no 0/O/I/l, no leading 0x
  return !w.startsWith('0x') && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w);
}
function validateWallet(w) {
  if (!w || typeof w !== 'string') return null;
  if (isEvmWallet(w)) return w.toLowerCase();   // EVM is case-insensitive — normalize
  if (isSolanaWallet(w)) return w;              // Solana is case-sensitive — preserve
  return null;
}
```

Apply at every wallet entry point — search_products, search_by_intent, register_agent, compare_cashback, in both handler paths. If `validateWallet(input)` returns null, return a clean error: `❌ Invalid wallet format. Provide an EVM (0x...40 hex chars) or Solana base58 wallet address.`

**Verify:** Niko's Solana wallet validates and is preserved case-sensitively. Random invalid string returns the helpful error. EVM lowercase/uppercase variants resolve to same agent (round-trip dedup).

### Commit 1B-7 — Error handling cluster (closes #7, #10, #15, #18, #20)

- **#7 markdown image URL injection:** in `formatResults` at line ~121, validate `p.image` starts with `http://` or `https://` before embedding. If not, render `📦` instead.
- **#10 safe JSON parse:** every `await response.json()` becomes `await response.json().catch(() => ({}))`. ~10 occurrences across the file.
- **#15 + #18 sanitize error messages:** wrap raw backend error returns. Don't pass `error.error || error.message` to LLM output. Replace with generic strings like "Registration failed. Please try again." Log full error server-side via `console.error`.
- **#20 URL encoding consistency:** ensure every URL parameter (especially `wallet_address` and `agent_id`) goes through `encodeURIComponent()`. Audit and fix.

**Verify:** intentionally malformed responses (return non-JSON from a mock backend) don't crash; users get a clear retry message.

### Commit 1B-8 — Polish + handoff doc + push

- **#19 token coercion:** apply the `defaultTokenForWallet` helper everywhere `preferred_token || 'MON'` was used. Surface the chosen default in the response (e.g., "Defaulting to USDC for your Solana wallet — change with `register_agent` if you'd prefer BONK.").
- **#21 GET headers:** drop unnecessary `Content-Type: application/json` from GET fetch calls.
- **#22 stale comment:** already mostly addressed in 1B-5; sweep for any remaining "session-scoped" or "in-memory" references.
- **#23 founding_agent fallback:** in the register response template, default `founding_agent` to `false` if missing rather than rendering `undefined`.
- **#24 dead helpers:** check whether `extractKeywords()` and `extractMaxPrice()` are still used. If only by `search_by_intent` SDK, leave with a comment. If unused, delete.
- Write `CHUNK_01B_HANDOFF.md` mirroring the 1A format: scope, what's done, verification commands, files changed, what's next.
- `git push -u origin v1.2-chunk-01b-remaining-bugs`
- `gh pr create` against `main`. Mention dependency on PR #1 in the description (so reviewers know to merge in order, or rebase 1B onto main once 1A is merged).

## New bugs surfaced during 1A round-trip (folded into 1B)

- **Token default wrong for Solana wallets** — backend silently sets MON for any wallet. The `defaultTokenForWallet` helper (added in 1B-3 + 1B-8) addresses this.
- **`agent_name` sent as `agent_id` field** — backend then stores `null` for agent_name, leading to "Agent" displayed everywhere. Fixed in 1B-3.

## Open questions to resolve with Laurent before 1B merges

- Carry over from 1A: stats response shape stability, agent_id format expectations, FETCH_PRIVATE_KEY rotation status.
- New: does `POST /agent/register` accept `agent_name` field in body, and does it persist on existing agents or only first-time? (1A round-trip showed `agent_name: null` returned for existing agents — need to confirm backend behavior.)
- New: confirm Solana base58 wallet validation regex covers expected edge cases. Niko's wallet `3gKwrMeS43Jp3JuUuj51BPPymXVQwkKVYA39YmkRgHJ9` is 44 chars; some Solana wallets are 32. Range `{32,44}` should be safe.

## Estimated effort

8 commits, ~3–4 hours of focused work in a fresh session. Each commit is independently verifiable so progress is durable even if interrupted.
