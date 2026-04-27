# Project 3 Sub-Spec: Web3 Wallet Authentication for fiber.shop

**Status:** Draft, 2026-04-27 · **Owner:** Niko · **For:** Laurent, Tim
**Part of:** Project 3 (Merge MCP + web app — unified identity)

## Goal

Add wallet-based login to `fiber.shop` so a user who registered via the MCP with only a wallet address (no email) can log into the web app, see their profile, and access the full Fiber experience. After login, prompt them (soft, dismissable) to add an email for cashback notifications.

This is the missing piece in the Project 3 unification: today the web app supports email and OAuth registration. Wallet-only registrations created via MCP have no path to log in. After this spec is implemented, MCP-registered wallets become first-class fiber.shop accounts.

## User flows

### Flow 1: New wallet-only user (MCP registered, hasn't seen the web app)

1. User goes to `fiber.shop`, clicks **"Sign in with wallet."**
2. UI offers wallet-type choice (Solana → Phantom / Solflare / etc.; EVM → Metamask / Coinbase Wallet / etc.) or auto-detects.
3. User connects wallet, signs a Fiber login message (no gas, no transaction — just a signature).
4. Backend verifies signature against the wallet address. Matches against existing agent / user records.
5. If wallet was previously registered via MCP but no fiber.shop user account exists → create a user account, link the agent record(s) to it, log them in.
6. **Onboarding nudge:** *"Add an email so we can let you know when your cashback is ready and when it's paid to your wallet. (Optional — you can do this later in Settings.)"* Email field with **Add** and **Skip for now** buttons.
7. Land on profile page with their full account: balance, recent purchases, token preference, payout history.

### Flow 2: Returning wallet user (already has fiber.shop account)

1. Same login signature flow.
2. Backend matches signature → existing user. Log in.
3. Land on profile, no onboarding nudge.

### Flow 3: User with both email and wallet, mixing surfaces

1. User registered with email originally on fiber.shop.
2. Later uses MCP, gives same email or wallet.
3. MCP-side registration links to existing user.
4. User can log into fiber.shop with either method.

### Flow 4: User skipped email at signup, wants to add it later

1. In account settings, **Add email** option available.
2. Standard email verification flow (magic link or confirmation).
3. Email is now linked to existing user; notifications start flowing.

## Auth approach

**Recommend Direct: SIWE + SIWS implementation.** Two flows because Solana and EVM wallets sign differently:

### SIWE (Sign-In With Ethereum) — for Monad and other EVM wallets

- Standard: [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361)
- Backend issues a structured message with domain, address, nonce, timestamp.
- User wallet signs the message via `personal_sign` RPC.
- Backend verifies signature recovers the claimed address.
- Established libraries: `siwe` (npm, official EF-maintained).

### SIWS (Sign-In With Solana) — for Solana wallets

- No formal RFC equivalent of EIP-4361 for Solana, but established practice exists. Use Phantom's recommended pattern.
- Backend issues a nonce/message.
- User wallet signs via `signMessage` (Phantom, Solflare, Backpack all support).
- Backend verifies via `tweetnacl` or `@solana/web3.js`.

### Shared session pattern

After signature verification, issue a Supabase Auth session JWT (since Fiber-API already uses Supabase Auth). The JWT identifies the user; the wallet is stored as an auth method on the user record. Same session pattern as email-based auth — login method differs, downstream auth state is unified.

### Why not Privy / Dynamic / Web3Auth?

Considered. Trade-offs:
- **Pro:** ships faster, abstracts chain detection, supports more wallet types out of the box (incl. social-recovered embedded wallets).
- **Con:** ~$0.05–0.15/user/month at scale, vendor lock, "powered by Privy" branding undercuts Fiber's positioning as a multi-chain shopping platform.

Direct SIWE + SIWS is ~2 weeks of work for one engineer; Privy is ~3 days. Niko's call on the trade-off. Recommendation stays direct given v1.2's fundraising-narrative focus on Fiber as the integrated platform.

## Database changes

Assumes Fiber-API's existing Supabase Auth + `user_profiles` schema.

### New table: `wallet_auth_methods`

One user → many wallets (a user might have an EVM wallet AND a Solana wallet).

```sql
CREATE TABLE wallet_auth_methods (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address  VARCHAR(64)  NOT NULL,
  chain           VARCHAR(16)  NOT NULL,  -- 'evm' | 'solana'
  verified_at     TIMESTAMPTZ  DEFAULT NULL,  -- when first signature verified
  is_primary      BOOLEAN      DEFAULT FALSE,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  last_used_at    TIMESTAMPTZ  DEFAULT NULL,
  UNIQUE(wallet_address, chain),
  INDEX(user_id)
);
```

### Existing `Agent` table (already in Prisma schema)

- `Agent.user_id` already exists (UUID FK to user_profiles, nullable). When wallet login happens for the first time and creates a user, populate `Agent.user_id` for any existing agents that share the wallet address.
- Add column `Agent.email VARCHAR(255) DEFAULT NULL` if not already there (per v1.1 spec).

### Migration path for existing MCP-registered agents

Backfill: for every existing `Agent` record with a `walletAddress` but no `user_id`, do nothing yet — just leave `user_id = NULL`. When that wallet's owner first logs in via SIWE/SIWS, the auth flow creates the user, links the agents, and the `user_id` gets backfilled then. Lazy migration. Simpler than mass backfill.

