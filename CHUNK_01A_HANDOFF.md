# Chunk 1A — Handoff

**Branch:** `v1.2-chunk-01-bug-fixes`
**Status:** Ready for review
**Date:** 2026-04-27
**Part of:** Fiber MCP v1.2 overhaul (see [`/Users/Oracle/.claude/plans/quirky-frolicking-mist.md`](../../../.claude/plans/quirky-frolicking-mist.md) for the full plan)

## Scope of this PR

Production-breaking bug fixes + repo hygiene + local dev wrapper. This is the first half of "Chunk 1" — split into 1A and 1B because the full in-memory `agents` map removal turned out to span 20 references across two parallel handler implementations and warranted its own focused chunk.

## What's done (4 commits)

### 1. Env hygiene + bug audit
- Sanitized `.env.example`: removed real-looking `FETCH_PRIVATE_KEY` (`0x3da0...`) and `FETCH_WALLET` (`0x790b405d...`), now empty placeholders.
  - **⚠️ The original key/wallet are in git history.** If they're real, only rotating the wallet on-chain is a real fix. **Action item for Laurent:** verify whether `0x790b405d466f7fddcee4be90d504eb56e3fedcae` has been used and rotate if so.
- Untracked `.env.fiber.prod`, `.env.fiber.test`, `.env.erc8004` via `git rm --cached` (local files preserved).
- Added `.env.fiber.*` and `.env.erc8004` to `.gitignore` to prevent re-add.
- Added `BUG_AUDIT.md` cataloguing all 24 bugs found, scored 1–10. This is the working punch list for Chunk 1A and 1B.

### 2. Local dev wrapper
- Added `fiber-shop-landing/dev-server.mjs` — thin Express wrapper around the Vercel `mcp.js` handler.
- Run with `node fiber-shop-landing/dev-server.mjs` (after `npm install` in `fiber-shop-landing/`).
- Endpoint: `http://localhost:3001/api/mcp`. Health: `http://localhost:3001/health`.
- Lets us iterate on `mcp.js` and verify fixes against running code, not just diffs.

### 3. Bug #3 — `PRODUCTS` undefined (severity 8)
- Two MCP resources (`fiber://merchants/catalog`, `fiber://rates/top`) referenced an undefined `PRODUCTS` variable. Crashed at runtime.
- Replaced with `FALLBACK_PRODUCTS` (the only catalog actually defined).
- Limitation: these resources now serve from the 5-item hardcoded fallback. Wiring them to real backend merchant data is deferred to Chunk 4 (alongside `match_type` rollout).

### 4. Bug #1 + partial #4 — `get_agent_stats` URL + drop session-bound lookup
Three coupled fixes in both the manual JSON-RPC handler (lines 717-788) and the SDK-based one (lines 1143-1199):

1. URL was `/agent/stats?agent_id=X` → HTTP 404. Backend route is `/agent/:id/stats`.
2. SDK handler bailed early with "Agent not found in this session" when the agent wasn't in the in-memory map. On Vercel cold starts the map is always empty, so valid agent_ids returned by `register_agent` failed on the next call. Removed the session-bound check.
3. Response parsing read the wrong fields (`fiberStats.data.pending_earnings`, etc). Backend actually returns `{ stats: { total_purchases_tracked, total_earnings_usd, pending_payout_usd, ... } }`. Updated parsing.

`agent_id` is now required (was `.optional()` with a broken "uses last-registered" fallback).

## How to verify (reviewer's smoke test)

Install dependencies and start the local dev server:

```bash
cd fiber-shop-landing
npm install
node dev-server.mjs
# Server listens on http://localhost:3001
```

In another terminal, run these against the local server:

```bash
# 1) Health check
curl -s http://localhost:3001/health
# Expect: {"ok":true,"server":"mcp-dev",...}

# 2) Resources work (no PRODUCTS crash)
curl -s -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"resources/read",
       "params":{"uri":"fiber://merchants/catalog"}}'
# Expect: valid JSON with merchant catalog. Before fix: error "PRODUCTS is not defined".

# 3) get_agent_stats works against real prod agent
curl -s -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"get_agent_stats",
                 "arguments":{"agent_id":"agent_2dbf947b6ca049b57469cf39"}}}'
# Expect: real data — "FiberAgent Production Test" name,
# wallet 0x0699bE7e51c21F27e70164c2a1aA76E85B2e5343,
# joined 2026-02-24, earnings/pending payout fields.
# Before fix: HTTP 404 or "Agent not found in this session" depending on path.

# 4) Edge case: missing agent_id
curl -s -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call",
       "params":{"name":"get_agent_stats","arguments":{}}}'
# Expect: clean error — "agent_id is required..."
```

## Known issues / deferred to Chunk 1B

The remaining 15 items in `BUG_AUDIT.md` are deferred:

- **#4 full** — in-memory `agents` map removal across the other 18 references (search/register/compare handlers in both manual and SDK paths).
- **#5** — random `claude-${rand}` agent_id generation (let backend generate).
- **#7** — markdown image URL injection (validate `http(s)://`).
- **#8** — silent fallback to FALLBACK_PRODUCTS for real queries (replace with honest empty states + `match_type`).
- **#9** — `register_agent` direct path drops `preferred_token`.
- **#10** — `await response.json()` can throw without proper error wrapping.
- **#11, #13** — wallet case normalization + format validation.
- **#12** — `compare_cashback` registration await chain.
- **#15, #18** — sanitize backend error messages before returning to LLM.
- **#19** — surface token defaulting explicitly.
- **#20** — consistent URL encoding.
- **#21, #22, #23, #24** — polish (GET headers, stale comment, founding_agent fallback, dead helpers).

Plus structural items deferred to later chunks:
- **#6, #14** — schema duplication and skill drift go away when shared `core/` module lands in Chunk 3.

## Files changed

- `.env.example` — sanitized
- `.env.erc8004`, `.env.fiber.prod`, `.env.fiber.test` — untracked (still on disk)
- `.gitignore` — added `.env.fiber.*` and `.env.erc8004` patterns
- `BUG_AUDIT.md` — new
- `fiber-shop-landing/dev-server.mjs` — new
- `fiber-shop-landing/api/mcp.js` — bug fixes (4 lines: PRODUCTS x2, plus the get_agent_stats refactors)
- `CHUNK_01A_HANDOFF.md` — this file

## Open questions for Laurent

1. **Bug #2 follow-through:** Was `FETCH_PRIVATE_KEY=0x3da0...` ever real? If yes, rotate the corresponding wallet. Sanitizing `.env.example` doesn't undo git history.
2. **Confirm `/agent/:id/stats` response shape stays stable.** I parsed `data.stats.total_purchases_tracked`, `data.stats.total_earnings_usd`, `data.stats.pending_payout_usd`, `data.stats.wallet_address`, `data.stats.joined_date`, and top-level `data.agent_name`. Any of those scheduled to rename?
3. **Agent ID format question (relevant to Chunk 1B):** does `/agent/register` accept arbitrary `agent_id` strings in the request body, or does the backend always generate `agent_${hex}`? Current code passes `claude-${rand}`; I want to know if those are silently rejected/replaced or actually persisted.

## What Chunk 1B will do

Tackle the remaining 15 bugs in two or three commits:
- One commit for the full in-memory map removal across all handlers.
- One for identity correctness (random agent_id, wallet normalization/validation, register_agent token preservation).
- One for error handling + safety + empty states + polish.

Estimated 0.5–1 day of focused work in a fresh session.
