# FiberAgent Bug Audit — 2026-04-27

Audit of `fiber-shop-landing/api/mcp.js` and `skills/fiberagent/index.js` performed during Fiber MCP v1.2 planning. All issues are fixable; severity 1–10 (10 = production-breaking).

Status legend: 🔴 not fixed · 🟡 in progress · 🟢 fixed

---

## Critical (severity 8–10)

| # | Sev | Status | Issue | Location | Fix |
|---|-----|--------|-------|----------|-----|
| 1 | 9 | 🔴 | `get_agent_stats` calls `/agent/stats?agent_id=X` → HTTP 404. Correct path is `/agent/:id/stats`. | mcp.js:1167, possibly 732 | Change URL to `${FIBER_API}/agent/${encodeURIComponent(agentId)}/stats` |
| 2 | 9 | 🔴 | `FETCH_PRIVATE_KEY` and `FETCH_WALLET` committed to public repo. May be a real key — wallet `0x790b405d...`. | .env.example | Niko asks Laurent. If active, rotate + add `.env*` to `.gitignore` |
| 3 | 8 | 🔴 | `PRODUCTS` referenced but never defined. Resource handlers (`merchant-catalog`, `cashback-rates`) crash at runtime. | mcp.js:1286, 1296 | Replace with `FALLBACK_PRODUCTS` or fetch from backend |
| 4 | 8 | 🔴 | In-memory `agents = {}` map dies on every Vercel cold start. Causes "agent not found in this session" for returning users; fragments identity. | mcp.js:142, used 1099/1163 | Delete map entirely; look up by agent_id from backend on every call |

## High (severity 6–7)

