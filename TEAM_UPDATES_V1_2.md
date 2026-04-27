# Fiber MCP v1.2 — Team Updates

A 50,000-foot view of the v1.2 overhaul, for the whole team (technical and non-technical). Updated with each PR.

**Started:** 2026-04-27 · **Status:** in active development · **Repo:** [`fibershop/FiberAgent`](https://github.com/fibershop/FiberAgent)

---

## What is v1.2?

A major overhaul of the Fiber MCP — the bridge that connects Claude, ChatGPT, Cursor, and other AI assistants to Fiber's cashback network. Today's MCP requires every user to share a crypto wallet just to *browse* products, which loses ~90% of mainstream users at "what's a wallet?" v1.2 fixes that, clears a backlog of production bugs, and adds new capabilities — multi-store price comparison ranked by best total deal, cross-LLM wishlists, and "how much have I earned?" working in any chat — that no other shopping AI can match. Aimed at fundraising-quality demo readiness.

---

## Critical Bug Fixes — PR #1
**Status:** ✅ Pushed for review · awaiting Laurent + Ijaz · production unchanged until merged

### What was broken

- **"Show my cashback earnings" returned a server error in production.** Users couldn't see their earnings at all — silent failure.
- **Two of the MCP's data feeds crashed when accessed** (the merchant catalog and top cashback rates).
- **A real-looking private key was committed to the public GitHub repo** months ago.
- **The system was using in-memory user tracking that doesn't survive cold starts** on Vercel, so returning users hit "agent not found" errors.

### Where each stands now

1. Earnings endpoint — **fixed.** Verified end-to-end: real cashback data flows correctly. Round-trip with Niko's test wallet returned 3 purchases tracked, $12.31 pending payout.
2. Resource crashes — **fixed.**
3. Sensitive credentials — **partly addressed.** Removed from current files and `.gitignore` tightened so it can't recur. **Needs Laurent's input:** verify whether the wallet was used on-chain and rotate it if so. Removing the file does not undo git history.
4. In-memory tracking — **first slice removed** in PR #1 (the part gating the earnings endpoint). Full removal continues in the next PR.

### What also went in

Local testing infrastructure that lets us iterate on the MCP without redeploying. Future fixes are now end-to-end testable in seconds. Plus a working bug audit (24 issues catalogued, scored 1–10) so progress is legible to anyone joining mid-stream.

---

## Remaining Bug Fixes — PR #2 (planned, in progress)
**Status:** 📋 Plan committed locally, ready to execute

### What's still broken or missing

- Solana wallets are being assigned **MON (Monad-EVM)** as their reward token by default — but MON physically can't be received on a Solana wallet. The user is silently set up to fail.
- **Wallet validation only accepts EVM format.** Solana wallets like Niko's (`3gKwr…`) would be rejected by stricter checks.
- The registration call is sending **the user's name in the wrong field**, so the backend stores agent_name as `null` and earnings dashboards show "Agent" instead of the real name.
- Some **error messages leak raw backend stack traces** to users.
- Several smaller correctness issues from the bug audit (wallet case handling, URL encoding, dead code, broken comparison flow).

### What PR #2 will deliver

- Smart token defaults: EVM wallets get MON, Solana wallets get USDC. User can override.
- Wallet validation that supports both EVM (`0x…`) and Solana base58 (`3gKwr…`) formats.
- Registration call sends the right fields, so names persist to the backend.
- Cleaner error messages — backend stack traces stay in logs, not user-facing.
- Complete removal of the broken in-memory tracking across all four search/comparison/registration tools.

Estimate: about half a day of focused work.

---

## What's coming after

Each row below becomes its own PR, batched at coherent review boundaries (~6–7 PRs total across the v1.2 build to keep the review burden reasonable).

| PR | Title | What it does (plain English) |
|----|-------|------------------------------|
| 3 | Test harness + code restructure | Internal scaffolding so we can replay scripted Claude conversations against the MCP and catch regressions automatically. Also restructures the codebase to enable Claude Desktop support. |
| 4 | Multi-merchant comparison + honest empty states | When a user asks for "Nike Dunks Pandas," the MCP returns 5 stores side-by-side ranked by best total price after cashback. If a product isn't in our network, we say so honestly — no more silently substituting random results. |
| 5 | Cashback balance tool + purchase confirmation flow | "How much have I earned?" works in any chat (just provide email or wallet). Buying a product shows a summary card before generating the tracked URL. |
| 6 | Wishlist + price alerts as cross-LLM resources | **Killer demo.** Save a wishlist in Claude → get a price-drop alert in Cursor. Only the MCP architecture can deliver this — no other shopping AI has cross-LLM continuity. |
| 7 | Remaining tools + behavioral ranking | Search results ranked by user history. "Shop at Newegg" intent tool. "Track external choice" learns when a user buys outside Fiber and why. |
| 8 | Claude Desktop support + skill mirror | Native integration with Claude Desktop's MCP. Sync the OpenClaw skill to the new feature surface. |
| 9 | Backend specs handed to Laurent + Tim | DB and API contracts to support the user-facing features above. |
| 10 | End-to-end verification + fundraising demo prep | All scenarios run through the harness; manual smoke on Claude Desktop and ChatGPT custom connector. Demo-ready. |

---

## How we work

- **Code is built in small, self-contained slices** — each ends in a working, tested state with a handoff doc, so the project survives session changes and team handoffs cleanly.
- **PRs are batched at coherent review boundaries** to avoid review fatigue. Targeting ~6–7 PRs total across v1.2 (not one per slice).
- **Validation:** live local-server testing with curl probes today; from PR #3 onward, an automated Python harness runs scripted Claude conversations against the MCP for regression coverage.
- **Approval flow:** Niko approves direction before any branch is pushed. Laurent + Ijaz review code in PRs. Nothing reaches production without their merge.

---

## Reference (for the curious)

- [`BUG_AUDIT.md`](./BUG_AUDIT.md) — every issue scored, with file/line references, severity, and recommended fix.
- [`CHUNK_01A_HANDOFF.md`](./CHUNK_01A_HANDOFF.md) — what was in PR #1, how to verify, what's deferred.
- [`CHUNK_01B_PLAN.md`](./CHUNK_01B_PLAN.md) — commit-by-commit execution plan for PR #2.

(Internal-doc filenames use "Chunk" — that's our working term during dev. PR names and team comms drop it.)
