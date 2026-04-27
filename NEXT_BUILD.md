# Next Build — Pick This Up Cold

**Last updated:** 2026-04-27 · **Branch:** `v1.2-chunk-01b-remaining-bugs`

> If you're a fresh Claude session or a teammate stepping in, this is your entry point. Read this top-to-bottom (5 min), then start at "Do this next" below.

---

## What just happened (state of play)

- **PR #1 is open** at [fibershop/FiberAgent#1](https://github.com/fibershop/FiberAgent/pull/1) — Chunk 1A bug fixes (env hygiene, dev wrapper, `PRODUCTS` undefined fix, `get_agent_stats` URL + parse refactor). Awaiting review from Laurent + Ijaz. Production unchanged.
- **Local `v1.2-chunk-01b-remaining-bugs` branch** has 5 doc commits on top of 1A's tip. **No code commits yet.** The docs include the bug audit, the 1B execution plan, team updates, the keystone unification finding, and the Project 3 wallet-auth spec.
- **The work is now organized as four projects** (P1–P4). See [TEAM_UPDATES_V1_2.md](./TEAM_UPDATES_V1_2.md) for the team-facing summary.

---

## Hard deadline

**Wednesday 2026-04-29 — lunch demo with the Wildfire CRO.**

Audience is a commercial partner, not investors. They care about: real Wildfire-tracked URLs, real device-ID attribution, AI-driven shopping volume potential, friction-free UX. They will not be impressed by polish for polish's sake; they *will* respect honest "this is real, this works" with caveats.

Full audience context: see memory file `project_wildfire_demo.md` (auto-loads).

---

## Priority order