| # | Sev | Status | Issue | Location | Fix |
|---|-----|--------|-------|----------|-----|
| 5 | 7 | 🔴 | Random `claude-${rand}` agent_id generated client-side instead of letting backend generate `agent_${hex}`. Wrong format, creates orphan agents per call. | mcp.js:953, 1032, 1231 | Don't pass agent_id on register; use backend-returned value |
| 6 | 7 | 🔴 | mcp.js and skill index.js use different endpoint shapes (one has the broken stats URL, one doesn't). Two codebases drift apart. | both files | Shared `core/` module (Chunk 3) |
| 7 | 6 | 🔴 | Markdown image injection: `![](${p.image})` with unsanitized URLs from Fiber API. Malicious merchant could inject `javascript:` or odd data URIs. | mcp.js:121 | Validate URL starts with `http://` or `https://` before embedding |
| 8 | 6 | 🔴 | Silent fallback to 5 hardcoded Nike shoes when Fiber returns nothing. User thinks they got real data. Partly responsible for the UGREEN UX failure. | mcp.js:984, 1071 | Return explicit "API unavailable" / `match_type: no_match`. Aligns with v1.2 honest-empty-states design. |
| 9 | 6 | 🔴 | `register_agent` direct-path body omits `preferred_token` field — token preference silently lost when calling register_agent directly. | mcp.js:1110 | Include `preferred_token` in request body |
| 10 | 6 | 🔴 | `await response.json()` can throw on malformed responses; error objects may lack `.error`/`.message`. Confusing "Cannot read property" errors. | multiple | Wrap with fallback: `const data = await response.json().catch(() => ({}))` |

## Medium (severity 4–5)

| # | Sev | Status | Issue | Location | Fix |
|---|-----|--------|-------|----------|-----|
| 11 | 5 | 🔴 | Wallet address case-sensitivity mismatch: skill lowercases, mcp.js doesn't. Same wallet (different case) = different agent. | mcp.js (no normalization), skill index.js:263 | Normalize to lowercase before any backend call |
| 12 | 5 | 🔴 | `compare_cashback` handler may fall through with undefined `agent_id` if registration response is malformed. | mcp.js:835-862 | Guard against missing `fiberResponse.agent_id` |
| 13 | 4 | 🔴 | mcp.js accepts wallet_address with no format validation; skill has `isValidWallet()` regex. | mcp.js multiple lines | Add `/^0x[a-fA-F0-9]{40}$/` check (and Solana base58 alt) |
| 14 | 4 | 🔴 | Tool schema duplicated: info-page JSON block (lines 166-234) and `server.tool(...)` registrations (922+). Already drifted (`product_name` vs `product_query`). | mcp.js | Single source of truth in core/ (Chunk 3) |
| 15 | 4 | 🔴 | Raw backend error strings (`error.error \|\| error.message`) returned to LLM. Could expose stack traces. | mcp.js:962, 1118, 1138, etc. | Log server-side, return generic message client-side |
| 16 | 4 | 🔴 | `.env.fiber.prod`, `.env.fiber.test` committed publicly. Agent IDs aren't secrets but shouldn't be in repo. | repo root | Move out of repo, add to `.gitignore` |
| 17 | 4 | 🔴 | No `.gitignore` entry for `.env*` — risk of future credential commits. | .gitignore | Add `.env*` with exception for sanitized .env.example |
| 18 | 4 | 🔴 | JSON-RPC error handler returns raw `err.message` to client. | mcp.js:902, 1329 | Sanitize before returning |

## Low / polish (severity 1–3)

| # | Sev | Status | Issue | Location | Fix |
|---|-----|--------|-------|----------|-----|
| 19 | 3 | 🔴 | Token coercion silently defaults to MON if `preferred_token` missing — user choice dropped without notification. | mcp.js:955 | Either error or surface the default explicitly |
| 20 | 3 | 🔴 | Inconsistent URL encoding on wallet addresses (encoded sometimes, not others). Wallets with `+`/`&` rare but break. | multiple | Encode consistently |
| 21 | 2 | 🔴 | GET requests set `Content-Type: application/json` (non-standard, harmless). | mcp.js:33, 1170 | Remove `headers` from GET fetch options |
| 22 | 2 | 🔴 | Comment claims "stateless mode: no session tracking" but code uses in-memory `agents` map. Self-contradictory. | mcp.js:8, 142 | Delete the map (see #4); update comment |
| 23 | 2 | 🔴 | `isFoundingAgent` UI badge depends on `fiberResponse.founding_agent` field that may not be populated by backend. | mcp.js:1136 | Verify backend returns it; default to non-founding gracefully |
| 24 | 1 | 🔴 | `extractKeywords()` / `extractMaxPrice()` defined but only used in `search_by_intent`; `search_products` ignores intent parsing. Dead-ish branch. | mcp.js:106-114 | Either reuse in search_products or remove |

---

## Where these fit in the v1.2 chunk plan

- **Chunk 1 (expanded scope):** Bugs #1, #2 (Niko coordinates with Laurent), #3, #4, #7, #8, #11, #16, #17 — the production-breakers and security-critical items.
- **Chunk 1B (extension):** Bugs #5, #9, #10, #12, #13, #15, #18 — identity / error handling correctness. Same PR or follow-up commit, depending on size.
- **Chunk 3 (core refactor):** Bug #6, #14 — go away naturally when shared `core/` module lands.
- **Chunk 4 (drop wallet gating + match_type):** Bug #8 partially — silent fallback gets replaced by `match_type: no_match` honest empty states. Coordinated with v1.2 design.
- **Polish chunk (or last commit of Chunk 1B):** #19, #20, #21, #22, #23, #24.

## Open questions for Laurent

- Bug #2: Is `FETCH_PRIVATE_KEY=0x3da0...` a real key? If yes, rotate immediately. Wallet `0x790b405d466f7fddcee4be90d504eb56e3fedcae` — used on Monad?
- Bug #5: Backend's expected agent_id format — `agent_${hex}` only, or does it accept arbitrary strings?
- Bug #14: Single-source-of-truth schema — backend OpenAPI/Swagger output we can pull from, or do we own the schema in MCP?
- Bug #23: Does `/agent/register` response include `founding_agent` field?