## API endpoints

### POST `/v1/auth/wallet/challenge`
- **Input:** `wallet_address`, `chain` (`evm` | `solana`)
- **Returns:** `{ message, nonce, expires_at }` — the structured message to sign, valid for 5 minutes.
- **Backend:** stores `nonce` keyed by wallet+chain in a short-lived cache (Redis, 5-min TTL).

### POST `/v1/auth/wallet/verify`
- **Input:** `wallet_address`, `chain`, `signature`, `nonce`
- **Logic:**
  1. Verify nonce is valid and unexpired.
  2. Verify signature recovers/matches `wallet_address`.
  3. Look up `wallet_auth_methods` by `(wallet_address, chain)`. If exists → fetch user. If not → create user + insert `wallet_auth_methods` row + link any existing `Agent` records with that wallet to the new user.
  4. Issue Supabase Auth JWT for the user.
  5. Update `last_used_at`, mark `verified_at` if first time.
- **Returns:** `{ access_token, refresh_token, user, is_new_user: bool }`

### POST `/v1/users/me/email`  *(authed)*
- **Input:** `email`
- **Logic:** sends magic link to email; on click, links email to current user. Standard email verification flow.

## Email / notification flow (post-login)

Once user logs in with wallet:

- **If user has email on file:** standard transactional emails for: cashback ready, cashback paid out, status changes, weekly summary.
- **If user has no email on file:**
  - First login: dismissable banner *"Add an email to get notified when your cashback is ready."*
  - Cashback events still happen on-chain (visible at `app.fiber.shop/tokens`) but no email goes out.
  - In-app notifications (if web app supports them) can be a fallback channel.

Recommend a dedicated `notification_preferences` table later for granular controls (cashback-ready, cashback-paid, weekly-summary, marketing). Out of scope for this spec.

## Edge cases

1. **Same user, two wallets, two MCP sessions:** user logs in with wallet A, then later registers wallet B via MCP. When they log into fiber.shop with wallet B, the auth flow finds an existing user (via wallet A's previous link) IF we can correlate the two. **Without an email bridge, we can't** — wallet B becomes a separate user. To merge later, user adds the same email to both accounts, then we offer an "merge accounts" flow. Out of scope for v1; flag as a known limitation.
2. **Wallet rotation / lost keys:** user loses access to wallet, can't log in. Email-only fallback if email is on file (magic link to email → option to add a new wallet). Without email or alternative wallet, account is unrecoverable. Standard wallet-auth limitation. Onboarding should make the email-recommendation explicit.
3. **Replay attacks:** nonce + 5-minute expiry mitigates this. Each nonce is single-use (deleted from cache after successful verify).
4. **Phishing:** a user signs a misleading message thinking it's a Fiber login. Mitigation: structured EIP-4361 message includes the domain (`fiber.shop`); wallet UIs surface this clearly. SIWS doesn't have the same standard but the message text should explicitly say "Login to Fiber.shop."
5. **Wallet collision:** two MCP users somehow registered the same wallet (shouldn't happen if backend dedup is working, but defensive). On wallet login, the user gets ALL agent records linked to that wallet — which is the correct behavior since wallet ownership is the identity bond.

## Out of scope (future work)

- Embedded / smart wallets (Privy, Magic.link) for users who don't have a wallet yet — separate v1.4+ initiative.
- Wallet-to-wallet account merging (when user has two accounts via two different wallets).
- Multi-factor: requiring both wallet signature AND email verification for high-value actions.
- Social login bridge (sign in with Google → wallet auto-derived). Different design.

## Open questions

1. Does Supabase Auth support custom auth methods natively, or do we use Supabase + a thin custom wrapper for the SIWE/SIWS verification step? (Probably the latter — Supabase issues the JWT after our backend confirms the signature.)
2. Wallet-type detection on the fiber.shop UI: do we want a **single "Connect Wallet"** button that auto-detects, or **"EVM Wallet" / "Solana Wallet"** buttons? Auto-detection is friendlier but trickier to implement.
3. What fields show on the wallet-only user's first profile view? Without email, no name, no avatar. Suggestion: show shortened wallet address (`3gKwr...RgHJ9`) as the display name until they personalize.
4. Notification preferences: do we want explicit opt-in for emails, or default opt-in with one-click unsubscribe?

## Estimated effort

Direct SIWE + SIWS implementation: **~2 weeks of focused backend work** for one engineer (Laurent or Tim) — challenge endpoint, verification logic for both chains, Supabase JWT integration, agent-record linking on first login, and frontend "Sign in with wallet" UI. Email-add flow on top adds ~3 days.

Privy/Dynamic alternative: **~3 days** for a working integration, but adds vendor dependency and ongoing per-user cost.

## Why this matters for v1.2 and the demo

The fundraising demo flow Niko described — "I shopped via Claude → I go to fiber.shop → I log in → I see my account" — fully works only if wallet-based login exists. Today, MCP-registered wallets have no path back into the web app. This spec closes that loop and is the missing piece in Project 3.

After Project 3 + this spec ship: a user can register with a wallet-only flow in MCP, accumulate cashback, then claim and view it in the web app via wallet sign-in. Adding an email is recommended (for notifications) but not required. Full continuity, two surfaces, one identity.