| | What | When |
|---|---|---|
| **P1** | Demo-critical bug fix subset (PR #2) | Tomorrow morning |
| **P2** | Project 2 demo MCP features + rehearsal | Tomorrow afternoon |
| **P3** | Backend unification (Laurent + Tim — not us) | After demo |
| **P4** | Web3 wallet login on fiber.shop (separate build) | After demo |

---

## Do this next (P1 — demo-critical bug fixes)

Goal: fix the bugs that block a clean demo with Niko's real Solana wallet `3gKwrMeS43Jp3JuUuj51BPPymXVQwkKVYA39YmkRgHJ9`. Skip the broader 1B cleanup — that comes after the demo.

**Branch you're already on:** `v1.2-chunk-01b-remaining-bugs`. Verify with `git -C /Users/Oracle/Desktop/Claude\ Code/Fiber\ MCP/FiberAgent status -b -s`.

**The four bugs that must land before demo:**

| Bug # | What | File | Severity |
|---|---|---|---|
| **#5** | Stop sending random `claude-${rand}` agent_id in register body. Let backend generate. | `mcp.js` lines 412, 942, 1031 (search/intent/compare register flows) | 7 |
| **#9** | `register_agent` direct path drops `preferred_token` and sends `agent_name` as `agent_id`. Fix request body fields. | `mcp.js` lines 668–671 (manual), `mcp.js` lines ~1106–1112 (SDK) | 6 |
| **#11 + #13** | Wallet validation accepts only EVM. Add Solana base58 support. Case-aware: lowercase EVM, preserve Solana. | New helpers `validateWallet()` / `defaultTokenForWallet()` near top of `mcp.js`. Apply at every wallet entry point. | 4-5 |
| **#7** | Markdown image URL injection — only allow `http(s)://` URLs in `formatResults`. | `mcp.js` line 121 | 6 |

**For each fix:** make the change → restart dev server (`node fiber-shop-landing/dev-server.mjs`) → curl-probe to verify before-vs-after. Commit with descriptive message + the verification snippet in the body. Keep commits small and reviewable.

**Verification suite for the demo flow specifically:**

```bash
# 1) Register Niko's Solana wallet — should succeed without sending bogus agent_id, with correct preferred_token, and accept the Solana format
curl -s -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"register_agent","arguments":{"wallet_address":"3gKwrMeS43Jp3JuUuj51BPPymXVQwkKVYA39YmkRgHJ9","preferred_token":"USD1","agent_name":"Niko"}}}'
# Expect: existing agent_a864f05266c7101ab7819bc5 returned, is_new: false, no errors

# 2) Search returns real Wildfire-tracked products
curl -s -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_products","arguments":{"agent_id":"agent_a864f05266c7101ab7819bc5","keywords":"USB-C peripheral switch","max_results":3}}}'
# Expect: real product results with affiliateUrl containing Wildfire device ID

# 3) Stats endpoint shows real $12.31 (carry-over from PR #1, should still work)
curl -s -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_agent_stats","arguments":{"agent_id":"agent_a864f05266c7101ab7819bc5"}}}'
# Expect: real earnings dashboard
```

**When done:** push branch, open PR #2 titled `v1.2 Chunk 1B (demo subset): identity correctness + wallet validation`. PR description should reference [BUG_AUDIT.md](./BUG_AUDIT.md) bugs #5, #7, #9, #11, #13 and note the broader 1B work continues post-demo.

**Estimated effort:** ~1.5 hours.

---

## Then this (P2 — demo MCP features + rehearsal)

After P1's PR #2 is up:

1. **Build a `lookup_my_account` flow** — when user provides email or wallet, MCP calls the existing endpoints (`/agent/by-email/:email` if it exists, or fall back to `/agent/:id/stats` keyed via wallet→agent_id resolution) and returns: balance, token preference, recent activity. This is the "remember me" experience.
2. **Honest data caveat in display** — for Niko's wallet, show both views: "API view: $12.31 ready" AND "Tokens received: 1,593 PENGU + 22.16 FP — see fiber.shop for full payout history." Acknowledges the unification gap (Project 3) without pretending.
3. **Rehearse the demo flow with Niko** running locally:
   - *"My wallet is 3gKwr..."* → MCP recognizes him
   - *"Find me USB-C peripheral switches"* → real Wildfire results
   - *"Compare Nike Dunks Pandas across stores"* → multi-merchant comparison
   - Click tracked URL → demonstrates Wildfire device ID embedded
   - *"How much have I earned?"* → real data with caveat

**Deliverable:** demo runs cleanly end-to-end on local dev wrapper; Niko confident in the script for Wednesday lunch.

**Estimated effort:** 2–3 hours.

---

## Reference docs (read in this order)

1. **[BUG_AUDIT.md](./BUG_AUDIT.md)** — every bug scored, with file/line refs and fix recommendations. Architectural gaps section explains the Monad-origin context.
2. **[CHUNK_01B_PLAN.md](./CHUNK_01B_PLAN.md)** — full commit-by-commit plan for 1B (more than the demo subset; the rest is post-demo).
3. **[TEAM_UPDATES_V1_2.md](./TEAM_UPDATES_V1_2.md)** — team-facing 50K-foot view. Useful if Niko asks for an updated team comm.
4. **[CHUNK_01A_HANDOFF.md](./CHUNK_01A_HANDOFF.md)** — what's in PR #1.
5. **[PROJECT_3_WEB3_WALLET_AUTH_SPEC.md](./PROJECT_3_WEB3_WALLET_AUTH_SPEC.md)** — input for P4 build (don't execute now).

Memory files auto-load:
- `project_wildfire_demo.md` — demo audience and MVP scope
- `project_mcp_webapp_unification.md` — keystone v1.2 architectural goal (P3)
- `project_fiberagent_origin.md` — Monad hackathon context, why "MON default" is a load-bearing bug
- `project_fiber_mcp_v1_2.md` — overall v1.2 design pillars
- `reference_niko_test_wallet.md` — Niko's Solana wallet for live-fire testing
- `feedback_*.md` — voice, release strategy, chunked handoff discipline

---

## After the Wildfire demo

Pull from the todo list — "Post-demo" entries cover:
- Complete remaining 1B bug fixes (in-memory map full removal, error handling cluster, polish)
- Extract v1.3 FPG spec from the plan-file appendix to its own doc
- Build the Python live-fire harness for regression coverage
- Doc cleanup: reorganize `TEAM_UPDATES.md` and `BUG_AUDIT.md` by 4-project structure

Memory and todos carry over. Pick up cold from this file again.

---

## Open questions for Laurent (carry over to his answers)

1. **Canonical balance endpoint** — what powers `app.fiber.shop/tokens`? MCP should query that, not `/agent/:id/stats`.
2. **Path to identity unification** — how do we link MCP-registered wallets to fiber.shop user accounts? (P3 architectural ask.)
3. **Transactional emails on purchase events** — does Fiber-API have a flow we can hook into, or is that new build?
4. **`FETCH_PRIVATE_KEY` rotation** — was the wallet `0x790b405d466f7fddcee4be90d504eb56e3fedcae` ever used? Rotate if so.
5. **`agent_name` persistence** — does `POST /agent/register` accept `agent_name` and persist it, or only on first registration?

Send to Laurent in a single focused message. (Niko has the wording authority; the next session can draft a paste-ready version on request.)
